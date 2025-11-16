import { getWeekYear } from "@/lib/getWeekYear";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { subDays } from "date-fns";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
    const user = await currentUser();
    if(!user) redirect("/sign-in");

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") as
        | "thisWeek"
        | "last14Days"
        | "last30Days";

    if(!period) return Response.json({ error: "Missing 'period' query param" }, { status: 400 });

    const today = new Date();
    const { week, year } = getWeekYear(today);
    // Option 1: this week
    if(period === "thisWeek"){
        const weekHistory = await prisma.weekHistory.findUnique({
            where: {
                userId_week_year: {
                    userId: user.id,
                    week: week,
                    year: year,
                },
            },
        });

        if(!weekHistory?.dailyBreakdown) return Response.json([]);

        const formattedWeekHistory = Object.entries(weekHistory.dailyBreakdown)
            .map(([date, amount]) => ({
                date, 
                amount,
            }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return Response.json(formattedWeekHistory);
    }

    // Option 2: last14Days or last30Days (use Expenditure table from Supabase)
    const days = period === "last14Days" ? 14 : 30;
    const start = subDays(today, days);
    const startStr = start.toISOString().slice(0, 10);
    
    const dayHistories = await prisma.dayHistory.findMany({
        where: {
            userId: user.id,
            day: { gte: startStr },
        },
        orderBy: { day: "asc" },
    });

    const formattedHistory = dayHistories.map((d) => ({
        date: d.day,
        amount: d.totalExpense,
    }));

    return new Response(JSON.stringify(formattedHistory), { status: 200 });
}