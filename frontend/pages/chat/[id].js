import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSocket } from "@/context/SocketContext"
import { useAuth } from "@/context/AuthContext"

export default function ChatPage() {
    const socket = useSocket()
    const router = useRouter()
    const { id } = router.query
    const { user, loading } = useAuth()

    const [messages, setMessages] = useState([])
    const [newMsg, setNewMsg] = useState("")

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    useEffect(() => {
        if (!user || !id || !socket) return
        socket.emit("joinRoom", { chatRoomId: id, userId: user.id, role: user.role })
        socket.on("chatHistory", (msgs) => setMessages(msgs))
        socket.on("newMessage", (msg) => {
            setMessages((prev) => [...prev, msg])
            socket.emit("markAsRead", { chatRoomId: id, userId: user.id })
        })

        return () => {
            socket.off("chatHistory")
            socket.off("newMessage")
        }
    }, [id, user, socket])

    const send = () => {
        if (newMsg.trim()) {
            socket.emit("sendMessage", {
                chatRoomId: id,
                senderId: user.id,
                content: newMsg,
            })
            setNewMsg("")
        }
    }

    if (loading || user?.role === "admin") return null

    return (
        <div>
            <div>
                {messages.map((msg) => (
                    <div key={msg.id}>
                        <strong>{msg.username || msg.User?.name}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <input
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <button onClick={send}>Send</button>
        </div>
    )
}