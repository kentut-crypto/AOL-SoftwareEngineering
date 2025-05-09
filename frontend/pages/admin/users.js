import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"

export default function AdminUserPage() {
    const { user, loading } = useAuth()
    const [users, setUsers] = useState([])
    const [selectedUser, setSelectedUser] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({ name: "", role: "", image: null })

    useEffect(() => {
        if (!loading && user?.role === "admin") fetchUsers()
    }, [loading, user])

    const fetchUsers = async () => {
        try {
            const res = await axiosInstance.get("/auth")
            setUsers(res.data.data)
        } catch (err) {
            console.error("Failed to fetch users", err)
        }
    }

    const openModal = (user) => {
        setSelectedUser(user)
        setFormData({ name: user.name || "", role: user.role || "", image: null })
        setIsModalOpen(true)
    }

    const handleInputChange = (e) => {
        const { name, value, files } = e.target
        if (name === "image") {
            setFormData((prev) => ({ ...prev, image: files[0] }))
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }))
        }
    }

    const handleSave = async () => {
        const form = new FormData()
        form.append("name", formData.name)
        form.append("role", formData.role)
        if (formData.image) form.append("image", formData.image)

        try {
            await axiosInstance.put(`/auth/${selectedUser.id}`, form, {
                headers: { "Content-Type": "multipart/form-data" }
            })
            setIsModalOpen(false)
            setSelectedUser(null)
            fetchUsers()
        } catch (err) {
            console.error("Failed to update user", err)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this user?")) return
        try {
            await axiosInstance.delete(`/auth/${id}`)
            setUsers((prev) => prev.filter((u) => u.id !== id))
        } catch (err) {
            console.error("Failed to delete user", err)
        }
    }

    if (loading || user?.role !== "admin") return <p>Loading or Unauthorized</p>

    return (
        <div style={{ padding: "2rem" }}>
            <h1>Admin - Manage Users</h1>
            {users.map((u) => (
                <div key={u.id} style={{ border: "1px solid #ccc", padding: "1rem", margin: "1rem 0", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        {u.imageUrl && (
                            <img
                                src={u.imageUrl.startsWith("http") ? u.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${u.imageUrl}`}
                                alt="avatar"
                                style={{ width: 50, height: 50, borderRadius: "50%" }}
                            />
                        )}
                        <div style={{ flexGrow: 1 }}>
                            <p><strong>{u.name}</strong> ({u.email})</p>
                            <p>Role: {u.role}</p>
                        </div>
                        <button onClick={() => openModal(u)}>Edit</button>
                        <button onClick={() => handleDelete(u.id)} style={{ backgroundColor: "red", color: "white" }}>Delete</button>
                    </div>
                </div>
            ))}

            {isModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                    justifyContent: "center", alignItems: "center"
                }}>
                    <div style={{ background: "white", padding: "2rem", borderRadius: "8px", width: "300px" }}>
                        <h2>Edit User</h2>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            style={{ width: "100%", marginBottom: "1rem" }}
                        />
                        <label>Role</label>
                        <select
                            name="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            style={{ width: "100%", marginBottom: "1rem" }}
                        >
                            <option value="user">User</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                        </select>
                        <label>Image</label>
                        <input
                            type="file"
                            name="image"
                            onChange={handleInputChange}
                            style={{ width: "100%", marginBottom: "1rem" }}
                        />
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <button onClick={handleSave}>Save</button>
                            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}