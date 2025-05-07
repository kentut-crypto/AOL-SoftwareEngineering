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

    const handleAccept = async (orderId) => {
        try {
            await axiosInstance.patch(`/order/accept/${orderId}`)
            setOrders(orders => orders.filter(order => order.id !== orderId))
        } catch (err) {
            console.error("Accept failed", err)
        }
    }

    const handleDecline = async (orderId) => {
        try {
            await axiosInstance.patch(`/order/cancel/${orderId}`)
            setOrders(orders => orders.filter(order => order.id !== orderId))
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
                    {order.products.map(product => (
                        <div key={product.id}>
                            <img src={`${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`} alt={product.name}/>
                            <div>
                                <p>{product.name}</p>
                                <p>Qty: {product.OrderItem.quantity}</p>
                                <p>Price: ${product.OrderItem.priceAtPurchase}</p>
                            </div>
                        </div>
                    ))}
                    <div>
                        <button onClick={() => handleAccept(order.id)}>
                            Accept
                        </button>
                        <button onClick={() => handleDecline(order.id)}>
                            Decline
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}