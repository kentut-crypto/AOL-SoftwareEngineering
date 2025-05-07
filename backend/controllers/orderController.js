const Product = require("../models/productModel")
const Order = require("../models/orderModel")
const OrderItem = require("../models/orderItemModel")
const User = require("../models/userModel")

const createOrder = async (req, res) => {
    const userId = req.user.id
    const { items, totalPrice } = req.body

    try {

        const sellerId = items[0].productId ? (await Product.findByPk(items[0].productId)).sellerId : null

        for (let item of items) {
            const product = await Product.findByPk(item.productId)
            if (product.sellerId !== sellerId) {
                return res.status(400).json({ message: "All products in the order must be from the same seller" })
            }
        }

        const order = await Order.create({ userId, totalPrice })

        await Promise.all(items.map(async item => {
            const product = await Product.findByPk(item.productId)
            if (product) {
                await order.addProduct(product, {
                    through: {
                        quantity: item.quantity,
                        priceAtPurchase: item.price
                    }
                })
            }
        }))


        res.status(201).json({ message: "Order created", orderId: order.id })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to create order", error: err.message })
    }
}

const getOrderHistory = async (req, res) => {
    const userId = req.user.id

    try {
        const orders = await Order.findAll({
            where: { userId },
            include: {
                model: Product,
                as: "products",
                through: { attributes: ["quantity", "priceAtPurchase"] },
                attributes: ["id", "name", "price", "imageUrl"]
            },
            order: [["createdAt", "DESC"]]
        })

        res.status(200).json({ data: orders })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to fetch order history", error: err.message })
    }
}

const getSellerPendingOrders = async (req, res) => {
    const sellerId = req.user.id
    if (req.user.role !== "seller") return res.status(403).json({ message: "Only sellers can manage their incoming orders" })

    try {
        const orders = await Order.findAll({
            where: { status: "pending" },
            include: [
                {
                    model: Product,
                    as: "products",
                    where: { sellerId: sellerId },
                    attributes: ["id", "name", "price", "imageUrl"],
                    through: {
                        attributes: ["quantity", "priceAtPurchase"]
                    }
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "name", "imageUrl"]
                }
            ],
            order: [["createdAt", "DESC"]]
        })

        res.status(200).json({ data: orders })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to fetch seller orders", error: err.message })
    }
}

const acceptOrderItem = async (req, res) => {
    const { orderId } = req.params
    const sellerId = req.user.id

    if(req.user.role !== "seller") return res.status(403).json({ message: "Only sellers can manage orders" })

    try {
        const order = await Order.findByPk(orderId, {
            include: {
                model: Product,
                as: "products",
                through: { attributes: ["quantity"] }
            }
        })

        if (!order) return res.status(404).json({ message: "Order not found" })

        const unauthorizedProduct = order.products.find(product => product.sellerId !== sellerId)
        if (unauthorizedProduct) return res.status(403).json({ message: "Unauthorized order" })

        for (const product of order.products) {
            const orderItem = product.OrderItem
            if (product.stock < orderItem.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for product: ${product.name}`
                })
            }
        }

        for (const product of order.products) {
            const orderItem = product.OrderItem
            product.stock -= orderItem.quantity
            await product.save()
        }

        order.status = "completed"
        await order.save()

        res.json({ message: "Order accepted and stock updated" })    
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to accept order", error: err.message })
    }
}

const cancelOrderItem = async (req, res) => {
    const { orderId } = req.params
    const sellerId = req.user.id

    if(req.user.role !== "seller") return res.status(403).json({ message: "Only sellers can manage orders" })

    try {
        const order = await Order.findByPk(orderId, {
            include: {
                model: Product,
                as: "products",
                through: { attributes: [] }
            }
        })

        if (!order) return res.status(404).json({ message: "Order not found" })

        const unauthorizedProduct = order.products.find(product => product.sellerId !== sellerId)
        if (unauthorizedProduct) return res.status(403).json({ message: "Unauthorized order" })

        order.status = "canceled"
        await order.save()

        res.json({ message: "Order canceled" })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to cancel order", error: err.message })
    }
}

module.exports = {
    createOrder,
    getOrderHistory,
    getSellerPendingOrders,
    cancelOrderItem,
    acceptOrderItem
}