import { createChannelBadge, getChannelBadge } from '$lib/server/db/channelBadges.js';
import { getChannelBadgeById, getGlobalBadgeById } from '$lib/twitch.js';
import type { TwitchGlobalBadge } from '$lib/types.js';
import { parseCookie } from '$lib/util.js'
import { json } from '@sveltejs/kit';

export const GET = async ({params, request}): Promise<Response> => {
    let tokenCookie = parseCookie(request.headers.get("cookie") || null, "token-0");
    if(!tokenCookie) return json(null);

    let badgeSetId = params.setId;
    let badgeId = params.badgeId;
    let broadcasterId = params.broadcasterId;

    let dbBadge = getChannelBadge(broadcasterId, badgeId, badgeSetId);
    let badge: TwitchGlobalBadge | null;
    
    if(!dbBadge) {
        badge = await getChannelBadgeById(broadcasterId, badgeSetId, badgeId, tokenCookie);
        if(badge !== null) {
            createChannelBadge({badge_id: badgeId, channel_id: broadcasterId, set_id: badgeSetId, url: badge.image_url_2x});
        }
    } else {
        badge  = {id: badgeId, click_action: "", click_url: "", description: "", title: "", image_url_1x: dbBadge.url, image_url_2x: dbBadge.url, image_url_4x: dbBadge.url}
    }

    return json(badge);
}