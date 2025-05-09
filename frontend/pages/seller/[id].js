import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import Link from "next/link"
import { useRouter } from "next/router"
import { useAuth } from "@/context/AuthContext"

export default function SellerPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const { id } = router.query
    const [seller, setSeller] = useState(null)
    const [products, setProducts] = useState([])
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState("")
    const [disease, setDisease] = useState("")
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    useEffect(() => {
        if (!loading && user?.role === "admin") {
            router.replace("/admin/users")
        }
    }, [loading, user, router])

    const fetchProducts = async () => {
        try {
            const params = { page }
            if (minPrice) params.minPrice = minPrice
            if (maxPrice) params.maxPrice = maxPrice
            if (search) params.search = search
            if (sort) params.sort = sort
            if (disease) params.disease = disease

            const res = await axiosInstance.get(`/products/seller/${id}`, { params })
            setProducts(res.data.data)
            setTotalPages(res.data.meta.lastPage)

            if (res.data.data.length > 0 && res.data.data[0].seller) {
                setSeller(res.data.data[0].seller)
            }
        } catch (error) {
            console.error("Failed to fetch products", error)
        }
    }

    useEffect(() => {
        if (id) fetchProducts()
    }, [id, page, sort])

    if (loading || user?.role === "admin") return null

    return (
        <main style={{ padding: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {seller?.imageUrl && (
                    <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}${seller.imageUrl}`}
                        alt={seller.name}
                        style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover" }}
                    />
                )}
                <h1>{seller?.name || "Seller"}'s Shop</h1>
            </div>

            <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input type="number" placeholder="Min Price" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                <input type="number" placeholder="Max Price" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                <input type="text" placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)} />
                <input type="text" placeholder="Disease target" value={disease} onChange={e => setDisease(e.target.value)} />
                <select value={sort} onChange={e => setSort(e.target.value)}>
                    <option value="">Sort</option>
                    <option value="price_asc">Price Low → High</option>
                    <option value="price_desc">Price High → Low</option>
                    <option value="rating_desc">Rating High → Low</option>
                </select>
                <button onClick={fetchProducts}>Apply</button>
            </div>

            {products.length === 0 ? (
                <p>No products found</p>
            ) : (
                <ul style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem"
                }}>
                    {products.map(product => (
                        <li key={product.id} style={{ border: "1px solid #ccc", borderRadius: "4px", padding: "1rem" }}>
                            <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                                {product.imageUrl && (
                                    <div style={{ marginBottom: "0.5rem" }}>
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`}
                                            alt={product.name}
                                            style={{ width: "100%", height: "200px", objectFit: "cover" }}
                                        />
                                    </div>
                                )}
                                <h2>{product.name}</h2>
                                <p>Price: Rp {Number(product.price).toLocaleString("id-ID")}</p>
                                {product.rating != null && <p>Rating: {product.rating} ★</p>}
                                <p>Stock: {product.stock}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}

            <div style={{ marginTop: "2rem", textAlign: "center" }}>
                <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
                    Prev
                </button>
                <span style={{ margin: "0 1rem" }}>
                    Page {page} of {totalPages}
                </span>
                <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
                    Next
                </button>
            </div>
        </main>
    )
}