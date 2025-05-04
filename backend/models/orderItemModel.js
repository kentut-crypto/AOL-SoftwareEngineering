const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const OrderItem = sequelize.define("OrderItem", {
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    priceAtPurchase: { type: DataTypes.INTEGER, allowNull: false }
})

OrderItem.sync({ alter: true })
    .then(() => console.log("OrderItem model synced with DB"))
    .catch((err) => console.log("Error syncing order item model:", err))

module.exports = OrderItem