"use client"

import * as React from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
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
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { ScrollArea } from "@radix-ui/react-scroll-area"

export function FormComboBox({
    value,
    onChange,
    placeholder,
    options,
    emptyText="No results.",
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    options: string[];
    emptyText?: string;
}) {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[250px] justify-start">
            {value ? value : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
            <Command>
                <CommandInput placeholder={placeholder} />
                <CommandEmpty>{emptyText}</CommandEmpty>
                <ScrollArea className="max-h-48 overflow-y-auto">
                  <CommandGroup>
                    {options.map((option) => (
                        <CommandItem
                            key={option}
                            value={option}
                            onSelect={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            <Check
                                className={cn(
                                    option === value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {option}
                        </CommandItem>
                    ))}
                  </CommandGroup>
                </ScrollArea>
            </Command>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[250px] justify-start">
            {value ? value : placeholder}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
            <Command>
                <CommandInput placeholder={placeholder} />
                <CommandEmpty>{emptyText}</CommandEmpty>
                <CommandGroup>
                    {options.map((option) => (
                        <CommandItem
                            key={option}
                            value={option}
                            onSelect={() => {
                                onChange(option);
                                setOpen(false);
                            }}
                        >
                            <Check
                                className={cn(
                                    option === value ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {option}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </Command>
        </div>
      </DrawerContent>
    </Drawer>
  )
}