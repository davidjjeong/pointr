// Fall 2025 dining plans
export const DiningPlans = [
    {value: "plan_a", amount: 3071.28, label: "Plan A"},
    {value: "plan_b", amount: 3680.80, label: "Plan B"},
    {value: "plan_c", amount: 4075.33, label: "Plan C"},
    {value: "plan_d", amount: 4373.10, label: "Plan D"},
    {value: "plan_e", amount: 4770.85, label: "Plan E"},
    {value: "off_campus", amount: 1006.20, label: "Off-Campus"},
    {value: "first_year", amount: 1057.80, label: "First-Year"},
    {value: "swift", amount: 2172.58, label: "Swift"}
];

export type DiningPlan = (typeof DiningPlans)[0];