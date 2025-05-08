"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2, Download, GripVertical, Settings } from "lucide-react"
import PWAInstallPrompt from "./pwa"

// Types
interface Product {
  id: string
  name: string
  price: number
  quantity: number
  _priceInput?: string
}

interface ProductGroup {
  id: string
  name: string
  products: Product[]
  isOpen: boolean
  order: number
  color?: string // Add color property
}

interface Payment {
  id: string
  date: string
  eventName?: string
  items: {
    productName: string
    groupName: string
    quantity: number
    price: number
    groupColor?: string // Add group color to items
  }[]
  total: number
  subtotal?: number
  tax?: number
  taxRate?: number
  includeTax?: boolean
  timestamp: string
}

// Views
type View = "home" | "edit-products" | "payment-history" | "settings" | "review-order"

// Color options
const colorOptions = [
  { name: "None", value: "" },
  { name: "Pink", value: "#ff6b81" },
  { name: "Rose", value: "#f06292" },
  { name: "Purple", value: "#d881ed" },
  { name: "Lavender", value: "#b388ff" },
  { name: "Indigo", value: "#8c9eff" },
  { name: "Blue", value: "#64b5f6" },
  { name: "Sky", value: "#4fc3f7" },
  { name: "Cyan", value: "#4dd0e1" },
  { name: "Teal", value: "#4db6ac" },
  { name: "Green", value: "#66bb6a" },
  { name: "Lime", value: "#9ccc65" },
  { name: "Yellow", value: "#ffeb3b" },
  { name: "Amber", value: "#ffc107" },
  { name: "Orange", value: "#ff9800" },
  { name: "Red", value: "#ff5252" },
]

