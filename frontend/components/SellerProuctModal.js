"use client"
import { useState, useEffect } from "react"
import styles from "../styles/seller/modalSell.module.css"

export default function SellerProductModal({
    isOpen, onClose, onSubmit, initial = {
        name: "", price: "", imageUrl: "", stock: "",
        description: "", usageInstructions: "", ingredients: "", diseaseTargets: []
    }, submitLabel
}) {
    const [name, setName] = useState(initial.name)
    const [price, setPrice] = useState(initial.price)
    const [stock, setStock] = useState(initial.stock)
    const [description, setDescription] = useState(initial.description)
    const [usageInstructions, setUsageInstructions] = useState(initial.usageInstructions)
    const [ingredients, setIngredients] = useState(initial.ingredients)
    const [diseaseTargets, setDiseaseTargets] = useState(initial.diseaseTargets.join(", "))
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

        if (!file && !preview) return alert("Image is required")

        onSubmit({
            name,
            price: parseFloat(price),
            stock: parseInt(stock),
            description,
            usageInstructions,
            ingredients,
            diseaseTargets: diseaseTargets.split(",").map(d => d.trim()).filter(Boolean),
            file,
            currentImage: preview
        })
        handleClose()
    }

    const handleClose = () => {
        onClose()
    }

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
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
                    {preview && <img src={preview} alt="" style={{ maxWidth: 200 }} />}

                    <button type="submit">{submitLabel}</button>
                    <button type="button" onClick={handleClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}
