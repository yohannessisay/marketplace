import { Check } from "lucide-react"

type StepIndicatorProps = {
  currentStep: number
}

export default function Stepper({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <StepIndicator step={1} currentStep={currentStep} label="Add Farms to your profile" />
        <div className="h-0.5 bg-gray-200 flex-1 mx-2"></div>
        <StepIndicator step={2} currentStep={currentStep} label="Add your coffee crops to sell" />
        <div className="h-0.5 bg-gray-200 flex-1 mx-2"></div>
        <StepIndicator step={3} currentStep={currentStep} label="Provide your bank information" />
        <div className="h-0.5 bg-gray-200 flex-1 mx-2"></div>
        <StepIndicator step={4} currentStep={currentStep} label="Complete your profile" />
      </div>
    </div>
  )
}

function StepIndicator({
  step,
  currentStep,
  label,
}: {
  step: number
  currentStep: number
  label: string
}) {
  const isActive = step === currentStep
  const isCompleted = step < currentStep

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center mb-1
          ${
            isCompleted
              ? "bg-green-500 text-white"
              : isActive
                ? "bg-green-500 text-white"
                : "bg-white border-2 border-gray-300 text-gray-500"
          }`}
      >
        {isCompleted ? <Check className="h-4 w-4" /> : step}
      </div>
      <p className="text-xs text-gray-600 text-center">{label}</p>
    </div>
  )
}

