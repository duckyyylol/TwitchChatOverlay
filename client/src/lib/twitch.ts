import { PUBLIC_7TV_BASE_URL, PUBLIC_TWITCH_CLIENT_ID, PUBLIC_TWITCH_HELIX_BASE_URL } from "$env/static/public";
import axios, { type AxiosResponse } from "axios";
import type { SevenTVEmote, TwitchArrayResponse, TwitchFollowedChannel, TwitchGlobalBadge, TwitchGlobalBadgeSet, TwitchPaginatedResponse, TwitchUser, TwitchUserQueryResponse } from "./types";
import { UserRoles, type Auth } from "duckylib";
import { createDatabaseUser, getDatabaseUser } from "./server/db/users";

enum Endpoints {
    CURRENT_USER="/users",
    USERS="/users",
    FOLLOWED_CHANNELS="/channels/followed",
    GLOBAL_BADGES="/chat/badges/global",
    CHANNEL_BADGES="/chat/badges"
}

let baseUrl = PUBLIC_TWITCH_HELIX_BASE_URL;


function headers(token: string | null): Record<string, string> {
    let head = {
        "Authorization": `Bearer ${token}`,
        "Client-Id": PUBLIC_TWITCH_CLIENT_ID
    }

    return head;
}

async function get<T = unknown>(endpoint: Endpoints, token: string | null, queryString: string = ""): Promise<AxiosResponse<T> | null> {
    if(!token) return null;
    try {
        const res = await axios.get<T>(`${baseUrl}${endpoint}${queryString}`, {headers: headers(token)});
        if(res.status !== 200) return null;
        return res;
    } catch (e) {
        console.log("TWITCH GET FAILED", e)
        return null;
    }
}

async function post<T = unknown>(endpoint: Endpoints, token: string | null, body: any = {}, queryString: string = ""): Promise<AxiosResponse<T> | null> {
    if(!token) return null;
    try {
        const res = await axios.post<T>(`${baseUrl}${endpoint}${queryString}`, body, {headers: headers(token)})
        if(res.status !== 200) return null;

        return res;
    } catch(e) {
        console.log("TWITCH POST FAILED", e)
        return null;
    }
}

export async function getUserFromToken(token: string | null): Promise<TwitchUser | null> {
    const res = await get<TwitchUserQueryResponse>(Endpoints.CURRENT_USER, token);
    if(!res) return null;
    if(!res.data?.data?.[0]) return null;
    return res.data.data[0];
}

export async function getUserByLogin(login: string, token: string | null): Promise<TwitchUser | null> {
    const res = await get<TwitchUserQueryResponse>(Endpoints.USERS, token, `?login=${login}`);
    if(!res) return null;
    if(!res.data?.data?.[0]) return null;
    
    return res.data.data[0];
}

export async function getUserById(id: string, token: string | null): Promise<TwitchUser | null> {
    const res = await get<TwitchUserQueryResponse>(Endpoints.USERS, token, `?id=${id}`);
    if(!res) return null;
    if(!res.data?.data?.[0]) return null;
    
    return res.data.data[0];
}

export async function getFollowedChannels(token: string | null, max: number = 20): Promise<TwitchFollowedChannel[]> {
    let user = await getUserFromToken(token);
    if(!user) return [];
    const res = await get<TwitchPaginatedResponse<TwitchFollowedChannel>>(Endpoints.FOLLOWED_CHANNELS, token, `?user_id=${user.id}&first=${max}`);
    if(!res) return [];
    if(!res.data?.data) return [];
    return res.data.data;
}

export async function getGlobalBadgeById(setId: string, badgeId: string, token: string | null): Promise<TwitchGlobalBadge | null> {
    const res = await get<TwitchArrayResponse<TwitchGlobalBadgeSet>>(Endpoints.GLOBAL_BADGES, token, `?set_id=${setId}&id=${badgeId}`);
    if(!res) return null;
    if(!res.data?.data) return null;
    
    let badgeSet = res.data.data.find(s => s.set_id === setId)?.versions;
    if(!badgeSet) return null;
    let badge = badgeSet.find(b => b.id === badgeId);
    if(!badge) return null;

    return badge;
}

export async function getChannelBadgeById(broadcasterId: string, setId: string, badgeId: string, token: string | null): Promise<TwitchGlobalBadge | null> {
    const res = await get<TwitchArrayResponse<TwitchGlobalBadgeSet>>(Endpoints.CHANNEL_BADGES, token, `?set_id=${setId}&id=${badgeId}&broadcaster_id=${broadcasterId}`);
    if(!res) return null;
    if(!res.data?.data) return null;
    
    let badgeSet = res.data.data.find(s => s.set_id === setId)?.versions;
    if(!badgeSet) return null;
    let badge = badgeSet.find(b => b.id === badgeId);
    if(!badge) return null;

    return badge;
}

export async function getSevenTvEmotes(broadcasterId: string): Promise<SevenTVEmote[]> {
    let res = await axios.get(`${PUBLIC_7TV_BASE_URL}/users/twitch/${broadcasterId}`);
    if(!res.data || !res.data?.emote_set?.emotes) return [];

    return res.data.emote_set.emotes || [];
}
