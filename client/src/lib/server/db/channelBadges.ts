import type Database from "better-sqlite3";
import { and, eq } from "drizzle-orm";
import { db } from ".";
import { channel_badges } from "./schema";
import type { DBBadge } from "$lib/types";

export const createChannelBadge = (data: typeof channel_badges.$inferInsert): DBBadge => {
    return db.insert(channel_badges).values(data).returning().get();
}

export const getChannelBadge = (broadcasterId: string, badgeId: string, setId: string): DBBadge | null => {
    return db.select().from(channel_badges).where(and(eq(channel_badges.badge_id, badgeId), eq(channel_badges.set_id, setId), eq(channel_badges.channel_id, broadcasterId))).get() || null;
}

export const updateChannelBadge = async (broadcasterId: string, badgeId: string, setId: string, changes: Partial<typeof channel_badges.$inferInsert>): Promise<Database.RunResult> => {
    return await db.update(channel_badges).set(changes).where(and(eq(channel_badges.badge_id, badgeId), eq(channel_badges.set_id, setId), eq(channel_badges.channel_id, broadcasterId))).execute();
}

export const deleteChannelBadge = async (broadcasterId: string, badgeId: string, setId: string): Promise<Database.RunResult> => {
    return await db.delete(channel_badges).where(and(eq(channel_badges.badge_id, badgeId), eq(channel_badges.set_id, setId), eq(channel_badges.channel_id, broadcasterId))).execute();
}

export const getAllChannelBadges = (broadcasterId: string): DBBadge[] => {
    return db.select().from(channel_badges).where(eq(channel_badges.channel_id, broadcasterId)).all();
} 