export default function PaymentRecorderApp() {
  // State
  const [currentView, setCurrentView] = useState<View>("home")
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({})
  const [orderValue, setOrderValue] = useState(0)
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([])
  const [includeTax, setIncludeTax] = useState(false)
  const [taxRate, setTaxRate] = useState(8.75)
  const [taxAmount, setTaxAmount] = useState(0)
  const [totalWithTax, setTotalWithTax] = useState(0)

  // Drag and drop state
  const [draggedGroup, setDraggedGroup] = useState<string | null>(null)
  const [draggedProduct, setDraggedProduct] = useState<{ groupId: string; productId: string } | null>(null)
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null)
  const [dragOverProduct, setDragOverProduct] = useState<{ groupId: string; productId: string } | null>(null)

  // Custom item state
  const [showCustomItemModal, setShowCustomItemModal] = useState(false)
  const [customItem, setCustomItem] = useState({ name: "", price: "", quantity: 1 })

  // Event name state
  const [editEventModal, setEditEventModal] = useState<{ show: boolean; date: string; name: string }>({
    show: false,
    date: "",
    name: "",
  })

  // Modals
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupColor, setNewGroupColor] = useState("")
  const [editGroupModal, setEditGroupModal] = useState<{ show: boolean; id: string; name: string; color: string }>({
    show: false,
    id: "",
    name: "",
    color: "",
  })
  const [deleteGroupModal, setDeleteGroupModal] = useState<{ show: boolean; id: string }>({
    show: false,
    id: "",
  })
  const [showDeletePaymentConfirm, setShowDeletePaymentConfirm] = useState<{ show: boolean; id: string }>({
    show: false,
    id: "",
  })

  const [deleteProductModal, setDeleteProductModal] = useState<{ show: boolean; groupId: string; productId: string }>({
    show: false,
    groupId: "",
    productId: "",
  })

  const [paymentDetailModal, setPaymentDetailModal] = useState<{ show: boolean; payment: Payment | null }>({
    show: false,
    payment: null,
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedGroups = localStorage.getItem("productGroups")
    const storedPayments = localStorage.getItem("paymentHistory")
    const storedTaxRate = localStorage.getItem("taxRate")

    if (storedGroups) {
      const groups = JSON.parse(storedGroups) as ProductGroup[]

      // Add order property if it doesn't exist
      const groupsWithOrder = groups.map((group, index) => ({
        ...group,
        order: group.order !== undefined ? group.order : index,
      }))

      setProductGroups(groupsWithOrder)

      // Initialize expanded state
      const initialExpandedState: Record<string, boolean> = {}
      groupsWithOrder.forEach((group) => {
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
          order: 0,
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
          order: 1,
          products: [
            { id: "2-1", name: "1 sticker", price: 4.0, quantity: 0 },
            { id: "2-2", name: "3 stickers", price: 10.0, quantity: 0 },
          ],
        },
        {
          id: "3",
          name: "Magnets",
          isOpen: false,
          order: 2,
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
      const payments = JSON.parse(storedPayments) as Payment[]
      setPaymentHistory(payments)

      // Initialize expanded dates state - default to expanded
      const dates = [...new Set(payments.map((p) => p.date))]
      const initialExpandedDates: Record<string, boolean> = {}
      dates.forEach((date) => {
        initialExpandedDates[date] = true
      })
      setExpandedDates(initialExpandedDates)
    }

    if (storedTaxRate) {
      setTaxRate(Number.parseFloat(storedTaxRate))
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

    // Calculate tax amount and total with tax
    const tax = (total * taxRate) / 100
    setTaxAmount(tax)
    setTotalWithTax(total + tax)
  }, [productGroups, taxRate])

  // Home page functions
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

  // Toggle date expansion in payment history
  const toggleDate = (date: string) => {
    setExpandedDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }))
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

  const clearAllQuantities = () => {
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

  const recordPayment = () => {
    if (orderValue <= 0) return

    const items = productGroups.flatMap((group) =>
      group.products
        .filter((product) => product.quantity > 0)
        .map((product) => ({
          productName: product.name,
          groupName: group.name,
          groupColor: group.color, // Include group color in payment items
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

    // Check if there's an existing payment for this date to preserve the event name
    const existingEventName = getEventNameForDate(formattedDate)

    const finalTotal = includeTax ? totalWithTax : orderValue

    const payment: Payment = {
      id: Date.now().toString(),
      date: formattedDate,
      eventName: existingEventName, // Preserve the event name
      items,
      subtotal: orderValue,
      tax: includeTax ? taxAmount : undefined,
      taxRate: includeTax ? taxRate : undefined,
      includeTax,
      total: finalTotal,
      timestamp: formattedTime,
    }

    const updatedHistory = [payment, ...paymentHistory]
    setPaymentHistory(updatedHistory)
    localStorage.setItem("paymentHistory", JSON.stringify(updatedHistory))

    // Make sure the new date is expanded
    setExpandedDates((prev) => ({
      ...prev,
      [formattedDate]: true,
    }))

    // Reset quantities and tax inclusion
    setProductGroups((groups) =>
      groups.map((group) => ({
        ...group,
        products: group.products.map((product) => ({
          ...product,
          quantity: 0,
        })),
      })),
    )
    setIncludeTax(false)
    setCurrentView("home")
  }

  // Custom item functions
  const handleAddCustomItem = () => {
    if (!customItem.name.trim() || !customItem.price.trim()) return

    const price = Number.parseFloat(customItem.price)
    if (isNaN(price) || price <= 0) return

    // Create a temporary group for custom items if it doesn't exist
    let customGroupId = ""
    const customGroup = productGroups.find((group) => group.name === "Custom Items")

    if (!customGroup) {
      customGroupId = "custom-" + Date.now()
      const newCustomGroup: ProductGroup = {
        id: customGroupId,
        name: "Custom Items",
        isOpen: true,
        order: productGroups.length,
        products: [],
      }

      setProductGroups((prev) => [...prev, newCustomGroup])
      setExpandedGroups((prev) => ({ ...prev, [customGroupId]: true }))
      customGroupId = newCustomGroup.id
    } else {
      customGroupId = customGroup.id
    }

    // Add the custom item to the group
    const customProductId = "custom-product-" + Date.now()

    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === customGroupId
          ? {
              ...group,
              products: [
                ...group.products,
                {
                  id: customProductId,
                  name: customItem.name,
                  price: price,
                  quantity: customItem.quantity,
                },
              ],
            }
          : group,
      ),
    )

    // Reset the custom item form
    setCustomItem({ name: "", price: "", quantity: 1 })
    setShowCustomItemModal(false)
  }

  // Edit products functions
  const updateProductName = (groupId: string, productId: string, name: string) => {
    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              products: group.products.map((product) => (product.id === productId ? { ...product, name } : product)),
            }
          : group,
      ),
    )
  }

  const updateProductPrice = (groupId: string, productId: string, priceStr: string) => {
    // Allow any input during editing, including decimal points
    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              products: group.products.map((product) =>
                product.id === productId
                  ? {
                      ...product,
                      // Store the raw string value in a temporary property during editing
                      price: Number.parseFloat(priceStr) || 0,
                      _priceInput: priceStr, // Store the raw input
                    }
                  : product,
              ),
            }
          : group,
      ),
    )
  }

  const deleteProduct = (groupId: string, productId: string) => {
    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              products: group.products.filter((product) => product.id !== productId),
            }
          : group,
      ),
    )
  }

  const addProduct = (groupId: string) => {
    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              products: [
                ...group.products,
                {
                  id: `${groupId}-${Date.now()}`,
                  name: "New product",
                  price: 0,
                  quantity: 0,
                },
              ],
            }
          : group,
      ),
    )
  }

  const addGroup = () => {
    if (!newGroupName.trim()) return

    const newGroup: ProductGroup = {
      id: Date.now().toString(),
      name: newGroupName,
      isOpen: true,
      order: productGroups.length,
      products: [],
      color: newGroupColor, // Add color to new group
    }

    setProductGroups([...productGroups, newGroup])
    setExpandedGroups((prev) => ({ ...prev, [newGroup.id]: true }))
    setNewGroupName("")
    setNewGroupColor("")
    setShowNewGroupModal(false)
  }

  const updateGroupName = () => {
    if (!editGroupModal.name.trim()) return

    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === editGroupModal.id
          ? {
              ...group,
              name: editGroupModal.name,
              color: editGroupModal.color, // Update color
            }
          : group,
      ),
    )

    setEditGroupModal({ show: false, id: "", name: "", color: "" })
  }

  const deleteGroup = () => {
    setProductGroups((groups) => groups.filter((group) => group.id !== deleteGroupModal.id))
    setDeleteGroupModal({ show: false, id: "" })
  }

  // Drag and drop functions
  const handleDragStartGroup = (e: React.DragEvent, groupId: string) => {
    setDraggedGroup(groupId)
    e.dataTransfer.effectAllowed = "move"

    // Add ghost image for smoother drag appearance
    const element = document.querySelector(`[data-group-id="${groupId}"]`)
    if (element) {
      // Create a clone of the element for the drag image
      const rect = element.getBoundingClientRect()
      const ghostElement = element.cloneNode(true) as HTMLElement
      ghostElement.style.width = `${rect.width}px`
      ghostElement.style.position = "absolute"
      ghostElement.style.top = "-1000px"
      ghostElement.style.opacity = "0.7"
      document.body.appendChild(ghostElement)

      e.dataTransfer.setDragImage(ghostElement, 20, 20)

      // Remove the ghost element after drag
      setTimeout(() => {
        document.body.removeChild(ghostElement)
      }, 0)
    }
  }

  const handleDragOverGroup = (e: React.DragEvent, groupId: string) => {
    e.preventDefault()
    if (draggedGroup && draggedGroup !== groupId) {
      setDragOverGroup(groupId)
    }
  }

  const handleDropGroup = (e: React.DragEvent, targetGroupId: string) => {
    e.preventDefault()
    if (!draggedGroup || draggedGroup === targetGroupId) return

    const sortedGroups = [...productGroups].sort((a, b) => a.order - b.order)

    const sourceIndex = sortedGroups.findIndex((group) => group.id === draggedGroup)
    const targetIndex = sortedGroups.findIndex((group) => group.id === targetGroupId)

    if (sourceIndex < 0 || targetIndex < 0) return

    // Reorder the groups
    const newGroups = [...sortedGroups]
    const [movedGroup] = newGroups.splice(sourceIndex, 1)
    newGroups.splice(targetIndex, 0, movedGroup)

    // Update order property
    const updatedGroups = newGroups.map((group, index) => ({
      ...group,
      order: index,
    }))

    setProductGroups(updatedGroups)
    setDraggedGroup(null)
    setDragOverGroup(null)
  }

  const handleDragEndGroup = () => {
    setDraggedGroup(null)
    setDragOverGroup(null)
  }

  const handleDragStartProduct = (e: React.DragEvent, groupId: string, productId: string) => {
    setDraggedProduct({ groupId, productId })
    e.dataTransfer.effectAllowed = "move"

    // Add ghost image for smoother drag appearance
    const element = document.querySelector(`[data-group-id="${groupId}"][data-product-id="${productId}"]`)
    if (element) {
      // Create a clone of the element for the drag image
      const rect = element.getBoundingClientRect()
      const ghostElement = element.cloneNode(true) as HTMLElement
      ghostElement.style.width = `${rect.width}px`
      ghostElement.style.position = "absolute"
      ghostElement.style.top = "-1000px"
      ghostElement.style.opacity = "0.7"
      document.body.appendChild(ghostElement)

      e.dataTransfer.setDragImage(ghostElement, 20, 20)

      // Remove the ghost element after drag
      setTimeout(() => {
        document.body.removeChild(ghostElement)
      }, 0)
    }
  }

  const handleDragOverProduct = (e: React.DragEvent, groupId: string, productId: string) => {
    e.preventDefault()
    if (draggedProduct && !(draggedProduct.groupId === groupId && draggedProduct.productId === productId)) {
      setDragOverProduct({ groupId, productId })
    }
  }

  const handleDropProduct = (e: React.DragEvent, targetGroupId: string, targetProductId: string) => {
    e.preventDefault()
    if (!draggedProduct) return

    const { groupId: sourceGroupId, productId: sourceProductId } = draggedProduct

    // If dropping on the same product, do nothing
    if (sourceGroupId === targetGroupId && sourceProductId === targetProductId) return

    const sourceGroup = productGroups.find((group) => group.id === sourceGroupId)
    const targetGroup = productGroups.find((group) => group.id === targetGroupId)

    if (!sourceGroup || !targetGroup) return

    const sourceProduct = sourceGroup.products.find((product) => product.id === sourceProductId)

    if (!sourceProduct) return

    // If dropping in the same group, reorder products
    if (sourceGroupId === targetGroupId) {
      const sourceIndex = sourceGroup.products.findIndex((product) => product.id === sourceProductId)
      const targetIndex = targetGroup.products.findIndex((product) => product.id === targetProductId)

      if (sourceIndex < 0 || targetIndex < 0) return

      const newProducts = [...sourceGroup.products]
      const [movedProduct] = newProducts.splice(sourceIndex, 1)
      newProducts.splice(targetIndex, 0, movedProduct)

      setProductGroups((groups) =>
        groups.map((group) => (group.id === sourceGroupId ? { ...group, products: newProducts } : group)),
      )
    } else {
      // If dropping in a different group, move product between groups
      const updatedSourceGroup = {
        ...sourceGroup,
        products: sourceGroup.products.filter((product) => product.id !== sourceProductId),
      }

      const targetIndex = targetGroup.products.findIndex((product) => product.id === targetProductId)
      const newTargetProducts = [...targetGroup.products]

      // Create a new product with a new ID for the target group
      const movedProduct = {
        ...sourceProduct,
        id: `${targetGroupId}-${Date.now()}`,
      }

      newTargetProducts.splice(targetIndex + 1, 0, movedProduct)

      const updatedTargetGroup = {
        ...targetGroup,
        products: newTargetProducts,
      }

      setProductGroups((groups) =>
        groups.map((group) => {
          if (group.id === sourceGroupId) return updatedSourceGroup
          if (group.id === targetGroupId) return updatedTargetGroup
          return group
        }),
      )
    }

    setDraggedProduct(null)
    setDragOverProduct(null)
  }

  const handleDragEndProduct = () => {
    setDraggedProduct(null)
    setDragOverProduct(null)
  }

  // Payment history functions
  const deletePayment = (id: string) => {
    const updatedPayments = paymentHistory.filter((payment) => payment.id !== id)
    setPaymentHistory(updatedPayments)
    localStorage.setItem("paymentHistory", JSON.stringify(updatedPayments))
    setShowDeletePaymentConfirm({ show: false, id: "" })
  }

  const updateEventName = () => {
    if (!editEventModal.date) return

    const updatedPayments = paymentHistory.map((payment) => {
      if (payment.date === editEventModal.date) {
        return {
          ...payment,
          eventName: editEventModal.name,
        }
      }
      return payment
    })

    setPaymentHistory(updatedPayments)
    localStorage.setItem("paymentHistory", JSON.stringify(updatedPayments))
    setEditEventModal({ show: false, date: "", name: "" })
  }

  // Export payment history to CSV
  const exportToCSV = () => {
    // Create CSV header
    let csv = "Date,Event,Time,Items,Subtotal,Tax,Total\n"

    // Add data rows
    paymentHistory.forEach((payment) => {
      const date = payment.date
      const event = payment.eventName || ""
      const time = payment.timestamp
      const items = payment.items.map((item) => `${item.quantity}x ${item.productName}`).join("; ")
      const subtotal = payment.subtotal?.toFixed(2) || payment.total.toFixed(2)
      const tax = payment.tax?.toFixed(2) || "0.00"
      const total = payment.total.toFixed(2)

      // Escape fields that might contain commas
      const escapedItems = `"${items}"`
      const escapedEvent = event.includes(",") ? `"${event}"` : event

      csv += `${date},${escapedEvent},${time},${escapedItems},${subtotal},${tax},${total}\n`
    })

    // Create download link
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `payment-history-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Group payments by date
  const paymentsByDate: Record<string, Payment[]> = {}
  paymentHistory.forEach((payment) => {
    if (!paymentsByDate[payment.date]) {
      paymentsByDate[payment.date] = []
    }
    paymentsByDate[payment.date].push(payment)
  })

  // Get event name for a date
  const getEventNameForDate = (date: string) => {
    const paymentsForDate = paymentsByDate[date] || []
    return paymentsForDate[0]?.eventName || ""
  }

  const getDailySummary = (date: string) => {
    const paymentsForDate = paymentsByDate[date] || []

    // Create a map to count items
    const itemCounts: Record<string, { count: number; groupName: string; groupColor?: string }> = {}

    paymentsForDate.forEach((payment) => {
      payment.items.forEach((item) => {
        const key = item.productName
        if (!itemCounts[key]) {
          itemCounts[key] = {
            count: 0,
            groupName: item.groupName,
            groupColor: item.groupColor,
          }
        }
        itemCounts[key].count += item.quantity
      })
    })

    return Object.entries(itemCounts)
      .sort((a, b) => b[1].count - a[1].count) // Sort by count, highest first
      .map(([name, data]) => ({
        name,
        count: data.count,
        groupName: data.groupName,
        groupColor: data.groupColor,
      }))
  }

  // Calculate total sales for a date
  const getTotalSalesForDate = (date: string) => {
    const paymentsForDate = paymentsByDate[date] || []
    return paymentsForDate.reduce((total, payment) => total + payment.total, 0)
  }

  // Save tax rate
  const saveTaxRate = (rate: number) => {
    setTaxRate(rate)
    localStorage.setItem("taxRate", rate.toString())
  }

  // Sort product groups by order
  const sortedProductGroups = [...productGroups].sort((a, b) => a.order - b.order)

  // Get items for review
  const getItemsForReview = () => {
    return productGroups.flatMap((group) =>
      group.products
        .filter((product) => product.quantity > 0)
        .map((product) => ({
          productName: product.name,
          groupName: group.name,
          groupColor: group.color,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
        })),
    )
  }

  // Render the current view
  const renderView = () => {
    switch (currentView) {
      case "home":
        return (
          <>
            <div
              className="sticky top-0 bg-white z-10 pt-2 pb-3 border-b mb-4 transition-all duration-300 w-screen left-0"
              id="stickyHeader"
              style={{
                marginLeft: "-1rem",
                width: "calc(100% + 2rem)",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                marginTop: "-1rem",
                paddingTop: "1rem",
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-xl font-bold">Payment recorder</h1>
                <button
                  onClick={() => setCurrentView("settings")}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2 mb-2" id="navButtons">
                <button
                  onClick={() => setCurrentView("edit-products")}
                  className="px-4 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md"
                >
                  Edit products
                </button>
                <button
                  onClick={() => setCurrentView("payment-history")}
                  className="px-4 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md flex items-center"
                >
                  History ({paymentHistory.length})
                </button>
                <button
                  onClick={() => setShowCustomItemModal(true)}
                  className="px-4 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Custom
                </button>
              </div>
            </div>

            {sortedProductGroups.map((group) => (
              <div key={group.id} className="mb-4 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <div
                  className="flex items-center cursor-pointer p-3 border-b border-gray-200"
                  onClick={() => toggleGroup(group.id)}
                >
                  {group.color && (
                    <div className="w-4 h-4 rounded mr-2 flex-shrink-0" style={{ backgroundColor: group.color }}></div>
                  )}
                  {expandedGroups[group.id] ? (
                    <ChevronDown className="w-5 h-5 mr-1" />
                  ) : (
                    <ChevronRight className="w-5 h-5 mr-1" />
                  )}
                  <span className="font-medium">{group.name}</span>
                </div>

                {expandedGroups[group.id] && (
                  <div className="p-2">
                    {group.products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-2 border border-gray-200 rounded-md mb-2 bg-white"
                      >
                        <div className="flex-1">{product.name}</div>
                        <div className="w-16 text-right font-medium">${product.price.toFixed(2)}</div>
                        <div className="flex items-center ml-4">
                          <button
                            className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200"
                            onClick={() => decrementQuantity(group.id, product.id)}
                          >
                            <span className="text-lg">-</span>
                          </button>
                          <span className="w-8 text-center">{product.quantity}</span>
                          <button
                            className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center hover:bg-gray-200"
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

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-10 shadow-md">
              <div className="max-w-md mx-auto">
                <div className="flex justify-between mb-3">
                  <div className="font-medium">Order value</div>
                  <div className="font-medium text-lg">${orderValue.toFixed(2)}</div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors w-1/4"
                    onClick={clearAllQuantities}
                    disabled={orderValue <= 0}
                  >
                    Clear
                  </button>
                  <button
                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-md font-medium transition-colors"
                    onClick={() => orderValue > 0 && setCurrentView("review-order")}
                    disabled={orderValue <= 0}
                  >
                    Review order
                  </button>
                </div>
              </div>
            </div>
          </>
        )

      case "review-order":
        const itemsForReview = getItemsForReview()
        return (
          <>
            <div
              className="sticky top-0 bg-white z-10 pt-2 pb-3 border-b mb-4 transition-all duration-300 w-screen left-0"
              style={{
                marginLeft: "-1rem",
                width: "calc(100% + 2rem)",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                marginTop: "-1rem",
                paddingTop: "1rem",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold">Review order</h1>
              </div>
            </div>

            <div className="mb-6">
              {itemsForReview.map((item, index) => (
                <div key={index} className="flex items-center justify-between mb-2 p-2 border-b">
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-2">
                      {item.quantity} ×
                    </div>
                    <div className="flex items-center">
                      {item.groupColor && (
                        <div
                          className="w-3 h-3 rounded-full mr-1 flex-shrink-0"
                          style={{ backgroundColor: item.groupColor }}
                        ></div>
                      )}
                      <span>{item.productName}</span>
                    </div>
                  </div>
                  <div className="font-medium">${item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <div>Subtotal</div>
                <div className="font-medium">${orderValue.toFixed(2)}</div>
              </div>

              <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <span>Tax ({taxRate}%)</span>
                  <span className="text-xs text-gray-500 ml-2">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="relative inline-block w-12 h-6 mr-2">
                  <input
                    type="checkbox"
                    id="toggle"
                    className="sr-only"
                    checked={includeTax}
                    onChange={() => setIncludeTax(!includeTax)}
                  />
                  <label
                    htmlFor="toggle"
                    className={`block w-12 h-6 rounded-full transition-colors duration-300 ease-in-out ${
                      includeTax ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ease-in-out ${
                        includeTax ? "transform translate-x-6" : ""
                      }`}
                    ></span>
                  </label>
                </div>
              </div>

              <div className="flex justify-between mt-4 pt-2 border-t border-gray-300">
                <div className="font-bold">Total</div>
                <div className="font-bold text-lg">${includeTax ? totalWithTax.toFixed(2) : orderValue.toFixed(2)}</div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-10 shadow-md">
              <div className="max-w-md mx-auto">
                <div className="flex gap-2">
                  <button
                    className="py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium transition-colors w-1/4"
                    onClick={() => setCurrentView("home")}
                  >
                    Cancel
                  </button>
                  <button
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
                    onClick={recordPayment}
                  >
                    Record ${includeTax ? totalWithTax.toFixed(2) : orderValue.toFixed(2)}
                  </button>
                </div>
              </div>
            </div>
          </>
        )

      case "settings":
        return (
          <>
            <div
              className="sticky top-0 bg-white z-10 pt-2 pb-3 border-b mb-4 transition-all duration-300 w-screen left-0"
              style={{
                marginLeft: "-1rem",
                width: "calc(100% + 2rem)",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                marginTop: "-1rem",
                paddingTop: "1rem",
              }}
            >
              <div className="flex items-center mb-4">
                <button onClick={() => setCurrentView("home")} className="mr-2">
                  <ChevronRight className="w-6 h-6 transform rotate-180" />
                </button>
                <h1 className="text-xl font-bold">Settings</h1>
              </div>
            </div>

            <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h2 className="font-medium mb-2">Sales tax rate</h2>
              <p className="text-sm text-gray-500 mb-3">Used to calculate sales tax</p>
              <div className="flex items-center">
                <input
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="flex-1 p-2 border rounded-md mr-2"
                  step="0.01"
                  min="0"
                  max="100"
                />
                <span className="text-lg">%</span>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-10 shadow-md">
              <div className="max-w-md mx-auto">
                <button
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
                  onClick={() => {
                    saveTaxRate(taxRate)
                    setCurrentView("home")
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )

      case "edit-products":
        return (
          <>
            <div
              className="sticky top-0 bg-white z-50 pt-2 pb-3 border-b mb-4 flex justify-between items-center w-screen left-0"
              style={{
                marginLeft: "-1rem",
                width: "calc(100% + 2rem)",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                marginTop: "-1rem",
                paddingTop: "1rem",
              }}
            >
              <h1 className="text-xl font-bold">Edit products</h1>
              <button className="text-blue-500" onClick={() => setCurrentView("home")}>
                Cancel
              </button>
            </div>

            {sortedProductGroups.map((group) => (
              <div
                key={group.id}
                className={`mb-6 bg-gray-50 rounded-lg overflow-hidden ${
                  dragOverGroup === group.id ? "border-2 border-dashed border-blue-300" : "border border-gray-200"
                }`}
                draggable
                onDragStart={(e) => handleDragStartGroup(e, group.id)}
                onDragOver={(e) => handleDragOverGroup(e, group.id)}
                onDrop={(e) => handleDropGroup(e, group.id)}
                onDragEnd={handleDragEndGroup}
                onTouchStart={(e) => {
                  const touch = e.touches[0]
                  setDraggedGroup(group.id)
                }}
                onTouchMove={(e) => {
                  e.preventDefault()
                  const touch = e.touches[0]
                  const elements = document.elementsFromPoint(touch.clientX, touch.clientY)
                  const groupElement = elements.find((el) => el.getAttribute("data-group-id"))
                  if (groupElement) {
                    const targetGroupId = groupElement.getAttribute("data-group-id")
                    if (targetGroupId && draggedGroup && draggedGroup !== targetGroupId) {
                      setDragOverGroup(targetGroupId)
                    }
                  }
                }}
                onTouchEnd={(e) => {
                  if (!dragOverGroup || !draggedGroup) {
                    setDraggedGroup(null)
                    setDragOverGroup(null)
                    return
                  }

                  const sortedGroups = [...productGroups].sort((a, b) => a.order - b.order)
                  const sourceIndex = sortedGroups.findIndex((g) => g.id === draggedGroup)
                  const targetIndex = sortedGroups.findIndex((g) => g.id === dragOverGroup)

                  if (sourceIndex < 0 || targetIndex < 0) {
                    setDraggedGroup(null)
                    setDragOverGroup(null)
                    return
                  }

                  // Reorder the groups
                  const newGroups = [...sortedGroups]
                  const [movedGroup] = newGroups.splice(sourceIndex, 1)
                  newGroups.splice(targetIndex, 0, movedGroup)

                  // Update order property
                  const updatedGroups = newGroups.map((g, index) => ({
                    ...g,
                    order: index,
                  }))

                  setProductGroups(updatedGroups)
                  setDraggedGroup(null)
                  setDragOverGroup(null)
                }}
                data-group-id={group.id}
              >
                <div className="flex items-center p-3 border-b border-gray-200">
                  <div className="mr-2 cursor-move touch-none">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center cursor-pointer flex-1">
                    {group.color && (
                      <div
                        className="w-4 h-4 rounded mr-2 flex-shrink-0"
                        style={{ backgroundColor: group.color }}
                      ></div>
                    )}
                    {expandedGroups[group.id] ? (
                      <ChevronDown className="w-5 h-5 mr-1" onClick={() => toggleGroup(group.id)} />
                    ) : (
                      <ChevronRight className="w-5 h-5 mr-1" onClick={() => toggleGroup(group.id)} />
                    )}
                    <span className="font-medium">{group.name}</span>
                  </div>
                  <button
                    className="p-1 hover:bg-gray-200 rounded"
                    onClick={() =>
                      setEditGroupModal({
                        show: true,
                        id: group.id,
                        name: group.name,
                        color: group.color || "",
                      })
                    }
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="ml-2 p-1 hover:bg-gray-200 rounded" onClick={() => addProduct(group.id)}>
                    <Plus className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    className="ml-2 p-1 hover:bg-gray-200 rounded"
                    onClick={() => setDeleteGroupModal({ show: true, id: group.id })}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {expandedGroups[group.id] && (
                  <div className="p-3 space-y-2 overflow-hidden">
                    {group.products.map((product) => (
                      <div
                        key={product.id}
                        className={`flex items-center bg-white p-2 rounded-md border w-full ${
                          dragOverProduct?.groupId === group.id && dragOverProduct?.productId === product.id
                            ? "border-2 border-dashed border-blue-300"
                            : "border-gray-200"
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStartProduct(e, group.id, product.id)}
                        onDragOver={(e) => handleDragOverProduct(e, group.id, product.id)}
                        onDrop={(e) => handleDropProduct(e, group.id, product.id)}
                        onDragEnd={handleDragEndProduct}
                        onTouchStart={(e) => {
                          setDraggedProduct({ groupId: group.id, productId: product.id })
                        }}
                        onTouchMove={(e) => {
                          e.preventDefault()
                          const touch = e.touches[0]
                          const elements = document.elementsFromPoint(touch.clientX, touch.clientY)
                          const productElement = elements.find(
                            (el) => el.getAttribute("data-product-id") && el.getAttribute("data-group-id"),
                          )
                          if (productElement) {
                            const targetGroupId = productElement.getAttribute("data-group-id")
                            const targetProductId = productElement.getAttribute("data-product-id")
                            if (
                              targetGroupId &&
                              targetProductId &&
                              !(
                                draggedProduct?.groupId === targetGroupId &&
                                draggedProduct?.productId === targetProductId
                              )
                            ) {
                              setDragOverProduct({ groupId: targetGroupId, productId: targetProductId })
                            }
                          }
                        }}
                        onTouchEnd={(e) => {
                          if (!dragOverProduct || !draggedProduct) {
                            setDraggedProduct(null)
                            setDragOverProduct(null)
                            return
                          }

                          const { groupId: sourceGroupId, productId: sourceProductId } = draggedProduct
                          const { groupId: targetGroupId, productId: targetProductId } = dragOverProduct

                          // Handle product drop logic (similar to handleDropProduct)
                          const sourceGroup = productGroups.find((g) => g.id === sourceGroupId)
                          const targetGroup = productGroups.find((g) => g.id === targetGroupId)

                          if (!sourceGroup || !targetGroup) {
                            setDraggedProduct(null)
                            setDragOverProduct(null)
                            return
                          }

                          const sourceProduct = sourceGroup.products.find((p) => p.id === sourceProductId)

                          if (!sourceProduct) {
                            setDraggedProduct(null)
                            setDragOverProduct(null)
                            return
                          }

                          if (sourceGroupId === targetGroupId) {
                            const sourceIndex = sourceGroup.products.findIndex((p) => p.id === sourceProductId)
                            const targetIndex = targetGroup.products.findIndex((p) => p.id === targetProductId)

                            if (sourceIndex < 0 || targetIndex < 0) {
                              setDraggedProduct(null)
                              setDragOverProduct(null)
                              return
                            }

                            const newProducts = [...sourceGroup.products]
                            const [movedProduct] = newProducts.splice(sourceIndex, 1)
                            newProducts.splice(targetIndex, 0, movedProduct)

                            setProductGroups((groups) =>
                              groups.map((g) => (g.id === sourceGroupId ? { ...g, products: newProducts } : g)),
                            )
                          } else {
                            // If dropping in a different group, move product between groups
                            const updatedSourceGroup = {
                              ...sourceGroup,
                              products: sourceGroup.products.filter((p) => p.id !== sourceProductId),
                            }

                            const targetIndex = targetGroup.products.findIndex((p) => p.id === targetProductId)
                            const newTargetProducts = [...targetGroup.products]

                            // Create a new product with a new ID for the target group
                            const movedProduct = {
                              ...sourceProduct,
                              id: `${targetGroupId}-${Date.now()}`,
                            }

                            newTargetProducts.splice(targetIndex + 1, 0, movedProduct)

                            const updatedTargetGroup = {
                              ...targetGroup,
                              products: newTargetProducts,
                            }

                            setProductGroups((groups) =>
                              groups.map((g) => {
                                if (g.id === sourceGroupId) return updatedSourceGroup
                                if (g.id === targetGroupId) return updatedTargetGroup
                                return g
                              }),
                            )
                          }

                          setDraggedProduct(null)
                          setDragOverProduct(null)
                        }}
                        data-group-id={group.id}
                        data-product-id={product.id}
                      >
                        <div className="w-6 flex items-center justify-center cursor-move touch-none">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateProductName(group.id, product.id, e.target.value)}
                          className="flex-1 p-2 border rounded-md mr-2 min-w-0"
                        />
                        <input
                          type="text"
                          value={product._priceInput !== undefined ? product._priceInput : product.price.toString()}
                          onChange={(e) => updateProductPrice(group.id, product.id, e.target.value)}
                          onBlur={(e) => {
                            const price = Number.parseFloat(e.target.value) || 0
                            setProductGroups((groups) =>
                              groups.map((g) =>
                                g.id === group.id
                                  ? {
                                      ...g,
                                      products: g.products.map((p) =>
                                        p.id === product.id
                                          ? {
                                              ...p,
                                              price: price,
                                              _priceInput: undefined,
                                            }
                                          : p,
                                      ),
                                    }
                                  : g,
                              ),
                            )
                          }}
                          className="w-16 p-2 border rounded-md mr-2"
                        />
                        <button
                          className="p-1 hover:bg-gray-100 rounded flex-shrink-0"
                          onClick={() =>
                            setDeleteProductModal({ show: true, groupId: group.id, productId: product.id })
                          }
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button
              className="flex items-center justify-center w-full py-2 border border-dashed border-blue-500 text-blue-500 rounded-md mt-4 mb-24"
              onClick={() => setShowNewGroupModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add new group
            </button>

            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-10 shadow-md">
              <div className="max-w-md mx-auto">
                <button
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-medium transition-colors"
                  onClick={() => {
                    localStorage.setItem("productGroups", JSON.stringify(productGroups))
                    setCurrentView("home")
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )

      case "payment-history":
        return (
          <>
            <div
              className="sticky top-0 bg-white z-10 pt-2 pb-3 border-b mb-4 flex justify-between items-center w-screen left-0"
              style={{
                marginLeft: "-1rem",
                width: "calc(100% + 2rem)",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                marginTop: "-1rem",
                paddingTop: "1rem",
              }}
            >
              <h1 className="text-xl font-bold">Payment history</h1>
              <div className="flex gap-2">
                <button className="text-blue-500" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-1 inline" />
                  Export
                </button>
                <button className="text-blue-500" onClick={() => setCurrentView("home")}>
                  Cancel
                </button>
              </div>
            </div>

            {Object.keys(paymentsByDate).length === 0 && (
              <div className="text-center py-8 text-gray-500">No payment history yet</div>
            )}

            {Object.entries(paymentsByDate).map(([date, datePayments]) => (
              <div key={date} className="mb-6 bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                <div
                  className="flex flex-wrap items-center justify-between p-3 border-b border-gray-200 cursor-pointer"
                  onClick={() => toggleDate(date)}
                >
                  <div className="flex items-center">
                    {expandedDates[date] ? (
                      <ChevronDown className="w-5 h-5 mr-1" />
                    ) : (
                      <ChevronRight className="w-5 h-5 mr-1" />
                    )}
                    <h2 className="font-medium">{date}</h2>
                    <div className="ml-2 font-medium text-green-600">${getTotalSalesForDate(date).toFixed(2)}</div>
                  </div>
                  <div className="flex items-center mt-2 sm:mt-0">
                    {getEventNameForDate(date) && (
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                        {getEventNameForDate(date)}
                      </span>
                    )}
                    <button
                      className="text-blue-500 text-sm p-1 hover:bg-gray-100 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the accordion toggle
                        setEditEventModal({
                          show: true,
                          date,
                          name: getEventNameForDate(date),
                        })
                      }}
                    >
                      {getEventNameForDate(date) ? <Edit2 className="w-4 h-4" /> : "Add event"}
                    </button>
                  </div>
                </div>

                {expandedDates[date] && (
                  <div className="p-3 space-y-2">
                    {datePayments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white p-4 rounded-md border border-gray-200 cursor-pointer"
                        onClick={() => setPaymentDetailModal({ show: true, payment })}
                      >
                        <div className="flex justify-between mb-2">
                          <div className="text-sm text-gray-500">{payment.timestamp}</div>
                          <div className="flex items-center flex-shrink-0">
                            <span className="font-medium mr-2">${payment.total.toFixed(2)}</span>
                            <button
                              className="p-1 hover:bg-gray-100 rounded"
                              onClick={(e) => {
                                e.stopPropagation() // Prevent opening the detail modal
                                setShowDeletePaymentConfirm({ show: true, id: payment.id })
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {payment.items.map((item, idx) => (
                            <div key={idx} className="flex items-center">
                              <span className="bg-blue-100 text-blue-800 px-1 py-0.5 rounded text-xs font-medium mr-1">
                                {item.quantity} ×
                              </span>
                              <div className="flex items-center">
                                {item.groupColor && (
                                  <div
                                    className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                                    style={{ backgroundColor: item.groupColor }}
                                  ></div>
                                )}
                                <span>{item.productName}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {payment.includeTax && payment.tax !== undefined && (
                          <div className="mt-2 text-xs text-gray-500">
                            Includes tax: ${payment.tax.toFixed(2)} ({payment.taxRate}%)
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Daily Summary Section */}
                    <div className="mt-4 pt-4 border-t border-gray-300">
                      <h3 className="font-medium text-sm mb-2">Daily Summary</h3>
                      <div className="bg-gray-50 p-3 rounded-md">
                        {getDailySummary(date).map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between mb-1 last:mb-0">
                            <div className="flex items-center">
                              {item.groupColor && (
                                <div
                                  className="w-2 h-2 rounded-full mr-1 flex-shrink-0"
                                  style={{ backgroundColor: item.groupColor }}
                                ></div>
                              )}
                              <span>{item.name}</span>
                            </div>
                            <div className="font-medium">{item.count} sold</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 pb-32">
      {renderView()}
      <PWAInstallPrompt />

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">New group</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Group name</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name"
                className="w-full p-2 border rounded-md"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Group color (optional)</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`w-8 h-8 rounded-md border-2 ${!newGroupColor ? "border-blue-500" : "border-transparent"}`}
                  onClick={() => setNewGroupColor("")}
                >
                  <span className="sr-only">None</span>
                </button>
                {colorOptions.slice(1).map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-md border-2 ${newGroupColor === color.value ? "border-blue-500" : "border-transparent"}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setNewGroupColor(color.value)}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={addGroup}>
                Save
              </button>
              <button className="px-4 py-2 border rounded-md" onClick={() => setShowNewGroupModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editGroupModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Edit group</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Group name</label>
              <input
                type="text"
                value={editGroupModal.name}
                onChange={(e) => setEditGroupModal({ ...editGroupModal, name: e.target.value })}
                placeholder="Group name"
                className="w-full p-2 border rounded-md"
                autoFocus
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Group color (optional)</label>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`w-8 h-8 rounded-md border-2 ${!editGroupModal.color ? "border-blue-500" : "border-transparent"}`}
                  onClick={() => setEditGroupModal({ ...editGroupModal, color: "" })}
                >
                  <span className="sr-only">None</span>
                </button>
                {colorOptions.slice(1).map((color) => (
                  <button
                    key={color.value}
                    className={`w-8 h-8 rounded-md border-2 ${editGroupModal.color === color.value ? "border-blue-500" : "border-transparent"}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setEditGroupModal({ ...editGroupModal, color: color.value })}
                  >
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={updateGroupName}>
                Save
              </button>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setEditGroupModal({ show: false, id: "", name: "", color: "" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Group Modal */}
      {deleteGroupModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Are you sure to delete group?</h3>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-red-500 text-white rounded-md" onClick={deleteGroup}>
                Delete
              </button>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setDeleteGroupModal({ show: false, id: "" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Payment Confirmation Modal */}
      {showDeletePaymentConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Are you sure you want to delete this payment?</h3>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => deletePayment(showDeletePaymentConfirm.id)}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setShowDeletePaymentConfirm({ show: false, id: "" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Item Modal */}
      {showCustomItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Add Custom Item</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Item Name</label>
                <input
                  type="text"
                  value={customItem.name}
                  onChange={(e) => setCustomItem({ ...customItem, name: e.target.value })}
                  placeholder="Enter item name"
                  className="w-full p-2 border rounded-md"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="text"
                  value={customItem.price}
                  onChange={(e) => setCustomItem({ ...customItem, price: e.target.value })}
                  placeholder="0.00"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={customItem.quantity}
                  onChange={(e) => setCustomItem({ ...customItem, quantity: Number.parseInt(e.target.value) || 1 })}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={handleAddCustomItem}>
                Add to Cart
              </button>
              <button className="px-4 py-2 border rounded-md" onClick={() => setShowCustomItemModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editEventModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">{editEventModal.name ? "Edit Event Name" : "Add Event Name"}</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Event Name for {editEventModal.date}</label>
              <input
                type="text"
                value={editEventModal.name}
                onChange={(e) => setEditEventModal({ ...editEventModal, name: e.target.value })}
                placeholder="Enter event name"
                className="w-full p-2 border rounded-md"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={updateEventName}>
                Save
              </button>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setEditEventModal({ show: false, date: "", name: "" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {deleteProductModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Are you sure you want to delete this product?</h3>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => {
                  deleteProduct(deleteProductModal.groupId, deleteProductModal.productId)
                  setDeleteProductModal({ show: false, groupId: "", productId: "" })
                }}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setDeleteProductModal({ show: false, groupId: "", productId: "" })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {paymentDetailModal.show && paymentDetailModal.payment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Payment Details</h3>
              <button
                className="p-1 hover:bg-gray-100 rounded"
                onClick={() => setPaymentDetailModal({ show: false, payment: null })}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Date & Time</div>
              <div>
                {paymentDetailModal.payment.date} at {paymentDetailModal.payment.timestamp}
              </div>
            </div>
            {paymentDetailModal.payment.eventName && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Event</div>
                <div>{paymentDetailModal.payment.eventName}</div>
              </div>
            )}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Items</div>
              <div className="space-y-2">
                {paymentDetailModal.payment.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div className="flex items-center">
                      {item.groupColor && (
                        <div
                          className="w-3 h-3 rounded-full mr-1 flex-shrink-0"
                          style={{ backgroundColor: item.groupColor }}
                        ></div>
                      )}
                      <span>
                        {item.quantity} × {item.productName}
                      </span>
                    </div>
                    <div>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex justify-between mb-1">
                <div>Subtotal</div>
                <div>
                  ${paymentDetailModal.payment.subtotal?.toFixed(2) || paymentDetailModal.payment.total.toFixed(2)}
                </div>
              </div>
              {paymentDetailModal.payment.includeTax && paymentDetailModal.payment.tax !== undefined && (
                <div className="flex justify-between mb-1">
                  <div>Tax ({paymentDetailModal.payment.taxRate}%)</div>
                  <div>${paymentDetailModal.payment.tax.toFixed(2)}</div>
                </div>
              )}
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <div>Total</div>
                <div>${paymentDetailModal.payment.total.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
