"use client"

import { useEffect } from "react"

export default function IndexPage() {
  useEffect(() => {
    // Redirect to the home page
    window.location.href = "/home"
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to home page...</p>
    </div>
  )
}
