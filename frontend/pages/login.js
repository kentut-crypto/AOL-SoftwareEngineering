import { useEffect, useState } from "react";
import axiosInstance from "../axiosInstance";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import styles from "../styles/login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { user, setUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axiosInstance.post(
        "/auth/login",
        { email, password },
        {
          withCredentials: true,
        }
      );
      setUser(res.data.user);
      console.log("Login response:", res.data);
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const { credential } = credentialResponse;
    try {
      const res = await axiosInstance.post("/auth/google/frontend", { credential });
      setUser(res.data.user);
      console.log("Login google:", res.data);
    } catch (error) {
      alert("Google login failed");
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleSubmit} className={styles.from}>
          <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <br />
          <input className={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <br />
          <button className={styles.button} type="submit">
            Login
          </button>
        </form>

        <br />
        <h2>Or sign in with Google</h2>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => alert("Google login failed")} clientId="147272879504-g4gjtddv5k69sp6f421s3540qcoiihad.apps.googleusercontent.com" />
      </div>
    </main>
  );
}
