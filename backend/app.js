require("dotenv").config()
const express = require("express")
const passport = require("passport")
const cors = require("cors")
const sequelize = require("./db")
const authRoutes = require("./routes/authRoutes")
const productRoutes = require("./routes/productRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const cartItemRoutes = require("./routes/cartItemRoutes")
const orderRoutes = require("./routes/orderRoutes")
const path = require("path")
const cookieParser = require("cookie-parser")

const app = express()
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}))
app.use(express.json())
app.use(passport.initialize())
app.use(cookieParser())
app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/cart", cartItemRoutes)
app.use("/api/order", orderRoutes)

require("./models")

sequelize.authenticate()
    .then(async () => {
        console.log("Connection has been established successfully.")

        await sequelize.sync({ alter: true })

        const PORT = process.env.PORT || 5000
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Unable to connect to the database:", error)
    })