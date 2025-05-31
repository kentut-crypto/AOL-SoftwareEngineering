import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useSocket } from "@/context/SocketContext"
import { useAuth } from "@/context/AuthContext"
import axiosInstance from "@/axiosInstance"

export default function ChatList() {
    const socket = useSocket()
    const { user, loading } = useAuth()
    const router = useRouter()
    const [chats, setChats] = useState([])

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }

        const fetchChats = async () => {
            try {
                const endpoint = user?.role === "user" ? "/chat/user" : "/chat/seller"
                const res = await axiosInstance.get(endpoint)
                setChats(res.data)
            } catch (err) {
                console.error("Failed to fetch chats:", err)
            }
        }

        fetchChats()
    }, [loading, user, router])

    useEffect(() => {
        if (!socket || !user) return
        socket.on("chatUpdated", (chatUpdate) => {
            setChats((prevChats) => {
                const updatedChats = prevChats.map((chat) => {
                    if (chat.id === chatUpdate.id) {
                        return {
                            ...chat,
                            latestMessage: chatUpdate.latestMessage,
                            unread: chatUpdate.unread,
                            otherParty: chatUpdate.otherParty,
                        }
                    }
                    return chat
                })
                return updatedChats
            })
        })

        return () => {
            socket.off("newMessage")
        }
    }, [socket, user])

    return (
        <div>
            <h2>Your Chats</h2>
            {chats.length === 0 ? (
                <p>No chats yet.</p>
            ) : (
                chats.map((chat) => (
                    <div key={chat.id}>
                        <a href={`/chat/${chat.id}`}>
                            <p>
                                Chat with {chat.otherParty.name}
                                {chat.unread > 0 && (
                                    <strong style={{ color: "red" }}>
                                        {" "}
                                        ({chat.unread === "10+" ? "10+" : chat.unread} unread)
                                    </strong>
                                )}
                            </p>
                            <p>
                                <em>{chat.latestMessage}</em>
                            </p>
                        </a>
                    </div>
                ))
            )}
        </div>
    )
}