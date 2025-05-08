import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import styles from "../styles/style.module.css";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const router = useRouter();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post("/auth/register", form);
      router.push("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Register</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input className={styles.input} name="name" placeholder="Name" onChange={handleChange} required />
          <input className={styles.input} name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className={styles.input} name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button className={styles.button} type="submit">
            Register
          </button>
        </form>
      </div>
    </main>
  );
}
