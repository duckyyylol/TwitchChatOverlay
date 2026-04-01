import { getDatabaseUser } from '$lib/server/db/users.js';
import { getUserById, getUserByLogin, getUserFromToken } from '$lib/twitch.js';
import type {TwitchUser } from '$lib/types.js';
import { apiResponse, get, parseCookie } from '$lib/util.js';
import { json } from '@sveltejs/kit';
import type { Auth } from 'duckylib';



export const GET = async ({ cookies, params, request }): Promise<Response> => {
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
            failReason = "Current user not found"
            statusCode = 400;
        }
    }

    if (userId !== null) {
        console.log("SEARCHING USER ID", userId)
        console.log("USER ID IS NAN?", Number.isNaN(Number(userId)))

        let split = userId.split("");
        
        let dbUser = null;
        if(!Number.isNaN(Number(userId))) {
            dbUser = await getUserById(userId, tokenCookie);
        } else {
            dbUser = await getUserByLogin(userId, tokenCookie);
        }
        
        if (dbUser !== null) {
            statusCode = 200;

            return json(apiResponse<TwitchUser>(dbUser, requesterId, statusCode))
        } else {
            failReason = "User not found"
            statusCode = 400;
            return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
        }
    } else {

        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }
}