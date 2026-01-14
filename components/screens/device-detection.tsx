"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, RefreshCw } from "lucide-react"

interface Device {
  id: string
  status: string
}

interface DeviceDetectionScreenProps {
  onDeviceSelected: (deviceId: string) => void
}

export default function DeviceDetectionScreen({ onDeviceSelected }: DeviceDetectionScreenProps) {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedDevice, setSelectedDevice] = useState("")

  const detectDevices = async () => {
    setLoading(true)
    setError("")
    try {
      const result = await window.vedConnect.detectDevices()
      if (result.success) {
        setDevices(result.devices)
        if (result.devices.length === 0) {
          setError("No USB devices detected. Please connect your Android phone.")
        }
      } else {
        setError(result.error || "Failed to detect devices")
      }
    } catch (err) {
      setError("Error detecting devices. Ensure ADB is installed and in PATH.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    detectDevices()
  }, [])

  const handleNext = () => {
    if (selectedDevice) {
      onDeviceSelected(selectedDevice)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-lg">
          Connect your Android device via USB and enable USB debugging in Developer Options.
        </p>
      </div>

      <Button onClick={detectDevices} disabled={loading} variant="outline" className="w-full mb-6 bg-transparent">
        <RefreshCw className="w-4 h-4 mr-2" />
        {loading ? "Detecting..." : "Detect USB Devices"}
      </Button>

      {error && (
        <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-destructive">{error}</div>
      )}

      <div className="space-y-3">
        {devices.map((device) => (
          <Card
            key={device.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedDevice === device.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
            onClick={() => setSelectedDevice(device.id)}
          >
            <div className="flex items-center">
              <Smartphone className="w-5 h-5 mr-3 text-primary" />
              <div className="flex-1">
                <p className="font-semibold text-foreground">{device.id}</p>
                <p className="text-sm text-muted-foreground capitalize">{device.status}</p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  selectedDevice === device.id ? "bg-primary border-primary" : "border-muted-foreground"
                }`}
              />
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={handleNext} disabled={!selectedDevice} size="lg" className="w-full mt-8">
        Next: Enable Wireless Debugging
      </Button>
    </div>
  )
}
