"use client"

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Strikethrough,
} from "lucide-react"
import { Button } from "../../ui/button"

export function Toolbar() {
  return (
    <div className="flex items-center gap-2 border-b p-2">
      <Button variant="ghost" size="icon">
        <Bold size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Italic size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Strikethrough size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Code size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <List size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <ListOrdered size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Heading1 size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Heading2 size={16} />
      </Button>
      <Button variant="ghost" size="icon">
        <Heading3 size={16} />
      </Button>
    </div>
  )
}
