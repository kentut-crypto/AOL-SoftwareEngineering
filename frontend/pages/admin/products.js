import { useEffect, useState } from "react"
import axiosInstance from "@/axiosInstance"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/router"

export default function AdminProductsPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [products, setProducts] = useState([])
    const [minPrice, setMinPrice] = useState("")
    const [maxPrice, setMaxPrice] = useState("")
    const [search, setSearch] = useState("")
    const [sort, setSort] = useState("")
    const [filterDiseases, setFilterDiseases] = useState([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const [editingProduct, setEditingProduct] = useState(null)
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stock: "",
        description: "",
        usageInstructions: "",
        ingredients: "",
        diseaseTargets: [],
        image: null
    })

    const diseaseOptions = ["Blight", "Common Rust", "Gray Leaf Spot"]

    const fetchProducts = async () => {
        try {
            const params = { page }
            if (minPrice) params.minPrice = minPrice
            if (maxPrice) params.maxPrice = maxPrice
            if (search) params.search = search
            if (sort) params.sort = sort
            if (filterDiseases.length > 0) {
                params.disease = filterDiseases.join(',')
            }

            const res = await axiosInstance.get("/products/allproducts", { params })
            setProducts(res.data.data)
            setTotalPages(res.data.meta.lastPage)
        } catch (error) {
            console.error("Failed to fetch products", error)
        }
    }

    useEffect(() => {
        if (!loading) {
            if (user?.role === "admin") {
                fetchProducts()
            } else {
                router.replace("/")
                return
            }
        }
    }, [loading, user, page, sort])

    const openEditModal = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            description: product.description,
            usageInstructions: product.usageInstructions,
            ingredients: product.ingredients,
            diseaseTargets: product.diseaseTargets || [],
            image: null
        })
    }

    const closeModal = () => {
        setEditingProduct(null)
        setFormData({
            name: "",
            price: "",
            stock: "",
            description: "",
            usageInstructions: "",
            ingredients: "",
            diseaseTargets: [],
            image: null
        })
    }

    const handleDiseaseCheckboxChange = (e) => {
        const { value, checked } = e.target
        setFormData(prevFormData => {
            const currentDiseaseTargets = prevFormData.diseaseTargets || []
            if (checked) {
                return {
                    ...prevFormData,
                    diseaseTargets: [...new Set([...currentDiseaseTargets, value])]
                }
            } else {
                return {
                    ...prevFormData,
                    diseaseTargets: currentDiseaseTargets.filter(d => d !== value)
                }
            }
        })
    }

    const handleFilterDiseaseCheckboxChange = (e) => {
        const { value, checked } = e.target
        setFilterDiseases(prevFilterDiseases => {
            if (checked) {
                return [...new Set([...prevFilterDiseases, value])]
            } else {
                return prevFilterDiseases.filter(d => d !== value)
            }
        })
    }

    const handleEditSubmit = async (e) => {
        e.preventDefault()
        try {
            const form = new FormData()
            form.append("name", formData.name)
            form.append("price", formData.price)
            form.append("stock", formData.stock)
            form.append("description", formData.description)
            form.append("usageInstructions", formData.usageInstructions)
            form.append("ingredients", formData.ingredients)

            if (Array.isArray(formData.diseaseTargets)) {
                formData.diseaseTargets.forEach(disease => {
                    form.append("diseaseTargets[]", disease)
                })
            }

            if (formData.image) {
                form.append("image", formData.image)
            }

            await axiosInstance.put(`/products/${editingProduct.id}`, form)
            await fetchProducts()
            closeModal()
        } catch (err) {
            console.error("Failed to update product", err)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return
        try {
            await axiosInstance.delete(`/products/${id}`)
            await fetchProducts()
        } catch (err) {
            console.error("Failed to delete product", err)
        }
    }

    if (loading || user?.role !== "admin") return <p>Loading or Unauthorized</p>

    return (
        <>
            <main style={{ padding: "1rem" }}>
                <h1>Marketplace</h1>

                {/* filter */}
                <div style={{ marginBottom: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <input
                        type="number"
                        placeholder="Min Price"
                        value={minPrice}
                        onChange={e => setMinPrice(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Max Price"
                        value={maxPrice}
                        onChange={e => setMaxPrice(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <div style={{ }}>
                        <label>Filter by Disease</label>
                        {diseaseOptions.map(option => (
                            <div key={`filter-${option}`}>
                                <input
                                    type="checkbox"
                                    id={`filter-${option}`}
                                    value={option}
                                    checked={filterDiseases.includes(option)}
                                    onChange={handleFilterDiseaseCheckboxChange}
                                />
                                <label htmlFor={`filter-${option}`}>{option}</label>
                            </div>
                        ))}
                    </div>
                    <select value={sort} onChange={e => setSort(e.target.value)}>
                        <option value="">Sort</option>
                        <option value="price_asc">Price Low → High</option>
                        <option value="price_desc">Price High → Low</option>
                        <option value="rating_desc">Rating High → Low</option>
                    </select>
                    <button onClick={fetchProducts}>Apply</button>
                </div>

                {/* grid */}
                {products.length === 0 ? (
                    <p>No products found</p>
                ) : (
                    <ul
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                            gap: "1rem"
                        }}
                    >
                        {products.map(product => (
                            <li
                                key={product.id}
                                style={{
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                    padding: "1rem"
                                }}
                            >
                                <div>
                                    {product.imageUrl && (
                                        <div style={{ margin: "0.5rem 0" }}>
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_API_URL}${product.imageUrl}`}
                                                alt={product.name}
                                                style={{ width: "500px", height: "200px", objectFit: "cover" }}
                                            />
                                        </div>
                                    )}
                                    <h2>{product.name}</h2>
                                    <p>Price: Rp {Number(product.price).toLocaleString("id-ID")}</p>
                                    <img src={product.seller.imageUrl.startsWith("http") ? product.seller.imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${product.seller.imageUrl}`}
                                        alt={product.seller.name}
                                        style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
                                    <p>{product.seller.name}</p>
                                    {product.rating != null && <p>Rating: {product.rating} ★</p>}
                                    <p>Stock: {product.stock}</p>
                                </div>
                                <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
                                    <button onClick={() => openEditModal(product)}>Edit</button>
                                    <button onClick={() => handleDelete(product.id)}>Delete</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {/* pagination simple */}
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

                {editingProduct && (
                    <div style={{
                        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                        backgroundColor: "rgba(0,0,0,0.5)", display: "flex",
                        justifyContent: "center", alignItems: "center", zIndex: 999
                    }}>
                        <form onSubmit={handleEditSubmit} style={{
                            background: "white", padding: "2rem", borderRadius: "8px", minWidth: "300px"
                        }}>
                            <h2>Edit Product</h2>
                            <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                            <input type="number" placeholder="Stock" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                            <textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            <textarea placeholder="Usage Instructions" value={formData.usageInstructions} onChange={e => setFormData({ ...formData, usageInstructions: e.target.value })} />
                            <textarea placeholder="Ingredients" value={formData.ingredients} onChange={e => setFormData({ ...formData, ingredients: e.target.value })} />
                            <div style={{ }}>
                                <label>Disease Targets</label>
                                {diseaseOptions.map(option => (
                                    <div key={option}>
                                        <input
                                            type="checkbox"
                                            id={option}
                                            name="diseaseTargets"
                                            value={option}
                                            checked={formData.diseaseTargets.includes(option)}
                                            onChange={handleDiseaseCheckboxChange}
                                        />
                                        <label htmlFor={option}>{option}</label>
                                    </div>
                                ))}
                            </div>
                            <input type="file" onChange={e => setFormData({ ...formData, image: e.target.files[0] })} />
                            <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
                                <button type="submit">Save</button>
                                <button type="button" onClick={closeModal}>Cancel</button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </>
    )
}