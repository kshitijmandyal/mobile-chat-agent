export const MAX_RESULTS = 5;
export const MAX_COMPARED = 3;

/** Budgets outside this range are the model misreading a number, not a real ask. */
export const BUDGET_FLOOR_INR = 1_000;
export const BUDGET_CEILING_INR = 10_00_000;

/** Longest reply the UI will show. Anything longer is the model ignoring its brief. */
export const REPLY_MAX_CHARS = 1_200;
