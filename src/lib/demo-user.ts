import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEMO_EMAIL = "demo@local";

export async function getDemoUser() {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, DEMO_EMAIL));
  return user ?? null;
}

export async function getDemoUserId(): Promise<string> {
  const user = await getDemoUser();
  if (!user) throw new Error("Demo user not found. Run `pnpm db:seed` first.");
  return user.id;
}
