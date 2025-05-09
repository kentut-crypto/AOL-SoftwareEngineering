import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axiosInstance from "../../axiosInstance"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"

export default function ProductDetail() {
    const router = useRouter()
    const { id } = router.query
    const { user, loading } = useAuth()

    const [product, setProduct] = useState(null)

    const [quantity, setQuantity] = useState(1)

    const [reviews, setReviews] = useState([])
    const [reviewPage, setReviewPage] = useState(1)
    const [reviewLastPage, setReviewLastPage] = useState(1)

    const [myReview, setMyReview] = useState(null)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" })

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    useEffect(() => {
        if (!id) return
        axiosInstance
            .get(`/products/${id}`)
            .then(res => setProduct(res.data))
            .catch(console.error)
    }, [id])

    useEffect(() => {
        if (!id) return
        axiosInstance
            .get(`/reviews/${id}`, { params: { page: reviewPage } })
            .then(res => {
                setReviews(res.data.data)
                setReviewLastPage(res.data.meta.lastPage)
                if (user) {
                    const mine = res.data.data.find(r => r.user?.id === user.id)
                    if (mine) setMyReview(mine)
                }
            })
            .catch(console.error)
    }, [id, reviewPage])

    const handleAddToCart = async () => {
        if (!user) {
            alert("Please login first")
            router.push("/login")
            return
        }

        if (user?.role === "seller" && user.id === product.sellerId) {
            alert("You cannot add your own product to the cart.")
            return
        }

        try {
            await axiosInstance.post("/cart", {
                productId: product.id,
                quantity: quantity,
            })
            alert("Added to cart")
        } catch (err) {
            console.error("Add to cart failed", err)
            alert("Failed to add to cart")
        }
    }

    if (loading || user?.role === "admin") return null
    if (!product) return <p>Loading...</p>

    return (
        <>
            <main style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
                <h1>{product.name}</h1>
                {product.imageUrl && (
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`}
                        alt={product.name}
                        style={{ width: "100%", maxHeight: 400, objectFit: "cover", marginBottom: "1rem" }}
                    />
                )}
                <p><strong>Price:</strong> Rp {Number(product.price).toLocaleString("id-ID")}</p>
                <p><strong>Stock:</strong> {product.stock}</p>
                <p><strong>Description:</strong> {product.description}</p>
                <p><strong>Usage Instructions:</strong> {product.usageInstructions || "-"}</p>
                <p><strong>Ingredients:</strong> {product.ingredients || "-"}</p>
                <p>
                    <strong>Disease Targets:</strong>{" "}
                    {product.diseaseTargets?.length
                        ? product.diseaseTargets.join(", ")
                        : "-"}
                </p>
                <p>
                    <strong>Seller:</strong>{" "}
                    <Link href={`/seller/${product.sellerId}`}>
                        <img src={product.seller.imageUrl.startsWith("http") ? product.seller.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${product.seller.imageUrl}`}
                            alt={product.seller.name}
                            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
                        {product.seller.name}
                    </Link>
                </p>

                {/* add cart */}
                <div style={{ margin: "2rem 0" }}>
                    <label>Quantity: </label>
                    <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                            –
                        </button>

                        <input
                            type="number"
                            value={quantity}
                            min="1"
                            max={product.stock}
                            onChange={e => {
                                let value = parseInt(e.target.value)
                                if (isNaN(value) || value < 1) value = 1
                                if (value > product.stock) value = product.stock
                                setQuantity(value)
                            }}
                        />

                        <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} disabled={quantity >= product.stock}>
                            +
                        </button>
                    </div>
                    <button onClick={handleAddToCart} disabled={product.stock <= 0}>Add to Cart</button>
                </div>

                <hr style={{ margin: "2rem 0" }} />

                <section style={{ marginTop: "2rem" }}>
                    <h2>Your Review</h2>
                    {myReview ? (
                        <div>
                            <p><strong>Your Rating:</strong> {myReview.rating} / 5</p>
                            <p><strong>Your Comment:</strong> {myReview.comment}</p>
                            <button onClick={() => {
                                setReviewForm({ rating: myReview.rating, comment: myReview.comment })
                                setShowReviewModal(true)
                            }}>Edit</button>
                            <button
                                onClick={async () => {
                                    if (confirm("Are you sure you want to delete this review?")) {
                                        try {
                                            await axiosInstance.delete(`/reviews/${id}`)
                                            const res = await axiosInstance.get(`/reviews/${id}`, { params: { page: 1 } })
                                            setReviews(res.data.data)
                                            setReviewLastPage(res.data.meta.lastPage)
                                            if (user) {
                                                const mine = res.data.data.find(r => r.user?.id === user.id)
                                                setMyReview(mine)
                                            }

                                            setShowReviewModal(false)
                                            setReviewPage(1)
                                        } catch (err) {
                                            alert(err.response?.data?.message || "Delete failed")
                                        }
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    ) : (
                            <button onClick={async () => {
                                try {
                                    const res = await axiosInstance.get(`/reviews/eligible/${id}`)
                                    if (!res.data.eligible) {
                                        alert("You can only review this product after purchasing it")
                                        return
                                    }
                                    setReviewForm({ rating: 5, comment: "" })
                                    setShowReviewModal(true)
                                } catch (err) {
                                    alert("Failed to check review eligibility", err)
                                }
                            }}>Leave a Review</button>
                    )}
                </section>

                {showReviewModal && (
                    <div style={{ background: "#eee", padding: 20, marginTop: 20 }}>
                        <h3>{myReview ? "Edit Review" : "Add Review"}</h3>
                        <label>Rating (1-5): </label>
                        <input
                            type="number"
                            value={reviewForm.rating}
                            min={1}
                            max={5}
                            onChange={e => setReviewForm(f => ({ ...f, rating: +e.target.value }))}
                        /><br />
                        <label>Comment: </label><br />
                        <textarea
                            value={reviewForm.comment}
                            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        /><br />

                        <button
                            onClick={async () => {
                                try {
                                    if (myReview) {
                                        await axiosInstance.put(`/reviews/${id}`, reviewForm)
                                    } else {
                                        await axiosInstance.post(`/reviews/${id}`, reviewForm)
                                    }
                                    const res = await axiosInstance.get(`/reviews/${id}`, { params: { page: 1 } })
                                    setReviews(res.data.data)
                                    setReviewLastPage(res.data.meta.lastPage)
                                    if (user) {
                                        const mine = res.data.data.find(r => r.user?.id === user.id)
                                        setMyReview(mine)
                                    }

                                    setShowReviewModal(false)
                                    setReviewPage(1)
                                } catch (err) {
                                    alert(err.response?.data?.message || "Failed to submit review")
                                }
                            }}
                        >
                            Submit
                        </button>
                        <button onClick={() => setShowReviewModal(false)}>Cancel</button>
                    </div>
                )}

                <hr style={{ margin: "2rem 0" }} />

                {/* comment */}
                <section>
                    <h2>Reviews</h2>
                    {reviews.length === 0 ? (
                        <p>No reviews yet.</p>
                    ) : (
                        reviews.map(r => (
                            <div key={r.id} style={{ marginBottom: "1.5rem" }}>
                                <img
                                    src={r.user.imageUrl.startsWith("http") ? r.user.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${r.user.imageUrl}`}
                                    alt={r.user.name}
                                    style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}/>
                                <p><strong>{r.user?.name}</strong> &ndash; {new Date(r.createdAt).toLocaleDateString()}</p>
                                <p>Rating: {r.rating} / 5</p>
                                <p>{r.comment}</p>
                                <hr />
                            </div>
                        ))
                    )}

                    {/* pagination */}
                    <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <button onClick={() => setReviewPage(p => Math.max(p - 1, 1))} disabled={reviewPage === 1}>
                            Prev
                        </button>
                        <span style={{ margin: "0 1rem" }}>
                            Page {reviewPage} of {reviewLastPage}
                        </span>
                        <button onClick={() => setReviewPage(p => Math.min(p + 1, reviewLastPage))} disabled={reviewPage === reviewLastPage}>
                            Next
                        </button>
                    </div>
                </section>
            </main>
        </>
    )
}
