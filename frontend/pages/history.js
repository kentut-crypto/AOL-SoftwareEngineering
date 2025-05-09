import React, { useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"

export default function OrderHistory() {
    const [orders, setOrders] = useState([])

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axiosInstance.get("/order")
                setOrders(response.data.data)
            } catch (err) {
                console.error("Error fetching orders", err)
            }
        }
        fetchOrders()
    }, [])

    return (
        <div>
            <h1>Order History</h1>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                orders.map(order => (
                    <div key={order.id}>
                        <h3>Order ID: {order.id}</h3>
                        <p>Total Price: Rp {Number(order.totalPrice).toLocaleString("id-ID")}</p>
                        <ul>
                            {order.products.map(product => (
                                <li key={product.id}>
                                    {product.name} : {product.OrderItem.quantity} x Rp{Number(product.OrderItem.priceAtPurchase).toLocaleString("id-ID")} - Status: {product.OrderItem.status}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    )
}