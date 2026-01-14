"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader } from "lucide-react"

interface WirelessSetupScreenProps {
  deviceId: string
  onSuccess: () => void
  onBack: () => void
}

export default function WirelessSetupScreen({ deviceId, onSuccess, onBack }: WirelessSetupScreenProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const enableWireless = async () => {
    setStatus("loading")
    setMessage("Enabling wireless debugging on your device...")
    try {
      const result = await window.vedConnect.enableWireless(deviceId)
      if (result.success) {
        setStatus("success")
        setMessage("Wireless debugging enabled successfully!")
        setTimeout(onSuccess, 2000)
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to enable wireless debugging")
      }
    } catch (err) {
      setStatus("error")
      setMessage("Error enabling wireless debugging")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-lg">
          This step will enable wireless debugging on your device over ADB.
        </p>
      </div>

      <Card className="bg-card/50 border-border p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Important</h3>
              <p className="text-sm text-muted-foreground">
                Keep your device connected via USB during this process. You can disconnect it after wireless debugging
                is enabled.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {status !== "idle" && (
        <Card
          className={`p-6 border-l-4 ${
            status === "success"
              ? "border-l-green-500 bg-green-500/5"
              : status === "error"
                ? "border-l-destructive bg-destructive/5"
                : "border-l-primary bg-primary/5"
          }`}
        >
          <div className="flex items-start gap-3">
            {status === "loading" && <Loader className="w-5 h-5 text-primary animate-spin flex-shrink-0 mt-0.5" />}
            {status === "success" && <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
            {status === "error" && <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />}
            <p className={`text-sm ${status === "success" ? "text-green-700 dark:text-green-400" : ""}`}>{message}</p>
          </div>
        </Card>
      )}

      <div className="flex gap-3 pt-4">
        <Button onClick={onBack} variant="outline" className="flex-1 bg-transparent">
          Back
        </Button>
        <Button
          onClick={enableWireless}
          disabled={status === "loading" || status === "success"}
          size="lg"
          className="flex-1"
        >
          {status === "loading" ? "Enabling..." : status === "success" ? "Done!" : "Enable Wireless"}
        </Button>
      </div>
    </div>
  )
}
