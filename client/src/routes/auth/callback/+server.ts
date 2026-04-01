import { deserializeJSONCookie, serializeJSONCookie } from '$lib/util';
import { json, redirect } from '@sveltejs/kit';
import { setUserData, UserRoles, type Auth } from 'duckylib';
import { createDatabaseUser, deleteDatabaseUser, getDatabaseUser } from "$lib/server/db/users.js"
import { getUserFromToken } from '$lib/twitch.js';
import { refreshToken } from '$lib/auth.js';
import { browser } from '$app/environment';

export const GET = async ({ url, cookies, fetch }): Promise<Response> => {
    let tokenCookie = cookies.get("token-0") || null;
    console.log("TOKEN", tokenCookie)
    let refreshTokenCookie = cookies.get("token-r") || null;
    console.log("REFRESH TOKEN", refreshTokenCookie)
    let apiUser = await getUserFromToken(tokenCookie);
    console.log("API USER", apiUser)

    if (!url.searchParams.has("out")) {
        if (!apiUser) {
            console.log("api user not found")
            if (refreshTokenCookie !== null) {
                let refreshedToken = await refreshToken(refreshTokenCookie);
                if (refreshedToken && refreshedToken.access_token) {
                    apiUser = await getUserFromToken(refreshedToken.access_token);

                    if (apiUser) {
                        let tokenExpiresAt = Date.now() + ((refreshedToken?.expires_in || 0) * 1000);
                        let tokenExpiresInSeconds = refreshedToken.expires_in


                        cookies.set(`token-0`, refreshedToken.access_token, { path: "/", expires: new Date(tokenExpiresAt), maxAge: tokenExpiresInSeconds })
                        if (refreshedToken.refresh_token) cookies.set(`token-r`, refreshedToken.refresh_token, { path: "/", expires: new Date(tokenExpiresAt), maxAge: tokenExpiresInSeconds })

                        createDatabaseUser({avatarUrl: apiUser.profile_image_url, id: apiUser.id, role: UserRoles.DEFAULT, username: apiUser.login})
                    }
                }
            } else {
                redirect(308, "/login")
            }


        }

    } else {

        console.log("LOGGING OUT")

        let currentUser = await (await fetch(`/api/users/@me`, { headers: { "x-requester-id": apiUser?.id || "0" } })).json();

        if (currentUser) {
            deleteDatabaseUser(currentUser.id);
            cookies.delete("token-0", { path: "/" })
            cookies.delete("token-r", { path: "/" })
            cookies.delete("transport-userdata", { path: "/" })
            
            redirect(308, `/?a`)
        }
    }


    let dbUser = getDatabaseUser(apiUser?.id || "0");


    return json(dbUser)
}