import { getDatabaseUser, updateDatabaseUser } from "$lib/server/db/users";
import type { TwitchUser } from "$lib/types";
import { apiResponse, get } from "$lib/util";
import { json } from "@sveltejs/kit";
import { UserRoles, type Auth } from "duckylib";

export const POST = async ({params, url, request, cookies}): Promise<Response> => {
    let userId: string | null = params.userId;
    let newRole = parseInt(params.role);
    let failReason = "";
    let statusCode = 200;
    let apiUser: TwitchUser | null = null;

    let response = await get(request, cookies);
    if(response instanceof Response) return response;
    apiUser = response as TwitchUser | null;

    let requesterId = apiUser?.id;

    if(Number.isNaN(newRole)) {
        return json(apiResponse<null>(null, requesterId, 400, false, "Role not found"))
    }

    if (!requesterId || requesterId === "0") {
        return json(apiResponse<null>(null, requesterId, 400, false, "User not found"))
    }

    let dbUser = getDatabaseUser(requesterId);
    console.log(dbUser)
    if (!dbUser || (dbUser.role !== UserRoles.ADMIN)) {
        return json(apiResponse<null>(null, requesterId, 403, false, "You do not have permission to set user roles"))
    }

    let superusers = ["529423777", "132723514"]

    if(superusers.includes(userId) && newRole === UserRoles.DEFAULT) {
        return json(apiResponse<null>(null, requesterId, 403, false, "You do not have permission to set this user's roles"))
    }

    let updated = await updateDatabaseUser(userId, {role: newRole});
    if(updated.changes === 0) {
        return json(apiResponse<null>(null, requesterId, 400, false, "Failed to set role"))
    } else {
        let newUser = getDatabaseUser(userId);
        if(!newUser) {
            return json(apiResponse<null>(null, requesterId, 400, false, "Failed to fetch new user data"))
        } else {
            return json(apiResponse<Auth.User>(newUser, requesterId))
        }
    }
}