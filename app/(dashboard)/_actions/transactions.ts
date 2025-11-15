"use server";

import prisma from "@/lib/prisma";
import { CreateTransactionSchema, CreateTransactionSchemaType } from "@/schema/transaction";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

function getWeekYear(d: Date) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) {
    throw new Error("getWeekYear: argument must be a valid Date");
  }

  // normalize to UTC midnight for the given date (avoid timezone shifts)
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

  // Shift date to Thursday in current week (ISO 8601 trick)
  // getUTCDay(): Sun=0, Mon=1, ... Sat=6. Convert Sun(0) -> 7 for ISO.
  const weekday = date.getUTCDay() === 0 ? 7 : date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + 4 - weekday);

  // Start of the ISO week-year (Jan 1 of the ISO week-year)
  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));

  const MS_PER_DAY = 24 * 60 * 60 * 1000;

  const diffMs = date.getTime() - yearStart.getTime();
  if (!Number.isFinite(diffMs)) {
    throw new Error("getWeekYear: computed invalid time difference");
  }

  const dayOfYear = Math.floor(diffMs / MS_PER_DAY) + 1; // Jan 1 -> day 1
  const week = Math.ceil(dayOfYear / 7);

  return { week, year };
}

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