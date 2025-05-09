const TopUpRequest = require("../models/topUpRequestModel")
const User = require("../models/userModel")

const createTopUp = async (req, res) => {
    try {
        const { amount } = req.body
        const userId = req.user.id

        const topup = await TopUpRequest.create({
            userId,
            amount
        })

        res.status(201).json(review)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to request top-up", error: err.message })
    }
}

const getIncomingTopUps = async (req, res) => {
    try {
        const topups = await TopUpRequest.findAll({
            where: { status: "pending" },
            include: {
                model: User,
                as: "user",
                attributes: ["id", "name", "imageUrl"]
            },
            order: [["createdAt", "DESC"]]
        })
        res.json({ topups })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to get incoming top-ups", error: err.message })
    }
}

const handleTopUp = async (req, res) => {
    const { id } = req.params
    const { action } = req.body
    try {
        const topup = await TopUpRequest.findByPk(id)
        if (!topup) return res.status(404).json({ message: "Top-up not found" })
        if (topup.status !== "pending") return res.status(400).json({ message: "Already handled" })

        const user = await User.findByPk(topup.userId)
        if (!user) return res.status(404).json({ message: "User not found" })

        if (action === "accept") {
            user.money += topup.amount
            await user.save()
            topup.status = "accepted"
        } else {
            topup.status = "declined"
        }

        await topup.save()
        res.json({ message: `Top-up ${action}ed` })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to handle top-up", error: err.message })
    }
}

const getTopUpHistory = async (req, res) => {
    const userId = req.user.id
    try {
        const history = TopUpRequest.findAll({
            where: { userId },
            order: [["createdAt", "DESC"]]
        })
        res.json({ history })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: "Failed to get top-up history", error: err.message })
    }
}

module.exports = {
    createTopUp,
    getIncomingTopUps,
    handleTopUp,
    getTopUpHistory
}