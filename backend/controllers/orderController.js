const Product = require("../models/productModel")
const User = require("../models/userModel")
const Order = require("../models/orderModel")
const OrderItem = require("../models/orderItemModel")

const createOrder = async (req, res) => {
    const userId = req.user.id
    const { items, totalPrice } = req.body

    try {
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
                attributes: ['id', 'name', 'price', 'imageUrl']
            },
            order: [["createdAt", "DESC"]] 
        })

        res.status(200).json({ data: orders })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to fetch order history", error: err.message })
    }
}

module.exports = {
    createOrder,
    getOrderHistory
}