const Product = require("../models/productModel")
const { Op } = require("sequelize")
const jwt   = require("jsonwebtoken")
const fs = require("fs")
const path = require("path")
const User = require("../models/userModel")

const getAllProducts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1)
        const limit = 10
        const offset = (page - 1) * limit
        const { minPrice, maxPrice, search, sort, disease } = req.query

        const where = {
            stock: { [Op.gt]: 0 }  // only in-stock for public listing
        }
        if (minPrice) where.price = { ...(where.price || {}), [Op.gte]: parseFloat(minPrice) }
        if (maxPrice) where.price = { ...(where.price || {}), [Op.lte]: parseFloat(maxPrice) }
        if (search) where.name = { [Op.iLike]: `%${search}%` }
        if (disease) where.diseaseTargets = { [Op.contains]: [disease] }

        let order = [["createdAt", "DESC"]] // default newest first
        if (sort === "price_asc")  order = [["price",  "ASC"]]
        if (sort === "price_desc") order = [["price",  "DESC"]]
        if (sort === "rating_asc") order = [["rating", "ASC"]]
        if (sort === "rating_desc")order = [["rating", "DESC"]]

        const { count, rows } = await Product.findAndCountAll({
            where,
            order,
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: "seller",
                    attributes: ["id", "name", "imageUrl"]
                }
            ]
        })

        res.json({
            meta: {
                total: count,
                page,
                lastPage: Math.ceil(count / limit)
            },
            data: rows
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products", error: err.message })
    }
}

const getProductById = async (req, res) => {
    try {
        const product = await Product.findByPk(req.params.id, {
            include: [
                {
                    model: User,
                    as: "seller",
                    attributes: ["id", "name", "imageUrl"]
                }
            ]
        })
        if (!product) return res.status(404).json({ message: "Product not found" })
        res.json(product)
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch product", error: err.message })
    }
}

const getProductsBySeller = async (req, res) => {
    try {
        const sellerId = req.params.sellerId
        let user = null
        const token = req.cookies?.token
        if (token) {
          try {
            user = jwt.verify(token, process.env.JWT_SECRET)
          } catch (_) {
            /* invalid or expired */
          }
        }

        const isOwner = user?.id === sellerId
        const page = Math.max(parseInt(req.query.page)  || 1, 1)
        const limit = 20
        const offset = (page - 1) * limit
        const { minPrice, maxPrice, search, sort, disease } = req.query

        const where = { sellerId }
        if (!isOwner) where.stock = { [Op.gt]: 0 }
        if (minPrice) where.price = { ...(where.price || {}), [Op.gte]: parseFloat(minPrice) }
        if (maxPrice) where.price = { ...(where.price || {}), [Op.lte]: parseFloat(maxPrice) }
        if (search) where.name = { [Op.iLike]: `%${search}%` }
        if (disease) where.diseaseTargets = { [Op.contains]: [disease] }

        let order = [["createdAt", "DESC"]]
        if (sort === "price_asc") order = [["price", "ASC"]]
        if (sort === "price_desc") order = [["price", "DESC"]]
        if (sort === "rating_asc") order = [["rating", "ASC"]]
        if (sort === "rating_desc") order = [["rating", "DESC"]]

        const { count, rows } = await Product.findAndCountAll({
            where,
            order,
            limit,
            offset,
            include: [
                {
                    model: User,
                    as: "seller",
                    attributes: ["id", "name", "imageUrl"]
                }
            ]
        })

        res.json({
            meta: {
                total: count,
                page,
                lastPage: Math.ceil(count / limit),
            },
            data: rows,
        })
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch products", error: err.message })
    }
}

const createProduct = async (req, res) => {
    const { name, description = "", price, stock, diseaseTargets = [], usageInstructions = "", ingredients = "" } = req.body
    if (req.user.role !== "seller") {
        return res.status(403).json({ message: "Only sellers can add products" })
    }
    const imageUrl = req.file
        ? `/uploads/products/${req.file.filename}`
        : req.body.imageUrl
    try {
        const product = await Product.create({
            name,
            description,
            price,
            stock,
            imageUrl,
            diseaseTargets,
            usageInstructions,
            ingredients,
            sellerId: req.user.id,
        })

        res.status(201).json(product)
    } catch (err) {
        res.status(500).json({ message: "Failed to create product", error: err.message })
    }
}

const updateProduct = async (req, res) => {
    if (req.user.role !== "seller") {
        return res.status(403).json({ message: "Only sellers can update products" })
    }
    const { id } = req.params
    try {
        const product = await Product.findByPk(id)
        if (!product) return res.status(404).json({ message: "Product not found" })

        if (product.sellerId !== req.user.id) return res.status(403).json({ message: "Not authorized to update this product" })

        const updates = { ...req.body }
        if (req.file) {
            if (product.imageUrl) {
                const oldImagePath = path.join(__dirname, "../uploads/products", path.basename(product.imageUrl))
                fs.unlink(oldImagePath, (err) => {
                    if (err) console.error("Failed to delete old image:", err.message)
                })
            }
            updates.imageUrl = `/uploads/products/${req.file.filename}`
        }

        await product.update(updates)
        res.json(product)
    } catch (err) {
        res.status(500).json({ message: "Failed to update product", error: err.message })
    }
}

const deleteProduct = async (req, res) => {
    if (req.user.role !== "seller") {
        return res.status(403).json({ message: "Only sellers can delete products" })
    }
    const { id } = req.params
    try {
        const product = await Product.findByPk(id)
        if (!product) return res.status(404).json({ message: "Product not found" })

        if (product.sellerId !== req.user.id) return res.status(403).json({ message: "Not authorized to delete this product" })

        if (product.imageUrl) {
            const imagePath = path.join(__dirname, "../uploads/products", path.basename(product.imageUrl))
            fs.unlink(imagePath, (err) => {
                if (err) console.error("Failed to delete image:", err.message)
            })
        }

        await product.destroy()
        res.json({ message: "Product deleted" })
    } catch (err) {
        res.status(500).json({ message: "Failed to delete product", error: err.message })
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    getProductsBySeller,
    createProduct,
    updateProduct,
    deleteProduct,
}