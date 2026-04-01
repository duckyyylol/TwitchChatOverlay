import { getFeaturedGameIds } from '$lib/twitch';
import { parseCookie } from '$lib/util'
import { json } from '@sveltejs/kit';

export const GET = async ({request}): Promise<Response> => {
    const tokenCookie = parseCookie(request.headers.get("cookie") || null, "token-0");

    if(!tokenCookie) return json([]);

    const featuredGames = await getFeaturedGameIds(tokenCookie);

    return json(featuredGames);
}