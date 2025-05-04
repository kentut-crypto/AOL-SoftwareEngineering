const { DataTypes } = require("sequelize")
const sequelize = require("../db")

const Order = sequelize.define("Order", {
    userId: { type: DataTypes.UUID, allowNull: false },
    totalPrice: DataTypes.INTEGER,
    status: {
        type: DataTypes.STRING,
        defaultValue: "completed"
    }
})

Order.sync()
    .then(() => console.log("Order model synced with DB"))
    .catch((err) => console.log("Error syncing order model:", err))

module.exports = Order