import { eq } from "drizzle-orm";
import { db } from ".";
import { ignored_users } from "./schema";

export const ignoreUser = (data: typeof ignored_users.$inferInsert): typeof ignored_users.$inferInsert => {
    return db.insert(ignored_users).values(data).returning().get();
}

export const isUserIgnored = (userId: string): boolean => {
    let ignored = db.select().from(ignored_users).where(eq(ignored_users.id, userId)).all().length > 0;
    return ignored;
}

export const unIgnoreUser = (userId: string): typeof ignored_users.$inferInsert | null => {
    return db.delete(ignored_users).where(eq(ignored_users.id, userId)).returning().get() || null;
}

export const getAllIgnoredUsers = (): (typeof ignored_users.$inferInsert)[] => {
    return db.select().from(ignored_users).all();
}