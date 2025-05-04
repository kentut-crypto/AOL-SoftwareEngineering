const express = require("express")
const passport = require("passport")
const { registerUser, loginUser, googleFrontendLogin, getMe } = require("../controllers/authController.js")
const { verifyTokenFromCookie } = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post("/google/frontend", googleFrontendLogin)
router.get("/me", verifyTokenFromCookie, getMe)
router.post("/logout", (req, res) => {
    res.clearCookie("token")
    res.json({ message: "Logged out successfully" })
})

module.exports = router