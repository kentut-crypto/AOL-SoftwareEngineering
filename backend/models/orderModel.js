const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const Order = sequelize.define("Order", {
    userId: { type: DataTypes.UUID, allowNull: false },
    totalPrice: DataTypes.INTEGER,
})

module.exports = Order