"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2 } from "lucide-react"
import type { ProductGroup } from "../home/page"

export default function EditProducts() {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([])
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [showNewGroupModal, setShowNewGroupModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState("")
  const [editGroupModal, setEditGroupModal] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: "",
    name: "",
  })
  const [deleteGroupModal, setDeleteGroupModal] = useState<{ show: boolean; id: string }>({
    show: false,
    id: "",
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedGroups = localStorage.getItem("productGroups")

    if (storedGroups) {
      const groups = JSON.parse(storedGroups) as ProductGroup[]
      setProductGroups(groups)

      // Initialize expanded state
      const initialExpandedState: Record<string, boolean> = {}
      groups.forEach((group) => {
        initialExpandedState[group.id] = group.isOpen
      })
      setExpandedGroups(initialExpandedState)
    }
  }, [])

  // Save product groups to localStorage whenever they change
  useEffect(() => {
    if (productGroups.length > 0) {
      localStorage.setItem("productGroups", JSON.stringify(productGroups))
    }
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

  const handleSave = () => {
    localStorage.setItem("productGroups", JSON.stringify(productGroups))
    window.location.href = "/home"
  }

  const handleCancel = () => {
    window.location.href = "/home"
  }

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
    const price = Number.parseFloat(priceStr)
    if (isNaN(price)) return

    setProductGroups((groups) =>
      groups.map((group) =>
        group.id === groupId
          ? {
              ...group,
              products: group.products.map((product) => (product.id === productId ? { ...product, price } : product)),
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
      products: [],
    }

    setProductGroups([...productGroups, newGroup])
    setExpandedGroups((prev) => ({ ...prev, [newGroup.id]: true }))
    setNewGroupName("")
    setShowNewGroupModal(false)
  }

  const updateGroupName = () => {
    if (!editGroupModal.name.trim()) return

    setProductGroups((groups) =>
      groups.map((group) => (group.id === editGroupModal.id ? { ...group, name: editGroupModal.name } : group)),
    )

    setEditGroupModal({ show: false, id: "", name: "" })
  }

  const deleteGroup = () => {
    setProductGroups((groups) => groups.filter((group) => group.id !== deleteGroupModal.id))

    setDeleteGroupModal({ show: false, id: "" })
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="text-sm text-gray-500 mb-1">Edit products</div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Edit products</h1>
        <button className="text-blue-500" onClick={handleCancel}>
          Cancel
        </button>
      </div>
      <a href="/home" className="mb-4 flex items-center text-blue-500">
        ← Back to home
      </a>

      {productGroups.map((group) => (
        <div key={group.id} className="mb-6">
          <div className="flex items-center mb-2">
            <div className="flex items-center cursor-pointer flex-1" onClick={() => toggleGroup(group.id)}>
              {expandedGroups[group.id] ? (
                <ChevronDown className="w-5 h-5 mr-1" />
              ) : (
                <ChevronRight className="w-5 h-5 mr-1" />
              )}
              <span className="font-medium">{group.name}</span>
            </div>
            <button className="p-1" onClick={() => setEditGroupModal({ show: true, id: group.id, name: group.name })}>
              <Edit2 className="w-4 h-4" />
            </button>
            <button className="ml-2 p-1" onClick={() => addProduct(group.id)}>
              <Plus className="w-4 h-4 text-blue-500" />
            </button>
            <button className="ml-2 p-1" onClick={() => setDeleteGroupModal({ show: true, id: group.id })}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          </div>

          {expandedGroups[group.id] && (
            <div className="space-y-2">
              {group.products.map((product) => (
                <div key={product.id} className="flex items-center">
                  <div className="w-6 flex justify-center">
                    <span className="text-gray-400">=</span>
                  </div>
                  <input
                    type="text"
                    value={product.name}
                    onChange={(e) => updateProductName(group.id, product.id, e.target.value)}
                    className="flex-1 p-2 border rounded-md mr-2"
                  />
                  <input
                    type="text"
                    value={product.price.toFixed(2)}
                    onChange={(e) => updateProductPrice(group.id, product.id, e.target.value)}
                    className="w-20 p-2 border rounded-md mr-2"
                  />
                  <button className="p-1" onClick={() => deleteProduct(group.id, product.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        className="flex items-center justify-center w-full py-2 border border-dashed border-blue-500 text-blue-500 rounded-md mt-4"
        onClick={() => setShowNewGroupModal(true)}
      >
        <Plus className="w-4 h-4 mr-1" />
        Add new group
      </button>

      <button className="w-full py-3 bg-blue-500 text-white rounded-md font-medium mt-8" onClick={handleSave}>
        Save
      </button>

      {/* New Group Modal */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">New group</h3>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Group name"
              className="w-full p-2 border rounded-md mb-4"
              autoFocus
            />
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
            <h3 className="text-lg font-medium mb-4">Edit group name</h3>
            <input
              type="text"
              value={editGroupModal.name}
              onChange={(e) => setEditGroupModal({ ...editGroupModal, name: e.target.value })}
              placeholder="Group name"
              className="w-full p-2 border rounded-md mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md" onClick={updateGroupName}>
                Save
              </button>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setEditGroupModal({ show: false, id: "", name: "" })}
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
    </div>
  )
}
