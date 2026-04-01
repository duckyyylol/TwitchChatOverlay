import { PRIVATE_TWITCH_CHANNEL } from "$env/static/private";
import { exchangeCodeForToken } from "$lib/auth";
import { createDatabaseUser, getDatabaseUser, updateDatabaseUser } from "$lib/server/db/users.js";
import { getUserFromToken } from "$lib/twitch.js";
import { deserializeJSONCookie, serializeJSONCookie } from "$lib/util";
import { json, redirect } from "@sveltejs/kit";
import { setUserData, UserRoles, type Auth } from "duckylib";

export const GET = async ({url, locals, cookies}): Promise<Response> => {
    let code = url.searchParams.get("code");
    let fromPath = decodeURIComponent(url.searchParams.get("state") || "/");


    if(!code) {
        return json(null);
    } else {
        // code exists, continue with oauth :)
        const token: Auth.AccessToken | null = await exchangeCodeForToken(code);
        console.log(token);
        if(!token || !token.access_token) {
            // auth failed
                console.log("auth failed")
            return json(null);
        } else {
            // make sure token is real person and also a session doesn't already exist for them
            const tokenUser = await getUserFromToken(token.access_token);
            if(!tokenUser) {
                // token is invalid
                console.log("token is invalid")
                return redirect(308, `/auth/failure?from=${fromPath}&err=Token is Invalid`);

            } else {
                if(tokenUser.login !== PRIVATE_TWITCH_CHANNEL) return redirect(308, `/auth/failure?from=${fromPath}&err=Invalid Channel`);
                let tokenExpiresAt = Date.now() + ((token?.expires_in || 0) * 1000);
                let tokenExpiresInSeconds = token.expires_in


                cookies.set(`token-0`, token.access_token, {path: "/", expires: new Date(tokenExpiresAt), maxAge: tokenExpiresInSeconds, httpOnly: true, secure: true})
                if(token.refresh_token) cookies.set(`token-r`, token.refresh_token, {path: "/", expires: new Date(tokenExpiresAt), maxAge: tokenExpiresInSeconds})

                
                const dbUser = getDatabaseUser(tokenUser.id);
                console.log("DBUSER", dbUser)
                let userData: Auth.User = {username: tokenUser.display_name, avatarUrl: tokenUser.profile_image_url, id: tokenUser.id, role: dbUser ? dbUser.role : UserRoles.DEFAULT};

                // let userDataString = serializeJSONCookie<Auth.User>(userData);

                // cookies.set("transport-userdata", userDataString, {path: "/", maxAge: 30})
                if(!dbUser) {
                    createDatabaseUser(userData);
                } else {
                    userData.role = dbUser.role;
                    await updateDatabaseUser(tokenUser.id, userData);
                }



                //should be done now. can refresh
                redirect(308, `/auth/success?from=${fromPath}`);
            }

            // return json(token);
        }
    }
}