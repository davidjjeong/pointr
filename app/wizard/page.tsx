import { DiningPlanComboBox } from '@/components/DiningPlanComboBox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'

async function page() {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }
    return (
        <div className="container max-w-2xl flex flex-col items-center justify-between gap-4">
            <div>
                <h1 className="text-center text-3xl">
                    Welcome, <span className="font-bold">{user.firstName} 👋</span>
                </h1>
                <h2 className="mt-4 text-muted-foreground text-center text-base">
                    Let &apos;s get started by setting up your dining plan.
                </h2>
                <h3 className="text-muted-foreground text-center text-sm mt-2">
                    You can change these settings at any time.
                </h3>
            </div>
            <Separator />
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>Dining Plan</CardTitle>
                    <CardDescription>
                        Set your default dining plan for this semester.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DiningPlanComboBox />
                </CardContent>
            </Card>
        </div>
    )
}

export default page
