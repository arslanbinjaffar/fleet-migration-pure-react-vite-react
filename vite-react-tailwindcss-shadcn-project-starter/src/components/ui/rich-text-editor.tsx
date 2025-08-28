"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"

interface RichTextEditorProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  minHeight?: string
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Enter text...",
  className,
  disabled = false,
  minHeight = "200px",
}: RichTextEditorProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value)
  }

  return (
    <div className={cn("relative", className)}>
      <Textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn("resize-none", className)}
        style={{ minHeight }}
      />
      {/* Future enhancement: Add rich text formatting toolbar here */}
    </div>
  )
}

// Simple wrapper for backward compatibility
export { RichTextEditor as RichTextEditor }