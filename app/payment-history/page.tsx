"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import type { Payment } from "../home/page"

export default function PaymentHistory() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ show: boolean; id: string }>({
    show: false,
    id: "",
  })

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedPayments = localStorage.getItem("paymentHistory")

    if (storedPayments) {
      setPayments(JSON.parse(storedPayments))
    }
  }, [])

  const handleCancel = () => {
    window.location.href = "/home"
  }

  const deletePayment = (id: string) => {
    const updatedPayments = payments.filter((payment) => payment.id !== id)
    setPayments(updatedPayments)
    localStorage.setItem("paymentHistory", JSON.stringify(updatedPayments))
    setShowDeleteConfirm({ show: false, id: "" })
  }

  // Group payments by date
  const paymentsByDate: Record<string, Payment[]> = {}
  payments.forEach((payment) => {
    if (!paymentsByDate[payment.date]) {
      paymentsByDate[payment.date] = []
    }
    paymentsByDate[payment.date].push(payment)
  })

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="text-sm text-gray-500 mb-1">Payment history</div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Payment history</h1>
        <button className="text-blue-500" onClick={handleCancel}>
          Cancel
        </button>
      </div>
      <a href="/home" className="mb-4 flex items-center text-blue-500">
        ← Back to home
      </a>

      {Object.keys(paymentsByDate).length === 0 && (
        <div className="text-center py-8 text-gray-500">No payment history yet</div>
      )}

      {Object.entries(paymentsByDate).map(([date, datePayments]) => (
        <div key={date} className="mb-6">
          <h2 className="font-medium mb-2">{date}</h2>

          {datePayments.map((payment) => (
            <div key={payment.id} className="bg-gray-50 p-4 rounded-md mb-2">
              <div className="flex justify-between mb-1">
                <div>{payment.items.map((item) => item.productName).join(", ")}</div>
                <div className="flex items-center">
                  <span className="font-medium mr-2">${payment.total.toFixed(2)}</span>
                  <button className="p-1" onClick={() => setShowDeleteConfirm({ show: true, id: payment.id })}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">{payment.timestamp}</div>
            </div>
          ))}
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-medium mb-4">Are you sure you want to delete this payment?</h3>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md"
                onClick={() => deletePayment(showDeleteConfirm.id)}
              >
                Delete
              </button>
              <button
                className="px-4 py-2 border rounded-md"
                onClick={() => setShowDeleteConfirm({ show: false, id: "" })}
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
