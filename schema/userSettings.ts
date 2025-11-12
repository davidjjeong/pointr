import { DiningPlans } from "@/lib/diningplans";
import { z } from "zod";

export const UpdateUserDiningPlanSchema = z.object({
    diningPlan: z.custom(value => {
        const found = DiningPlans.some((c) => c.value === value);
        if(!found){
            throw new Error(`invalid dining plan: ${value}`);
        }
        return value;
    })
});