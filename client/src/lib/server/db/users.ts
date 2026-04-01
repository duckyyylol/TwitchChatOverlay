import type Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { db } from ".";
import { users } from "./schema";
import type { Auth } from "duckylib";

export const createDatabaseUser = (data: typeof users.$inferInsert): Auth.User => {
    return db.insert(users).values(data).returning().get();
}

export const getDatabaseUser = (userId: string): Auth.User | null => {
    return db.select().from(users).where(eq(users.id, userId)).get() || null;
}

export const updateDatabaseUser = async (userId: string, changes: Partial<typeof users.$inferInsert>): Promise<Database.RunResult> => {
    return await db.update(users).set(changes).where(eq(users.id, userId)).execute();
}

export const deleteDatabaseUser = async (userId: string): Promise<Database.RunResult> => {
    return await db.delete(users).where(eq(users.id, userId)).execute();
}

export const getAllUsers = (): Auth.User[] => {
    return db.select().from(users).all();
} 