import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET() {
    const user = await currentUser();
    if(!user){
        redirect("/sign-in");
    }
    try {
        const foodOptions = await prisma.foodOptions.findMany({
            orderBy: [{ vendor: "asc" }, { food: "asc" }],
        });
        return Response.json(foodOptions);
    } catch(e : unknown) {
        console.error("Error: ", e);
        const message = e instanceof Error ? e.message : "Unknown server error";
        return new Response(JSON.stringify({error: message}), {status:500});
    }
}