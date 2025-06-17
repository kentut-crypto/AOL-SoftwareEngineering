import { useState } from "react"
import axiosInstance from "../axiosInstance"
import { useRouter } from "next/router"
import styles from "../styles/Register.module.css"

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" })
  const router = useRouter()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axiosInstance.post("/auth/register", form)
      router.push("/login")
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed")
    }
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Create an Account</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          className={styles.input}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className={styles.input}
          required
        />
        <button type="submit" className={styles.button}>
          Register
        </button>
      </form>
    </main>
  )
}
