const express = require("express")
const router = express.Router()
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const { createOrder, getOrderHistory } = require("../controllers/orderController")

router.get("/", verifyTokenFromCookie, getOrderHistory)
router.post("/", verifyTokenFromCookie, createOrder)

module.exports = router