import { getAllIgnoredUsers, isUserIgnored } from "$lib/server/db/ignoredUsers.js";
import type { ignored_users } from "$lib/server/db/schema.js";
import type { TwitchUser } from "$lib/types.js";
import { apiResponse, get } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({cookies, request}): Promise<Response> => {
    let failReason = "";
    let statusCode = 200;
    let apiUser: TwitchUser | null = null;

    let response = await get(request, cookies);
    if(response instanceof Response) return response;
    apiUser = response as TwitchUser | null;

    let requesterId = apiUser?.id;

    let ignoredUsers = getAllIgnoredUsers()

    return json(apiResponse<(typeof ignored_users.$inferInsert)[]>(ignoredUsers || [], requesterId))
}