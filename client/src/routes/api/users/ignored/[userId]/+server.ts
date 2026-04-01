import { ignoreUser, isUserIgnored, unIgnoreUser } from "$lib/server/db/ignoredUsers.js";
import { getUserById } from "$lib/twitch.js";
import type { TwitchUser } from "$lib/types.js";
import { apiResponse, get } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async ({params, cookies, request}): Promise<Response> => {
    let userId: string | null = params.userId;
    let failReason = "";
    let statusCode = 200;
    let apiUser: TwitchUser | null = null;

    let response = await get(request, cookies);
    if(response instanceof Response) return response;
    apiUser = response as TwitchUser | null;

    let requesterId = apiUser?.id;

    if (userId === "@me") {
        if (apiUser !== null) {
            userId = apiUser.id
        } else {
            userId = null;
            failReason = "User not found"
            statusCode = 400;
        }
    }

    if (userId !== null) {
        let ignored = isUserIgnored(userId);
        console.log("IGNORED?", ignored)
        if (ignored !== null) {
            statusCode = 200;

            return json(apiResponse<boolean>(ignored, requesterId, statusCode))
        } else {
            failReason = "User not found"
            statusCode = 400;
            return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
        }
    } else {
        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }
}

export const POST = async ({params, cookies, request}): Promise<Response> => {
    let tokenCookie = cookies.get("token-0") || null;
    let userId: string | null = params.userId;
    let failReason = "";
    let statusCode = 200;
    let apiUser: TwitchUser | null = null;

    let response = await get(request, cookies);
    if(response instanceof Response) return response;
    apiUser = response as TwitchUser | null;

    let requesterId = apiUser?.id;

    if (userId === "@me") {
        if (apiUser !== null) {
            userId = apiUser.id
        } else {
            userId = null;
            failReason = "User not found"
            statusCode = 400;
        }
    }

    if (userId !== null) {
        
        let ignored = isUserIgnored(userId);
        console.log(`TRYING TO ${ignored ? "unignore" : "ignore"} user ID ${userId}`)
        let twitchUser = await getUserById(userId, tokenCookie);
        if(!twitchUser) {
            failReason = "User not found"
            statusCode = 400;
            return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
        }
        let i = !ignored ? ignoreUser({username: twitchUser.login, id: twitchUser.id}) : unIgnoreUser(userId)
        console.log("IGNORED?", ignored)
        if (i !== null) {
            statusCode = 200;

            return json(apiResponse<{id: string; username: string;}>(i, requesterId, statusCode))
        } else {
            failReason = "User not found"
            statusCode = 400;
            return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
        }
    } else {
        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }
}