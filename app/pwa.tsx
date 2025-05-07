"use client"

import { useEffect, useState } from "react"

export default function PWAInstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if the app is already installed
    const isAppInstalled = window.matchMedia("(display-mode: standalone)").matches

    if (isAppInstalled) {
      return // App is already installed, don't show the prompt
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install prompt
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    })
  }

  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-24 left-0 right-0 mx-auto max-w-md p-4 bg-yellow-100 rounded-lg shadow-lg border border-yellow-300 z-50">
      <div className="flex items-center">
        <img src="/icon-192.png" alt="Payment Recorder" className="w-12 h-12 mr-3" />
        <div className="flex-1">
          <h3 className="font-medium">Install Payment Recorder</h3>
          <p className="text-sm text-gray-600">Add to your home screen for easy access</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-md"
          >
            Later
          </button>
          <button onClick={handleInstallClick} className="px-3 py-1 text-sm bg-blue-500 text-white rounded-md">
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
