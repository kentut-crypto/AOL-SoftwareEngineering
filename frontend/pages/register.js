import { useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useRouter } from "next/router"
import { useAuth } from "@/context/AuthContext"

export default function Register() {
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" })
    const router = useRouter()

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const res = await axiosInstance.post("/auth/register", form)
            router.push("/login")
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed")
        }
    }

    return (
        <main>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Name" onChange={handleChange} required />
                <br />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                <br />
                <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
                <br />
                <button type="submit">Register</button>
            </form>
        </main>
    )
}
