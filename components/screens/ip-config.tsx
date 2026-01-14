"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader } from "lucide-react"

interface IpConfigScreenProps {
  deviceId: string
  onIpObtained: (ip: string) => void
  onBack: () => void
}

export default function IpConfigScreen({ deviceId, onIpObtained, onBack }: IpConfigScreenProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [detectedIp, setDetectedIp] = useState("")

  const getDeviceIp = async () => {
    setStatus("loading")
    setMessage("Retrieving device IP address...")
    try {
      const result = await window.vedConnect.getDeviceIp(deviceId)
      if (result.success && result.ip) {
        setDetectedIp(result.ip)
        setStatus("success")
        setMessage(`Device IP: ${result.ip}`)
        setTimeout(() => onIpObtained(result.ip), 2000)
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to retrieve device IP")
      }
    } catch (err) {
      setStatus("error")
      setMessage("Error retrieving device IP")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-lg">
          We need to detect your device's IP address on the local network.
        </p>
      </div>

      <Card className="bg-card/50 border-border p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Requirements</h3>
              <p className="text-sm text-muted-foreground">
                Your device should be on the same WiFi network. Keep USB connection active.
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
          onClick={getDeviceIp}
          disabled={status === "loading" || status === "success"}
          size="lg"
          className="flex-1"
        >
          {status === "loading" ? "Detecting..." : status === "success" ? "Done!" : "Detect IP"}
        </Button>
      </div>
    </div>
  )
}
