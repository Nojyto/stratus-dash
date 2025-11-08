"use client"

import { Button, type ButtonProps } from "@/components/ui/button"
import { useFormStatus } from "react-dom"

type SubmitButtonProps = {
  children: React.ReactNode
  pendingText: string
} & ButtonProps

export function SubmitButton({
  children,
  pendingText,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  )
}
