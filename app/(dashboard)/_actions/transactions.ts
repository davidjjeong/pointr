"use server";

import { getWeekYear } from "@/lib/getWeekYear";
import prisma from "@/lib/prisma";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createTransaction(form: CreateTransactionSchemaType) {
    const parsedBody = CreateTransactionSchema.safeParse(form)
    if(!parsedBody.success) throw new Error(parsedBody.error.message);

    const user = await currentUser();
    if(!user) redirect("/sign-in");

    const { amount, date, food, vendor, quantity } = parsedBody.data;

    // validate by look up [vendor, food] which is unique in FoodOptions table
    const foodRow = await prisma.foodOptions.findUnique({
        where: {
            vendor_food: {
                vendor, food
            }
        },
    });
    if(!foodRow) throw new Error("Food option not found");

    const { week, year } = getWeekYear(date);
    const day = date.toISOString().slice(0, 10);

    await prisma.$transaction(async (tx) => {
        // insert expenditure
        await tx.expenditure.create({
            data: {
                vendor: vendor,
                quantity: quantity,
                food: food,
                userId: user.id,
                date: day,
                amount: amount,
            }
        });

        // insert DayHistory
        await tx.dayHistory.upsert({
            where: { userId_day: { userId: user.id, day: day } },
            update: { totalExpense: { increment: amount } },
            create: { userId: user.id, day: day, totalExpense: amount },
        });

        const existsWeekHistory = await tx.weekHistory.findUnique({
            where: {
                userId_week_year: {
                    userId: user.id,
                    week: week,
                    year: year,
                }
            }
        });

        if(!existsWeekHistory){
            await tx.weekHistory.create({
                data: {
                    userId: user.id,
                    week: week,
                    year: year,
                    totalExpense: amount,
                    dailyBreakdown: { [day]: amount },
                }
            })
        } else {
            const originalBreakdown = (existsWeekHistory.dailyBreakdown as Record<string, number> | null) ?? {};

            const updatedBreakdown = {
                ...originalBreakdown,
                [day]: (originalBreakdown[day] ?? 0) + amount,
            };

            await tx.weekHistory.update({
                where: {
                    userId_week_year: {
                        userId: user.id,
                        week,
                        year,
                    }
                },
                data: {
                    totalExpense: existsWeekHistory.totalExpense + amount,
                    dailyBreakdown: updatedBreakdown,
                }
            });
        }
    });
}