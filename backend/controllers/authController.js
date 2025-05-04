const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const User = require("../models/userModel")
const { OAuth2Client } = require("google-auth-library")

const generateToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {expiresIn: "3d",}) // 3 day aja kali ya
}

const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body

    try {
        // check udh ada apa blm
        const userExists = await User.findOne({ where: { email } })
        if (userExists) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
        })

        const token = generateToken(newUser)
        res.status(201).json({  message: "User registered successfully", user: newUser, token })
    } catch(error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ where: { email } })
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const token = generateToken(user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        })
        res.status(200).json({ message: "Login successful", user, token })
    } catch(error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const googleFrontendLogin = async (req, res) => {
    const { credential } = req.body

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        })

        const payload = ticket.getPayload()
        const { email, name, sub: googleId, picture } = payload

        let user = await User.findOne({ where: { email } })

        if (!user) {
            user = await User.create({
                name,
                email,
                googleId,
                role: "user",
                imageUrl: picture
            })
        } else {
            if (!user.googleId) {
                user = await user.update({ googleId })
            }
        }

        const token = generateToken(user)
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Lax",
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        })
        res.status(200).json({ message: "Google login successful", user, token })
    } catch (error) {
        console.error("Google login error", error)
        res.status(401).json({ message: "Invalid Google token" })
    }
}

const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "email", "role", "imageUrl"]
        })

        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        res.json({ user })
    } catch (err) {
        res.status(500).json({ message: "Server error" })
    }
}

module.exports = { registerUser, loginUser, googleFrontendLogin, getMe }