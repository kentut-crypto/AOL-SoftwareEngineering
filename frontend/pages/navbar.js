import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import axiosInstance from "@/axiosInstance"

export default function Navbar() {
    const { user, logout, loading } = useAuth()

    const handleLogout = async () => {
        await axiosInstance.post("/auth/logout")
        logout()
    }

    return (
        <nav style={{ padding: "1rem", borderBottom: "1px solid #ddd" }}>
            <ul style={{ display: "flex", alignItems: "center", gap: "1rem", listStyle: "none", margin: 0 }}>
                <li style={{ flexGrow: 1, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {!loading && (
                        <>
                            {user ? (
                                <img
                                    src={user.imageUrl.startsWith("http") ? user.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${user.imageUrl}`}
                                    alt="Avatar"
                                    style={{ width: 32, height: 32, borderRadius: "50%" }}
                                />
                            ) : null}
                            <h1 style={{ margin: 0, fontSize: "1.2rem" }}>
                                Welcome{" "}
                                {user?.name
                                    ? user.name
                                    : user?.email
                                        ? user.email
                                        : "Guest"}
                            </h1>
                        </>
                    )}
                    <Link href="/">Home</Link>
                </li>

                {!user ? (
                    <>
                        <li>
                            <Link href="/login">Login</Link>
                        </li>
                        <li>
                            <Link href="/register">Register</Link>
                        </li>
                    </>
                ) : (
                    <>
                        {user.role === "seller" && (
                            <li>
                                <Link href="/seller/products">Your Products</Link>
                                <Link href="/seller/orders">Incoming Orders</Link>
                            </li>
                        )}
                        <li>
                            <Link href="/cart">Cart</Link>
                            <Link href="/history">Purchase History</Link>
                            <h1>Money : {user.money}</h1>
                            <button onClick={handleLogout}>Logout</button>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    )
}