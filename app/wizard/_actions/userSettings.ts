"use server";

import prisma from "@/lib/prisma";
import { UpdateUserDiningPlanSchema } from "@/schema/userSettings";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function UpdateUserDiningPlan({
    diningPlan,
    planAmount,
}: {
    diningPlan: string;
    planAmount: number;
}) {
    const parsedBody = UpdateUserDiningPlanSchema.safeParse({
        diningPlan,
    })

    if(!parsedBody.success) {
        throw parsedBody.error;
    }

    const user = await currentUser();
    if(!user) { // redirect to sign-in page if not logged in
        redirect("/sign-in");
    }

    const userSettings = prisma.userSettings.update({
        where: {
            userId: user.id,
        },
        data: {
            diningPlan: diningPlan,
            initAmount: planAmount,
        }
    });

    return userSettings;
}