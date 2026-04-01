import type Database from "better-sqlite3";
import { and, eq } from "drizzle-orm";
import { db } from ".";
import { global_badges } from "./schema";
import type { DBBadge } from "$lib/types";

export const createGlobalBadge = (data: typeof global_badges.$inferInsert): DBBadge | null => {
    if(getGlobalBadge(data.badge_id, data.badge_id)) return null;
    return db.insert(global_badges).values(data).returning().get();
}

export const getGlobalBadge = (badgeId: string, setId: string): DBBadge | null => {
    return db.select().from(global_badges).where(and(eq(global_badges.badge_id, badgeId), eq(global_badges.set_id, setId))).get() || null;
}

export const updateGlobalBadge = async (badgeId: string, setId: string, changes: Partial<typeof global_badges.$inferInsert>): Promise<Database.RunResult> => {
    return await db.update(global_badges).set(changes).where(and(eq(global_badges.badge_id, badgeId), eq(global_badges.set_id, setId))).execute();
}

export const deleteGlobalBadge = async (badgeId: string, setId: string): Promise<Database.RunResult> => {
    return await db.delete(global_badges).where(and(eq(global_badges.badge_id, badgeId), eq(global_badges.set_id, setId))).execute();
}

export const getAllGlobalBadges = (): DBBadge[] => {
    return db.select().from(global_badges).all();
} 