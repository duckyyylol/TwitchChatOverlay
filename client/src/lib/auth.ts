import { PRIVATE_TWITCH_CLIENT_SECRET } from "$env/static/private";
import { PUBLIC_TWITCH_CLIENT_ID, PUBLIC_TWITCH_OAUTH_BASE_URL, PUBLIC_TWITCH_OAUTH_REDIRECT_URI } from "$env/static/public"
import type { Cookies } from "@sveltejs/kit";
import type { TwitchUser } from "./types"
import axios from "axios";
import { getUserFromToken } from "./twitch";
import type { Auth } from "duckylib";

export const getScopes = (): string[] => {
    return [
        'user:read:follows',
        'user:read:chat',
        'channel:bot',
        'chat:read'
    ]
}

export const exchangeCodeForToken = async (code: string): Promise<Auth.AccessToken | null> => {
    let params = new URLSearchParams();
    params.append("grant_type", "authorization_code")
    params.append("redirect_uri", PUBLIC_TWITCH_OAUTH_REDIRECT_URI)
    params.append("code", code);
    params.append("client_id", PUBLIC_TWITCH_CLIENT_ID)
    params.append("client_secret", PRIVATE_TWITCH_CLIENT_SECRET)

    try {
        const response = await axios.post(`${PUBLIC_TWITCH_OAUTH_BASE_URL}/token`, params);
        if (response.status !== 200 || !(response.data as Auth.AccessToken)?.access_token) return null;
        
        return response.data as Auth.AccessToken;
    } catch (e) {
        console.log(e)
        return null;
    }

}

export const currentUserIsValid = async (cookies: Cookies): Promise<TwitchUser | null> => {
    let currentUser = null;
    let currentSessionToken = cookies.get("token-0");
    if(!currentSessionToken) {
        console.log("invalid token")
        return null;
    } else {
        currentUser = await getUserFromToken(currentSessionToken);
        if(!currentUser) {console.log("no current user"); return null;}
        
        return currentUser;
    }

}

export const refreshToken = async (refresh_token: string): Promise<Auth.AccessToken | null> => {
    let params = new URLSearchParams();
    params.append("grant_type", "refresh_token")
    params.append("refresh_token", encodeURIComponent(refresh_token));
    params.append("client_id", PUBLIC_TWITCH_CLIENT_ID)
    params.append("client_secret", PRIVATE_TWITCH_CLIENT_SECRET)

    try {
        const response = await axios.post(`${PUBLIC_TWITCH_OAUTH_BASE_URL}/token`, params);
        if (response.status !== 200 || !(response.data as Auth.AccessToken)?.access_token) return null;
        
        return response.data as Auth.AccessToken;
    } catch (e) {
        console.log(e)
        return null;
    }
}