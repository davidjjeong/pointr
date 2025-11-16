"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";

interface DailyStats {
    date: string;
    amount: number;
}

const chartConfig = {
    amount: { label: "Amount", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function ExpenditureAreaChart() {
  const [period, setPeriod] = React.useState<"thisWeek" | "last14Days" | "last30Days">("thisWeek");

  const { data } = useQuery<DailyStats[]>({
    queryKey: ["chart-overview", period],
    queryFn: async () => {
        const res = await fetch(`/api/stats/expense-overview?period=${period}`, {
            cache: "no-store",
        });
        return await res.json();
    },
  });

  return (
    <Card>
        <CardHeader className="flex justify-between">
            <div className="space-y-2">
                <CardTitle>Total Expenditure</CardTitle>
                <CardDescription>Food points used</CardDescription>
            </div>
            <Select value={period} onValueChange={(value: string) => {setPeriod(value as "thisWeek" | "last14Days" | "last30Days");}}>
                <SelectTrigger
                    className="hidden w-40 rounded-lg sm:ml-auto sm:flex"
                    aria-label="Select a value"
                >
                    <SelectValue placeholder="This Week" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="thisWeek" className="rounded-lg">
                    This Week
                    </SelectItem>
                    <SelectItem value="last14Days" className="rounded-lg">
                    Last 14 days
                    </SelectItem>
                    <SelectItem value="last30Days" className="rounded-lg">
                    Last 30 days
                    </SelectItem>
                </SelectContent>
            </Select>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
            >
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--card-foreground)" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="var(--card-foreground)" stopOpacity={0.1} />
                        </linearGradient>
                    </defs>
                <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={10}
                tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                }}
                />
                <ChartTooltip
                cursor={false}
                content={
                    <ChartTooltipContent
                    labelFormatter={(value) =>
                        new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                    }
                    indicator="dot"
                    />
                }
                />
                <Area
                dataKey="amount"
                type="natural"
                fill="url(#gradient)"
                stroke="var(--card-foreground)"
                />
                <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}