import { useId } from 'react'

interface LabelTextProps {
  label: string
  text: string
}

export default function LabelText({ label, text }: LabelTextProps) {
  const id = useId()
  return (
    <div className="flex flex-col">
      <span id={id} className="text-left text-sm">
        {label}:
      </span>
      <span aria-labelledby={id}>{text}</span>
    </div>
  )
}
