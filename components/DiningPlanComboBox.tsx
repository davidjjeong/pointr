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
import { DiningPlan, DiningPlans } from "@/lib/diningplans"
import { useMutation, useQuery } from "@tanstack/react-query"
import SkeletonWrapper from "./SkeletonWrapper"
import { UserSettings } from "@prisma/client";
import { UpdateUserDiningPlan } from "@/app/wizard/_actions/userSettings"
import { toast } from "sonner"

export function DiningPlanComboBox() {
  const [open, setOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const [selectedOption, setSelectedOption] = React.useState<DiningPlan | null>(
    null
  )

  const userSettings = useQuery<UserSettings>({
    queryKey: ["userSettings"],
    queryFn: () => fetch("/api/user-settings").then(res => res.json()),
  })

  const mutation = useMutation({
    mutationFn: UpdateUserDiningPlan,
    onSuccess: (data: UserSettings) => {
      toast.success("Dining plan updated successfully", {
        id: "update-dining-plan",
      });

      setSelectedOption(
        DiningPlans.find((plan) => plan.value === data.diningPlan) || null
      )
    },
    onError: (e) => {
      toast.error("Something went wrong", {
        id: "update-dining-plan",
      });
    },
  });

  const selectOption = React.useCallback((diningPlan: DiningPlan | null) => {
    if (!diningPlan) {
      toast.error("Please select a dining plan.");
      return;
    }

    toast.loading("Updating dining plan...", {
      id: "update-dining-plan",
    });

    const plan = DiningPlans.find((p) => p.value === diningPlan.value);
    const initAmount = plan?.amount ?? 0.0;

    mutation.mutate({
      diningPlan: diningPlan.value,
      planAmount: initAmount,
    });
  }, [mutation]);

  if (isDesktop) {
    return (
      <SkeletonWrapper isLoading={userSettings.isFetching}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start" disabled={mutation.isPending}>
              {selectedOption ? <>{selectedOption.label}</> : <>Set dining plan</>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </PopoverContent>
        </Popover>
      </SkeletonWrapper>
    )
  }

  return (
    <SkeletonWrapper isLoading={userSettings.isFetching}>
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start" disabled={mutation.isPending}>
            {selectedOption ? <>{selectedOption.label}</> : <>Set dining plan</>}
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mt-4 border-t">
            <OptionList setOpen={setOpen} setSelectedOption={selectOption} />
          </div>
        </DrawerContent>
      </Drawer>
    </SkeletonWrapper>
  )
}

function OptionList({
  setOpen,
  setSelectedOption,
}: {
  setOpen: (open: boolean) => void
  setSelectedOption: (status: DiningPlan | null) => void
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter dining plan..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {DiningPlans.map((diningPlan: DiningPlan) => (
            <CommandItem
              key={diningPlan.value}
              value={diningPlan.value}
              onSelect={(value) => {
                setSelectedOption(
                  DiningPlans.find((priority) => priority.value === value) || null
                )
                setOpen(false)
              }}
            >
              {diningPlan.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}