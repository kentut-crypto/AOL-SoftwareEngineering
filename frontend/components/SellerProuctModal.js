"use client"
import { useState, useEffect } from "react"

export default function SellerProductModal ({ isOpen, onClose, onSubmit, initial = 
    { name: "", price: "", imageUrl: "", stock: "", description: "", usageInstructions: "", ingredients: "", diseaseTargets: [] }, submitLabel }) {
    const [name, setName] = useState(initial.name)
    const [price, setPrice] = useState(initial.price)
    const [stock, setStock] = useState(initial.stock)
    const [description, setDescription] = useState(initial.description)
    const [usageInstructions, setUsageInstructions] = useState(initial.usageInstructions)
    const [ingredients, setIngredients] = useState(initial.ingredients)
    const [diseaseTargets, setDiseaseTargets] = useState(initial.diseaseTargets.join(", ")) // string input
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState(initial.imageUrl)

    useEffect(() => {
        setName(initial.name)
        setPrice(initial.price)
        setStock(initial.stock)
        setDescription(initial.description || "")
        setUsageInstructions(initial.usageInstructions || "")
        setIngredients(initial.ingredients || "")
        setDiseaseTargets(initial.diseaseTargets?.join(", ") || "")
        setPreview(initial.imageUrl)
        setFile(null)
    }, [initial])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()

        // serah mau pake required or alert or custom alert etc..
        // if (!name.trim()) return alert("Name is required")
        // if (!price || price <= 0) return alert("Price must be greater than 0")
        // if (stock === "" || stock < 0) return alert("Stock must be 0 or more")
        if (!file && !preview) return alert("Image is required")

        onSubmit({
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            description,
            usageInstructions,
            ingredients,
            diseaseTargets: diseaseTargets.split(",").map(d => d.trim()).filter(d => d), // turn string back to array
            file,
            currentImage: preview
        })
        handleClose()
    }

    const handleClose = () => {
        setName(initial.name)
        setPrice(initial.price)
        setStock(initial.stock)
        setDescription(initial.description)
        setUsageInstructions(initial.usageInstructions)
        setIngredients(initial.ingredients)
        setDiseaseTargets(initial.diseaseTargets.join(", "))
        setPreview(initial.imageUrl)
        setFile(null)
        onClose()
    }

    return (
        <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
            justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
            <div style={{
                background: "white", padding: "2rem", borderRadius: "8px",
                display: "flex", flexDirection: "column", gap: "1rem", minWidth: 300
            }}>
                <h2>{submitLabel}</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Product Name"
                        required
                    />

                    <input
                        type="number"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        placeholder="Price"
                        required
                    />

                    <input
                        type="number"
                        value={stock}
                        onChange={e => setStock(e.target.value)}
                        placeholder="Stock"
                        required
                    />

                    <textarea
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        placeholder="Description (optional)"
                    />

                    <textarea
                        value={usageInstructions}
                        onChange={e => setUsageInstructions(e.target.value)}
                        placeholder="Usage Instructions (optional)"
                    />

                    <textarea
                        value={ingredients}
                        onChange={e => setIngredients(e.target.value)}
                        placeholder="Ingredients (optional)"
                    />

                    <input
                        value={diseaseTargets}
                        onChange={e => setDiseaseTargets(e.target.value)}
                        placeholder="Disease Targets (comma separated)"
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => {
                            setFile(e.target.files[0])
                            setPreview(URL.createObjectURL(e.target.files[0]))
                        }}
                    />
                    {preview && <img src={preview} alt="" style={{ maxWidth: 200, margin: "1rem 0" }} />}

                    <button type="submit">{submitLabel}</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}