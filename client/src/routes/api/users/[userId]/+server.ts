import { getDatabaseUser } from '$lib/server/db/users.js';
import { getUserFromToken } from '$lib/twitch.js';
import type {TwitchUser } from '$lib/types.js';
import { apiResponse, get, parseCookie } from '$lib/util.js';
import { json } from '@sveltejs/kit';
import type { Auth } from 'duckylib';



export const GET = async ({ cookies, params, request }): Promise<Response> => {
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
        let dbUser = getDatabaseUser(userId);
        if (dbUser !== null) {
            statusCode = 200;

            return json(apiResponse<Auth.User>(dbUser, requesterId, statusCode))
        } else {
            failReason = "User not found"
            statusCode = 400;
            return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
        }
    } else {

        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }
}