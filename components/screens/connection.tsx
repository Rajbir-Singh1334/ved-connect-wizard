"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader } from "lucide-react"

interface ConnectionScreenProps {
  ip: string
  port: string
  onConnected: () => void
  onBack: () => void
}

export default function ConnectionScreen({ ip, port, onConnected, onBack }: ConnectionScreenProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const connectDevice = async () => {
    setStatus("loading")
    setMessage(`Connecting to ${ip}:${port}...`)
    try {
      const result = await window.vedConnect.connectWireless(ip, port)
      if (result.success) {
        setStatus("success")
        setMessage("Successfully connected wirelessly!")
        setTimeout(onConnected, 2000)
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to connect")
      }
    } catch (err) {
      setStatus("error")
      setMessage("Error connecting to device")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-lg">Disconnecting USB and connecting wirelessly to your device.</p>
      </div>

      <Card className="bg-card/50 border-border p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-foreground">Connection Details</p>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div className="bg-background/50 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">IP Address</p>
                <p className="font-mono font-semibold text-foreground">{ip}</p>
              </div>
              <div className="bg-background/50 rounded p-3">
                <p className="text-xs text-muted-foreground mb-1">Port</p>
                <p className="font-mono font-semibold text-foreground">{port}</p>
              </div>
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
          onClick={connectDevice}
          disabled={status === "loading" || status === "success"}
          size="lg"
          className="flex-1"
        >
          {status === "loading" ? "Connecting..." : status === "success" ? "Connected!" : "Connect Wirelessly"}
        </Button>
      </div>
    </div>
  )
}
