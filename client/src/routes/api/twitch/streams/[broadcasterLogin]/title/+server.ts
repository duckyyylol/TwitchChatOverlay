import { getStreamByUserLogin } from "$lib/twitch.js";
import { parseCookie } from "$lib/util";
import { json } from "@sveltejs/kit"



export const GET = async ({params, request}): Promise<Response> => {
    let channel = params.broadcasterLogin;
    let tokenCookie = parseCookie(request.headers.get("cookie") || null, "token-0")
    if(!tokenCookie) return json({title: "No Title"});

    let stream = await getStreamByUserLogin(channel, tokenCookie);

    if(!stream) return json({title: "No Title"});

    return json({title: stream.title})
}