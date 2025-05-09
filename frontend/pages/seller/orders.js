import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"

export default function Orders() {
    const { user, loading } = useAuth()
    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(true)
    const router = useRouter()

    const fetchOrders = async () => {
        try {
            const res = await axiosInstance.get("/order/seller/getPendingOrders")
            setOrders(res.data.data)
        } catch (err) {
            console.error("Failed to fetch incoming orders", err)
        } finally {
            setLoadingOrders(false)
        }
    }

    const handleAccept = async (orderId, productId) => {
        try {
            await axiosInstance.patch(`/order/accept/${orderId}/${productId}`)
            fetchOrders()
        } catch (err) {
            console.error("Accept failed", err)
        }
    }

    const handleDecline = async (orderId, productId) => {
        try {
            await axiosInstance.patch(`/order/cancel/${orderId}/${productId}`)
            fetchOrders()
        } catch (err) {
            console.error("Decline failed", err)
        }
    }

    useEffect(() => {
        if (!loading) {
            if (user?.role !== "seller") {
                router.push("/")
            } else {
                fetchOrders()
            }
        }
    }, [user, loading])

    if (loading || loadingOrders) return <p>Loading...</p>
    if (orders.length === 0) return <p>No incoming orders.</p>

    return (
        <div>
            <h1>Incoming Orders</h1>
            {orders.map(order => (
                <div key={order.id}>
                    <p>Customer: {order.user.name}</p>
                    {order.orderItems.map(item => (
                        <div key={item.id} style={{ display: "flex", marginBottom: 8 }}>
                            <img
                                src={`${process.env.NEXT_PUBLIC_API_URL}${item.product.imageUrl}`}
                                alt={item.product.name}
                                style={{ width: 80, height: 80, objectFit: "cover", marginRight: 12 }}
                            />
                            <div>
                                <p><strong>{item.product.name}</strong></p>
                                <p>Qty: {item.quantity}</p>
                                <p>Price: ${item.priceAtPurchase}</p>
                                <button onClick={() => handleAccept(order.id, item.product.id)} disabled={item.status !== "pending"}>
                                    Accept
                                </button>
                                <button onClick={() => handleDecline(order.id, item.product.id)} disabled={item.status !== "pending"}>
                                    Decline
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}