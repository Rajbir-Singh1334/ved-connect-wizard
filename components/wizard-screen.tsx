"use client"

import type React from "react"

const STEPS = [
  { id: "detection", label: "Detect Device" },
  { id: "wireless-setup", label: "Enable Wireless" },
  { id: "ip-config", label: "Get IP" },
  { id: "connection", label: "Connect" },
  { id: "mirror-launch", label: "Start Mirror" },
  { id: "success", label: "Success" },
]

interface WizardScreenProps {
  currentStep: string
  children: React.ReactNode
}

export default function WizardScreen({ currentStep, children }: WizardScreenProps) {
  const currentStepIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background to-card">
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex justify-between mb-6">
            {STEPS.map((s, index) => (
              <div key={s.id} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-colors ${
                    index <= currentStepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition-colors ${
                      index < currentStepIndex ? "bg-primary" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">{STEPS[currentStepIndex]?.label}</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {STEPS.length}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto px-6 py-12">{children}</div>
      </div>
    </div>
  )
}
