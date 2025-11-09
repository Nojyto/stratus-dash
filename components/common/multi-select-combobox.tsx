"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check, ChevronsUpDown } from "lucide-react"
import * as React from "react"

type Option = {
  value: string
  label: string
}

type MultiSelectComboboxProps = {
  options: Option[]
  selected: string[]
  onChangeAction: React.Dispatch<React.SetStateAction<string[]>>
  placeholder: string
  searchPlaceholder: string
  noResultsText: string
  className?: string
}

export function MultiSelectCombobox({
  options,
  selected,
  onChangeAction,
  placeholder,
  searchPlaceholder,
  noResultsText,
  className,
}: MultiSelectComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (value: string) => {
    onChangeAction((current) =>
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    )
  }

  const selectedLabels = selected
    .map((value) => options.find((option) => option.value === value)?.label)
    .filter(Boolean) as string[]

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-8 w-full justify-between text-xs",
            className
          )}
        >
          <div className="flex flex-wrap items-center gap-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9 text-xs"
          />

          <CommandList>
            <CommandEmpty>{noResultsText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => handleToggle(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
