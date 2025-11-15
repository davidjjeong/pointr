"use client";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FoodOptions } from "@prisma/client";
import { FormComboBox } from "@/components/FormComboBox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { format } from "date-fns/format";
import { CalendarIcon, Loader } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { createTransaction } from "../_actions/transactions";
import { toast } from "sonner";

interface Props {
    trigger: ReactNode;
}

function CreateTransactionDialog({ trigger } : Props) {
    const [open, setOpen] = useState(false);

    const form = useForm<CreateTransactionSchemaType>({
        resolver: zodResolver(CreateTransactionSchema),
        defaultValues: {
            amount: 0.0,
            date: new Date(),
            food: "",
            vendor: "",
            quantity: 1,
        }
    })

    const { data = [] } = useQuery<FoodOptions[]>({
        queryKey: ["food-options"],
        queryFn: () => fetch("/api/food-options").then(res => res.json()),
    });

    const grouped = useMemo(() => {
        const rows = data ?? [];
        const out: Record<string, Record<string, number>> = {};
        rows.forEach((r) => {
            if(!out[r.vendor]) out[r.vendor] = {};
            out[r.vendor][r.food] = r.amount;
        });
        return out;
    }, [data]);

    const selectedVendor = useWatch({
        control: form.control,
        name: "vendor",
    });
    const selectedFood = useWatch({
        control: form.control,
        name: "food",
    });
    const selectedQuantity = useWatch({
        control: form.control,
        name: "quantity",
    });

    useEffect(() => {
        if(!selectedVendor || !selectedFood) return;

        const price = grouped[selectedVendor]?.[selectedFood] ?? 0.0;
        form.setValue("amount", price * (selectedQuantity || 0), {
            shouldValidate: true,
            shouldDirty: true,
        });
    }, [selectedVendor, selectedFood, selectedQuantity, grouped, form]);

    //const queryClient = useQueryClient();
    const { mutate, isPending } = useMutation({
        mutationFn: createTransaction,
        onSuccess: () => {
            toast.success("Transaction created successfully!", {
                id: "create-transaction",
            });

            form.reset({
                amount: 0.0,
                date: new Date(),
                vendor: "",
                food: "",
                quantity: 1,
            })

            /*queryClient.invalidateQueries({
                queryKey: ["overview"],
            });*/

            setOpen((prev) => !prev);
        }
    });

    const onSubmit = useCallback((values: CreateTransactionSchemaType) => {
        toast.loading("Creating transaction...", {
            id: "create-transaction",
        });

        mutate({
            ...values,
        });
    }, [mutate]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Record your new
                    <span className="m-1 text-expense">expense</span>
                </DialogTitle>
            </DialogHeader>
            <Form {...form}>
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField 
                        control={form.control}
                        name="vendor"
                        render={( { field }) => {
                            return(
                                <FormItem>
                                    <FormLabel>Vendor</FormLabel>
                                    <FormComboBox
                                        value={field.value}
                                        placeholder="Search vendors..."
                                        options={Object.keys(grouped)}
                                        onChange={(v) => {
                                            field.onChange(v);
                                            form.setValue("food", "");
                                            form.setValue("amount", 0.0);
                                        }}
                                    />
                                    <FormDescription>
                                        Ordered Restaurant (required)
                                    </FormDescription>
                                </FormItem>
                            );
                        }}
                    />
                    <FormField 
                        control={form.control}
                        name="food"
                        render={( { field }) => {
                            return(
                                <FormItem>
                                    <FormLabel>Food</FormLabel>
                                    <FormComboBox
                                        value={field.value}
                                        placeholder={
                                            selectedVendor ? "Search food..." : "Select vendor first"
                                        }
                                        options={selectedVendor ? Object.keys(grouped[selectedVendor]): []}
                                        onChange={(v) => field.onChange(v)}
                                    />
                                    <FormDescription>
                                        Ordered Food (required)
                                    </FormDescription>
                                </FormItem>
                            );
                        }}
                    />
                    <div className="flex justify-between">
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => {
                                return(
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={(e) => {
                                                let value = e.target.value;
                                                value = value.replace(/^0+/, "");
                                                if(value === "") {
                                                    field.onChange("");
                                                    return;
                                                }
                                                const n = Number(value);
                                                if(!Number.isNaN(n)){
                                                    field.onChange(n);
                                                }
                                            }}
                                                min={1} />
                                        </FormControl>
                                        <FormDescription>How many did you order?</FormDescription>
                                    </FormItem>
                                );
                            }}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => {
                                return(
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn(
                                                        "w-[250px] pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}>
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Select date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} 
                                                    autoFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormDescription>Date of purchase</FormDescription>
                                    </FormItem>
                                );
                            }}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="amount"
                        render={( { field }) => {
                            return(
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl><Input {...field} readOnly /></FormControl>
                                    <FormDescription>Total Spending</FormDescription>
                                </FormItem>
                            
                            );
                        }}
                    />
                </form>
            </Form>
            <DialogFooter>
                <DialogClose asChild>
                    <Button
                        type="button"
                        variant={"secondary"}
                        onClick={() => {
                            form.reset();
                        }}
                    >
                        Cancel
                    </Button>
                </DialogClose>
                <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                    {!isPending && "Create"}
                    {isPending && <Loader className="animate-spin" />}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default CreateTransactionDialog
