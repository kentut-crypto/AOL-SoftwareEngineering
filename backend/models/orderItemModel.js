const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const OrderItem = sequelize.define("OrderItem", {
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    priceAtPurchase: { type: DataTypes.INTEGER, allowNull: false }
})

module.exports = OrderItem