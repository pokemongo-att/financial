export type Category = "INCOME" | "EXPENSE" | "SAVING" | "GOAL" | "FAMILY";

export const CATEGORY_LABELS: Record<Category, string> = {
  INCOME: "รายรับ",
  EXPENSE: "รายจ่าย",
  SAVING: "เงินออม",
  GOAL: "เป้าหมาย",
  FAMILY: "ครอบครัว",
};

export const CATEGORY_BADGE: Record<Category, "success" | "destructive" | "info" | "purple" | "orange"> = {
  INCOME: "success",
  EXPENSE: "destructive",
  SAVING: "info",
  GOAL: "purple",
  FAMILY: "orange",
};

/** Same hues as the dashboard chart and summary dots. */
export const CATEGORY_DOT: Record<Category, string> = {
  INCOME: "bg-emerald-500",
  EXPENSE: "bg-red-500",
  SAVING: "bg-indigo-500",
  GOAL: "bg-purple-500",
  FAMILY: "bg-orange-500",
};

export const CATEGORY_ORDER: Category[] = ["INCOME", "EXPENSE", "SAVING", "GOAL", "FAMILY"];
