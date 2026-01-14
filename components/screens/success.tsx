"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, Smartphone } from "lucide-react"

interface SuccessScreenProps {
  deviceId: string
  onRestart: () => void
}

export default function SuccessScreen({ deviceId, onRestart }: SuccessScreenProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-12">
        <div className="flex justify-center mb-6">
          <div className="bg-green-500/10 rounded-full p-6">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Connection Successful!</h2>
        <p className="text-lg text-muted-foreground">Your Android device is now being mirrored wirelessly.</p>
      </div>

      <Card className="bg-gradient-to-br from-green-500/5 to-primary/5 border border-green-500/20 p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground mb-1">Device Connected</p>
              <p className="text-sm text-muted-foreground font-mono">{deviceId}</p>
            </div>
          </div>
        </div>
      </Card>

      <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Tip:</span> The screen mirror window is running in the
          background. You can interact with your device as if it were right in front of you.
        </p>
      </div>

      <div className="pt-6">
        <Button onClick={onRestart} size="lg" className="w-full">
          Start New Connection
        </Button>
      </div>
    </div>
  )
}
