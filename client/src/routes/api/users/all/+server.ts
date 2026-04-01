import { getAllUsers, getDatabaseUser } from '$lib/server/db/users.js';
import { getUserFromToken } from '$lib/twitch.js';
import type { ApiResponse, TwitchUser } from '$lib/types.js';
import { apiResponse, get, parseCookie } from '$lib/util.js';
import { json } from '@sveltejs/kit';
import type { Auth } from 'duckylib';



export const GET = async ({ cookies, params, request }): Promise<Response> => {
    let failReason = "";
    let statusCode = 200;
    let apiUser: TwitchUser | null = null;

    let response = await get(request, cookies);
    if (response instanceof Response) return response;
    apiUser = response as TwitchUser | null;

    let requesterId = apiUser?.id;

    let dbUsers = getAllUsers();
    if (dbUsers !== null) {
        statusCode = 200;

        return json(apiResponse<Auth.User[]>(dbUsers, requesterId, statusCode))
    } else {
        failReason = "Users not found"
        statusCode = 400;
        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }
}
