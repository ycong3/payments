"use client"

import { useEffect, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

// Types
export interface Product {
  id: string
  name: string
  price: number
  quantity: number
}

export interface ProductGroup {
  id: string
  name: string
  products: Product[]
  isOpen: boolean
}

export interface Payment {
  id: string
  date: string
  items: {
    productName: string
    groupName: string
    quantity: number
    price: number
  }[]
  total: number
  timestamp: string
}

export default function HomePage() {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [orderValue, setOrderValue] = useState(0)
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([])

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedGroups = localStorage.getItem("productGroups")
    const storedPayments = localStorage.getItem("paymentHistory")

    if (storedGroups) {
      setProductGroups(JSON.parse(storedGroups))

      // Initialize expanded state
      const groups = JSON.parse(storedGroups) as ProductGroup[]
      const initialExpandedState: Record<string, boolean> = {}
      groups.forEach((group) => {
        initialExpandedState[group.id] = group.isOpen
      })
      setExpandedGroups(initialExpandedState)
    } else {
      // Set default product groups if none exist
      const defaultGroups: ProductGroup[] = [
        {
          id: "1",
          name: "Keychains",
          isOpen: true,
          products: [
            { id: "1-1", name: "1 key chain", price: 4.0, quantity: 0 },
            { id: "1-2", name: "3 key chains", price: 10.0, quantity: 0 },
            { id: "1-3", name: "5 key chains", price: 15.0, quantity: 0 },
          ],
        },
        {
          id: "2",
          name: "Stickers",
          isOpen: true,
          products: [
            { id: "2-1", name: "1 sticker", price: 4.0, quantity: 0 },
            { id: "2-2", name: "3 stickers", price: 10.0, quantity: 0 },
          ],
        },
        {
          id: "3",
          name: "Magnets",
          isOpen: false,
          products: [{ id: "3-1", name: "1 magnet", price: 5.0, quantity: 0 }],
        },
      ]

      setProductGroups(defaultGroups)

      // Initialize expanded state
      const initialExpandedState: Record<string, boolean> = {}
      defaultGroups.forEach((group) => {
        initialExpandedState[group.id] = group.isOpen
      })
      setExpandedGroups(initialExpandedState)

      localStorage.setItem("productGroups", JSON.stringify(defaultGroups))
    }

    if (storedPayments) {
      setPaymentHistory(JSON.parse(storedPayments))
    }
  }, [])

  // Save product groups to localStorage whenever they change
  useEffect(() => {
    if (productGroups.length > 0) {
      localStorage.setItem("productGroups", JSON.stringify(productGroups))
    }
  }, [productGroups])

  // Calculate order value whenever product quantities change
  useEffect(() => {
    let total = 0
    productGroups.forEach((group) => {
      group.products.forEach((product) => {
        total += product.price * product.quantity
      })
    })
    setOrderValue(total)
  }, [productGroups])

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newState = { ...prev, [groupId]: !prev[groupId] }

      // Also update the isOpen property in productGroups
      setProductGroups((groups) =>
        groups.map((group) => (group.id === groupId ? { ...group, isOpen: !prev[groupId] } : group)),
      )

      return newState
    })
  }

  const incrementQuantity = (groupId: string, productId: string) => {
    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              products: group.products.map((product) =>
                product.id === productId ? { ...product, quantity: product.quantity + 1 } : product,
              ),
            }
          : group,
      ),
    )
  }

  const decrementQuantity = (groupId: string, productId: string) => {
    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              products: group.products.map((product) =>
                product.id === productId ? { ...product, quantity: Math.max(0, product.quantity - 1) } : product,
              ),
            }
          : group,
      ),
    )
  }

  const recordPayment = () => {
    if (orderValue <= 0) return

    const items = productGroups.flatMap((group) =>
      group.products
        .filter((product) => product.quantity > 0)
        .map((product) => ({
          productName: product.name,
          groupName: group.name,
          quantity: product.quantity,
          price: product.price,
        })),
    )

    if (items.length === 0) return

    const now = new Date()
    const formattedDate = now.toLocaleDateString()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const formattedTime = `${hours}:${minutes < 10 ? "0" + minutes : minutes} ${hours >= 12 ? "pm" : "am"}`

    const payment: Payment = {
      id: Date.now().toString(),
      date: formattedDate,
      items,
      total: orderValue,
      timestamp: formattedTime,
    }

    const updatedHistory = [payment, ...paymentHistory]
    setPaymentHistory(updatedHistory)
    localStorage.setItem("paymentHistory", JSON.stringify(updatedHistory))

    // Reset quantities
    setProductGroups((groups) =>
      groups.map((group) => ({
        ...group,
        products: group.products.map((product) => ({
          ...product,
          quantity: 0,
        })),
      })),
    )
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="text-sm text-gray-500 mb-1">Home page</div>
      <h1 className="text-xl font-bold mb-4">Payment recorder</h1>

      <div className="flex gap-2 mb-6">
        <a href="/edit-products" className="px-4 py-2 text-sm border border-blue-500 text-blue-500 rounded-md">
          Edit products
        </a>
        <a
          href="/payment-history"
          className="px-4 py-2 text-sm border border-blue-500 text-blue-500 rounded-md flex items-center"
        >
          Payment history ({paymentHistory.length})
        </a>
      </div>

      {productGroups.map((group) => (
        <div key={group.id} className="mb-4">
          <div className="flex items-center cursor-pointer mb-2" onClick={() => toggleGroup(group.id)}>
            {expandedGroups[group.id] ? (
              <ChevronDown className="w-5 h-5 mr-1" />
            ) : (
              <ChevronRight className="w-5 h-5 mr-1" />
            )}
            <span className="font-medium">{group.name}</span>
          </div>

          {expandedGroups[group.id] && (
            <div className="space-y-2">
              {group.products.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex-1">{product.name}</div>
                  <div className="w-16 text-right">${product.price.toFixed(2)}</div>
                  <div className="flex items-center ml-4">
                    <button
                      className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center"
                      onClick={() => decrementQuantity(group.id, product.id)}
                    >
                      <span className="text-lg">-</span>
                    </button>
                    <span className="w-8 text-center">{product.quantity}</span>
                    <button
                      className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center"
                      onClick={() => incrementQuantity(group.id, product.id)}
                    >
                      <span className="text-lg">+</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="mt-8 pt-4 border-t">
        <div className="flex justify-between mb-4">
          <div className="font-medium">Order value</div>
          <div className="font-medium">${orderValue.toFixed(2)}</div>
        </div>
        <button
          className="w-full py-3 bg-green-500 text-white rounded-md font-medium"
          onClick={recordPayment}
          disabled={orderValue <= 0}
        >
          Record payment
        </button>
      </div>
    </div>
  )
}
