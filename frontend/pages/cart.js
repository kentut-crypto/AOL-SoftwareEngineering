import React, { useEffect, useRef, useState } from "react"
import axiosInstance from "../axiosInstance"
import { useAuth } from "@/context/AuthContext"

export default function CartPage() {
    const { user } = useAuth()
    const [cartItems, setCartItems] = useState([])
    const [checkedItems, setCheckedItems] = useState([])
    const [isCalculatingTotal, setIsCalculatingTotal] = useState(false)
    const [total, setTotal] = useState(0)
    const [isDebouncing, setIsDebouncing] = useState(false)

    const debounceTimeout = useRef({})
    const calcTimeout = useRef(null)

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await axiosInstance.get("/cart")
                setCartItems(res.data.data)
            } catch (err) {
                console.error("Failed to fetch cart items", err)
            }
        }

        fetchCart()
    }, [])

    const handleQuantityChange = (id, quantity) => {
        if (!id) return
        
        setCartItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: quantity } : item
            )
        )
        setIsDebouncing(true)

        if (debounceTimeout.current[id]) clearTimeout(debounceTimeout.current[id])

        debounceTimeout.current[id] = setTimeout(async () => {
            try {
                await axiosInstance.put(`/cart/${id}`, { quantity })
            } catch (err) {
                console.error("Update failed", err)
            } finally {
                delete debounceTimeout.current[id]
                if (Object.keys(debounceTimeout.current).length === 0) {
                    setIsDebouncing(false)
                }
            }
        }, 800)
    }

    const handleRemoveItem = async id => {
        try {
            await axiosInstance.delete(`/cart/${id}`)
            setCartItems(cartItems.filter(item => item.id !== id))
        } catch (err) {
            console.error("Failed to delete cart item", err)
        }
    }

    const handleCheckout = async () => {
        if (user.money < total) {
            alert("Insufficient balance")
            return
        }
        try {
            const itemsToBuy = cartItems
            .filter(i => checkedItems.includes(i.productId))
            .map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.product.price,
            }))

            await axiosInstance.post("/order", {
                items: itemsToBuy,
                totalPrice: total
            })

            await axiosInstance.delete("/cart", {
                data: { productIds: checkedItems }
            })
            setCartItems(items => items.filter(i => !checkedItems.includes(i.productId)))
            setCheckedItems([])
        } catch (err) {
            console.error("Checkout failed", err)
        }
    }

    useEffect(() => {
        if (isDebouncing) return

        setIsCalculatingTotal(true)

        if (calcTimeout.current) clearTimeout(calcTimeout.current)

        calcTimeout.current = setTimeout(() => {
            const totalAmount = cartItems
                .filter(item => checkedItems.includes(item.productId))
                .reduce((acc, item) => acc + item.quantity * item.product.price, 0)
            setTotal(totalAmount)
            setIsCalculatingTotal(false)
        }, 300)
    }, [cartItems, checkedItems, isDebouncing])

    const isCheckoutDisabled = checkedItems.length === 0 || isDebouncing || isCalculatingTotal

    const handleCheckboxChange = (productId, checked) => {
        if (checked) {
            setCheckedItems([...checkedItems, productId])
        } else {
            setCheckedItems(checkedItems.filter(id => id !== productId))
        }
    }

    return (
        <div>
            <h1>Shopping Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
            ) : (
                <div>
                    <div>
                        {cartItems.map(item => (
                            <div key={item.id}>
                                <input
                                    type="checkbox"
                                    checked={checkedItems.includes(item.productId)}
                                    onChange={e =>
                                        handleCheckboxChange(item.productId, e.target.checked)
                                    }
                                />
                                <img src={`${process.env.NEXT_PUBLIC_API_URL}${item.product.imageUrl}`} alt={item.product.name} />
                                <div>
                                    <h3>{item.product.name}</h3>
                                    <p>{Number(item.product.price).toLocaleString("id-ID")}</p>
                                    <div>
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            min="1"
                                            max={item.product.stock}
                                            onChange={e => {
                                                let value = parseInt(e.target.value)
                                                if (isNaN(value) || value < 1) value = 1
                                                if (value > item.product.stock) value = item.product.stock
                                                handleQuantityChange(item.id, value)
                                            }}
                                        />
                                        <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}>
                                            +
                                        </button>
                                    </div>
                                    <button onClick={() => handleRemoveItem(item.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                        <div>
                            {(isCalculatingTotal || isDebouncing) ? (
                                <span>Calculating total...</span>
                            ) : (
                                <div>
                                    Total: Rp {Number(total).toLocaleString("id-ID")}
                                </div>
                            )}
                        </div>
                        <button onClick={handleCheckout} disabled={isCheckoutDisabled}>
                            {isCalculatingTotal ? (
                                <>
                                    Processing...
                                </>
                            ) : (
                                "Checkout"
                            )}
                        </button>
                </div>
            )}
        </div>
    )
}