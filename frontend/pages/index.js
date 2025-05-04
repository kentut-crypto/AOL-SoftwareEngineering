import { useEffect, useState } from "react"
import axiosInstance from "../axiosInstance"
import Link from "next/link"

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState("")
  const [disease, setDisease] = useState("")
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchProducts = async () => {
    try {
      const params = { page }
      if (minPrice) params.minPrice = minPrice
      if (maxPrice) params.maxPrice = maxPrice
      if (search) params.search = search
      if (sort) params.sort = sort
      if (disease) params.disease = disease 

      const res = await axiosInstance.get("/products", { params })
      setProducts(res.data.data)
      setTotalPages(res.data.meta.lastPage)
    } catch (error) {
      console.error("Failed to fetch products", error)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [page, sort])

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
          <input
            type="text"
            placeholder="Disease target"
            value={disease}
            onChange={e => setDisease(e.target.value)}
          />
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
                  <Link href={`/product/${product.id}`} style={{ textDecoration: "none", color: "inherit" }}>
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
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${product.seller.imageUrl}`}
                      alt={product.seller.name}
                      style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }} />
                    <p>{product.seller.name}</p>
                    {product.rating != null && <p>Rating: {product.rating} ★</p>}
                    <p>Stock: {product.stock}</p>
                  </Link>
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
      </main>
    </>
  )
}