
import { integer, sqliteTable, text,  } from 'drizzle-orm/sqlite-core';

export interface DBAccount {
	id: string;
	user_id: string;
	username: string;
	avatar_url: string;
}

export interface DBSession {
	id?: string;
	user_id: string;
	access_token: string;
	refresh_token: string;
	expires_at: number;
}

export const users = sqliteTable("users", {
	id: text("id").notNull().primaryKey(),
	username: text("username").notNull(),
	avatarUrl: text("avatarUrl").notNull(),
	role: integer("role").notNull()
})

export const global_badges = sqliteTable("global_badges", {
	id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
	badge_id: text("badge_id").notNull(),	
	set_id: text("set_id").notNull(),
	url: text("url").notNull()
})

export const channel_badges = sqliteTable("channel_badges", {
	id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
	channel_id: text("channel_id").notNull(),	
	badge_id: text("badge_id").notNull(),	
	set_id: text("set_id").notNull(),
	url: text("url").notNull()
})

export const ignored_users = sqliteTable("ignored_users", {
	id: text("id").notNull().primaryKey(),
	username: text("username").notNull()
})

export const app_config = sqliteTable("app_config", {
	id: text("id").notNull().primaryKey().$defaultFn(() => crypto.randomUUID()),
	ignore_commands: integer("ignore_commands", {mode: "boolean"}).notNull().default(true)
})
