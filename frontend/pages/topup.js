import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"

export default function TopUpPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [history, setHistory] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedAmount, setSelectedAmount] = useState(null)
    const [manualAmount, setManualAmount] = useState("")

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const res = await axiosInstance.get("/topup/history")
            setHistory(res.data.data)
        } catch (err) {
            console.error("Failed to fetch history", err)
        }
    }

    const presetAmounts = [10000, 20000, 50000, 100000, 200000]

    const handlePresetClick = (amount) => {
        setSelectedAmount(amount)
        setManualAmount("")
    }

    const handleManualChange = (e) => {
        setManualAmount(e.target.value)
        setSelectedAmount(null)
    }

    const handleSubmit = async () => {
        const amount = selectedAmount || parseFloat(manualAmount)
        if (!amount || amount <= 0) return alert("Enter a valid amount")

        try {
            await axiosInstance.post("/topup", { amount })
            setIsModalOpen(false)
            setSelectedAmount(null)
            setManualAmount("")
            fetchHistory()
        } catch (err) {
            console.error("Failed to submit top-up", err)
        }
    }

    return (
        <div style={{ padding: "2rem" }}>
            <h1>My Top-Up History</h1>
            <button onClick={() => setIsModalOpen(true)} style={{ marginBottom: "1rem" }}>
                Request Top-Up
            </button>

            {history.length === 0 ? (
                <p>No top-up history yet.</p>
            ) : (
                history.map((t) => (
                    <div key={t.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "0.5rem", borderRadius: "6px" }}>
                        <p>Amount: <strong>Rp {t.amount.toLocaleString()}</strong></p>
                        <p>Status: <strong>{t.status}</strong></p>
                        <p>Date: {new Date(t.createdAt).toLocaleString()}</p>
                    </div>
                ))
            )}

            {isModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex", justifyContent: "center", alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{ background: "white", padding: "2rem", borderRadius: "10px", width: "300px" }}>
                        <h2>Top-Up Amount</h2>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
                            {presetAmounts.map((amt) => (
                                <div
                                    key={amt}
                                    onClick={() => handlePresetClick(amt)}
                                    style={{
                                        padding: "0.5rem 1rem",
                                        border: "1px solid #333",
                                        borderRadius: "6px",
                                        backgroundColor: selectedAmount === amt ? "#d1e7dd" : "white",
                                        cursor: "pointer"
                                    }}
                                >
                                    Rp {amt.toLocaleString()}
                                </div>
                            ))}
                        </div>
                        <input
                            type="number"
                            placeholder="Or enter manually"
                            value={manualAmount}
                            onChange={handleManualChange}
                            style={{ width: "100%", marginBottom: "1rem", padding: "0.5rem" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button onClick={handleSubmit}>Top Up</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}