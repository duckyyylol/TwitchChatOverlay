import { json, redirect, type Cookies } from "@sveltejs/kit";
import { AppConfig } from "./config";
import type { ApiError, ApiResponse, Packets, TwitchUser } from "./types";
import { getUserFromToken } from "./twitch";
import { refreshToken } from "./auth";
import axios from "axios";
import { PUBLIC_APP_URL } from "$env/static/public";
import { browser } from "$app/environment";

export function serializeJSONCookie<T>(obj: T): string {
    return JSON.stringify(obj);
}

export function deserializeJSONCookie<T>(cookie: string): T {
    return JSON.parse(cookie);
}

export function parseCookie(cookie_string: string | null, key: string): string | null {
    if (!cookie_string) return null;
    let pairs = cookie_string.split(";");
    let splitPairs = pairs.map(cookie => cookie.split("="))
    let o: { [key: string]: string; } = splitPairs.reduce<{ [key: string]: string; }>((obj, cookie) => {
        obj[decodeURIComponent(cookie[0].trim())] = decodeURIComponent(cookie[1].trim())

        return obj;
    }, {})

    if (!o[key]) return null;
    return o[key];
}

export function apiResponse<T>(data: T, requester: string | null = null, statusCode: number = 0, success: boolean = true, errorMessage: string | null = null): ApiResponse<T> {
    let res: ApiResponse<T> = {
        data: data,
        v: AppConfig.api_version
    }

    if (requester !== null) res.for = requester;

    if (statusCode > 0) res.status = statusCode;
    if (!success && errorMessage !== null) {
        let error: ApiError = {
            message: errorMessage
        }

        res.error = error;
    }

    return res;
}

export async function get(request: Request, cookies: Cookies, requireAuth: boolean = true): Promise<Response | TwitchUser | null> {
    let failReason = "";
    let statusCode = 200;
    let apiUser = null;

    // if (!request.headers.has("x-requester-id")) {
    //     failReason = "Missing authorization"
    //     statusCode = 401;
    //     return json(apiResponse<null>(null, null, statusCode, false, failReason))
    // }

    let requesterId = request.headers.get("x-requester-id") || "0"
    let tokenCookie = cookies.get("token-0") || null;

    let refreshTokenCookie = cookies.get("token-r") || null;

    let currentUser = await getUserFromToken(tokenCookie)


    if ((!currentUser || !currentUser.id || !tokenCookie) && refreshTokenCookie !== null) {
        let refreshed = await refreshToken(refreshTokenCookie);
        if (refreshed) {
            let tokenExpiresAt = Date.now() + ((refreshed?.expires_in || 0) * 1000);
            let tokenExpiresInSeconds = refreshed.expires_in
            tokenCookie = refreshed.access_token;
            cookies.set(`token-0`, refreshed.access_token, { path: "/", expires: new Date(tokenExpiresAt), maxAge: tokenExpiresInSeconds, httpOnly: true, secure: true})
            if (refreshed.refresh_token) cookies.set(`token-r`, refreshed.refresh_token, { path: "/", expires: new Date(tokenExpiresAt), maxAge: tokenExpiresInSeconds })
        } else {
            tokenCookie = null;
        }
    }

    if (tokenCookie !== null) {
        apiUser = await getUserFromToken(tokenCookie);
    } else {
        failReason = "Missing authorization"
        statusCode = 401;
        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }

    if (apiUser && requireAuth) {
        return apiUser;
    } else if (requireAuth) {
        return null;
    } else {
        failReason = "Missing authorization"
        statusCode = 401;
        return json(apiResponse<null>(null, requesterId, statusCode, false, failReason))
    }
}

export const createPacket = <T extends keyof Packets>(command: T, data: Packets[T]) => {
    return JSON.stringify({ command, data, id: 0 });
}

