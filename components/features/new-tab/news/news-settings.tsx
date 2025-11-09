"use client"

import { updateNewTabSettings } from "@/app/new-tab/actions/settings"
import { MultiSelectCombobox } from "@/components/common/multi-select-combobox"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { NEWS_CATEGORIES, NEWS_COUNTRIES } from "@/lib/external/news-options"
import { cn } from "@/lib/utils"
import type { UserSettings } from "@/types/new-tab"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"

type NewsSettingsProps = {
  initialSettings: UserSettings
}

function CountryCombobox({
  value,
  onSelect,
}: {
  value: string
  onSelect: (value: string) => void
}) {
  const [open, setOpen] = React.useState(false)
  const currentLabel =
    NEWS_COUNTRIES.find((c) => c.value === value)?.label ?? "Select country..."

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-8 w-full justify-between text-xs"
        >
          <span className="truncate">{currentLabel}</span>

          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder="Search country..."
            className="h-9 text-xs"
          />

          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>

            <CommandGroup>
              {NEWS_COUNTRIES.map((item) => (
                <CommandItem
                  key={item.value}
                  value={item.label}
                  onSelect={() => {
                    onSelect(item.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {item.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function NewsSettings({ initialSettings }: NewsSettingsProps) {
  const [isPending, startTransition] = React.useTransition()
  const router = useRouter()

  const [country, setCountry] = React.useState(initialSettings.news_country)
  const [categories, setCategories] = React.useState(
    Array.isArray(initialSettings.news_category)
      ? initialSettings.news_category
      : ["general"]
  )

  const hasChanges =
    country !== initialSettings.news_country ||
    JSON.stringify(categories.sort()) !==
      JSON.stringify(
        [
          ...(Array.isArray(initialSettings.news_category)
            ? initialSettings.news_category
            : ["general"]),
        ].sort()
      )

  const handleSave = () => {
    startTransition(async () => {
      await updateNewTabSettings({
        news_country: country,
        news_category: categories.length > 0 ? categories : ["general"],
      })
      router.refresh()
    })
  }

  return (
    <div className="mb-6 flex flex-col items-center gap-4 rounded-lg border bg-card p-4 sm:flex-row">
      <div className="grid w-full flex-1 gap-1 sm:max-w-xs">
        <Label htmlFor="news-country" className="text-xs">
          News Country
        </Label>
        <CountryCombobox value={country} onSelect={setCountry} />
      </div>

      <div className="grid w-full flex-1 gap-1 sm:max-w-xs">
        <Label htmlFor="news-category" className="text-xs">
          News Categories
        </Label>

        <MultiSelectCombobox
          options={NEWS_CATEGORIES}
          selected={categories}
          onChangeAction={setCategories}
          placeholder="Select categories..."
          searchPlaceholder="Search categories..."
          noResultsText="No category found."
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={isPending || !hasChanges}
        size="sm"
        className="mt-4 h-8 w-full sm:w-auto sm:self-end"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
      </Button>
    </div>
  )
}
