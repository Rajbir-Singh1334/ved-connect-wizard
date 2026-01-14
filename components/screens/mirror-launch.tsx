"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Loader } from "lucide-react"

interface MirrorLaunchScreenProps {
  deviceId: string
  onMirrorStarted: () => void
  onBack: () => void
}

export default function MirrorLaunchScreen({ deviceId, onMirrorStarted, onBack }: MirrorLaunchScreenProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  const launchMirror = async () => {
    setStatus("loading")
    setMessage("Launching screen mirror...")
    try {
      const result = await window.vedConnect.launchScrcpy(deviceId, {
        maxSize: 1280,
        bitRate: "8m",
      })
      if (result.success) {
        setStatus("success")
        setMessage("Screen mirror launched successfully!")
        setTimeout(onMirrorStarted, 2000)
      } else {
        setStatus("error")
        setMessage(result.error || "Failed to launch mirror")
      }
    } catch (err) {
      setStatus("error")
      setMessage("Error launching mirror")
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-lg">Ready to launch the screen mirroring application.</p>
      </div>

      <Card className="bg-card/50 border-border p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Prerequisites</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Scrcpy must be installed on your system</li>
                <li>Device must be wirelessly connected</li>
                <li>Both devices on same network</li>
              </ul>
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
          onClick={launchMirror}
          disabled={status === "loading" || status === "success"}
          size="lg"
          className="flex-1"
        >
          {status === "loading" ? "Launching..." : status === "success" ? "Done!" : "Launch Mirror"}
        </Button>
      </div>
    </div>
  )
}
