import { getGameById, searchGameByName } from '$lib/twitch';
import { parseCookie } from '$lib/util'
import { json } from '@sveltejs/kit';

export const GET = async ({params, url, request}): Promise<Response> => {
    const tokenCookie = parseCookie(request.headers.get("cookie") || null, "token-0");
    if(!tokenCookie) return json(null);

    let gameId = params.gameId;

    if(Number.isNaN(parseInt(gameId))) {
        let allGames = await searchGameByName(encodeURIComponent(gameId), tokenCookie)
    
        if(!allGames || !allGames[0]) return json(null);

        allGames[0].box_art_url = allGames[0].box_art_url.replace("{width}", "300").replace("{height}", "420")

        return json(allGames[0])
    } else {
        let game = await getGameById(gameId, tokenCookie);

        if(!game) return json(null);
        
        game.box_art_url = game.box_art_url.replace("{width}", "300").replace("{height}", "420")


        return json(game);
    }


}