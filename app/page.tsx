"use client"

import { useState } from "react"
import WizardScreen from "@/components/wizard-screen"
import DeviceDetectionScreen from "@/components/screens/device-detection"
import WirelessSetupScreen from "@/components/screens/wireless-setup"
import IpConfigScreen from "@/components/screens/ip-config"
import ConnectionScreen from "@/components/screens/connection"
import MirrorLaunchScreen from "@/components/screens/mirror-launch"
import SuccessScreen from "@/components/screens/success"

type Step = "detection" | "wireless-setup" | "ip-config" | "connection" | "mirror-launch" | "success"

interface WizardState {
  currentStep: Step
  selectedDevice: string
  deviceIp: string
  port: string
  isConnected: boolean
  isMirroring: boolean
}

export default function Page() {
  const [step, setStep] = useState<Step>("detection")
  const [state, setState] = useState<WizardState>({
    currentStep: "detection",
    selectedDevice: "",
    deviceIp: "",
    port: "5555",
    isConnected: false,
    isMirroring: false,
  })

  const handleStepChange = (newStep: Step) => {
    setStep(newStep)
    setState((prev) => ({ ...prev, currentStep: newStep }))
  }

  const handleStateUpdate = (updates: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...updates }))
  }

  const renderScreen = () => {
    switch (step) {
      case "detection":
        return (
          <DeviceDetectionScreen
            onDeviceSelected={(deviceId) => {
              handleStateUpdate({ selectedDevice: deviceId })
              handleStepChange("wireless-setup")
            }}
          />
        )
      case "wireless-setup":
        return (
          <WirelessSetupScreen
            deviceId={state.selectedDevice}
            onSuccess={() => handleStepChange("ip-config")}
            onBack={() => handleStepChange("detection")}
          />
        )
      case "ip-config":
        return (
          <IpConfigScreen
            deviceId={state.selectedDevice}
            onIpObtained={(ip) => {
              handleStateUpdate({ deviceIp: ip })
              handleStepChange("connection")
            }}
            onBack={() => handleStepChange("wireless-setup")}
          />
        )
      case "connection":
        return (
          <ConnectionScreen
            ip={state.deviceIp}
            port={state.port}
            onConnected={() => {
              handleStateUpdate({ isConnected: true })
              handleStepChange("mirror-launch")
            }}
            onBack={() => handleStepChange("ip-config")}
          />
        )
      case "mirror-launch":
        return (
          <MirrorLaunchScreen
            deviceId={state.selectedDevice}
            onMirrorStarted={() => {
              handleStateUpdate({ isMirroring: true })
              handleStepChange("success")
            }}
            onBack={() => handleStepChange("connection")}
          />
        )
      case "success":
        return (
          <SuccessScreen
            deviceId={state.selectedDevice}
            onRestart={() => {
              setState({
                currentStep: "detection",
                selectedDevice: "",
                deviceIp: "",
                port: "5555",
                isConnected: false,
                isMirroring: false,
              })
              handleStepChange("detection")
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <WizardScreen currentStep={step}>{renderScreen()}</WizardScreen>
    </main>
  )
}
