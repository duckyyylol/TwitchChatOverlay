import { getChannelBadgeById, getGlobalBadgeById, getSevenTvEmotes } from '$lib/twitch.js';
import { parseCookie } from '$lib/util.js'
import { json } from '@sveltejs/kit';

export const GET = async ({params, request}): Promise<Response> => {
    let tokenCookie = parseCookie(request.headers.get("cookie") || null, "token-0");
    if(!tokenCookie) return json(null);

    let broadcasterId = params.broadcasterId;

    const emotes = await getSevenTvEmotes(broadcasterId);

    return json(emotes);
}