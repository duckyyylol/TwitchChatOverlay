import { PRIVATE_TWITCH_CHANNEL } from "$env/static/private"
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async (): Promise<Response> => {
    let channelName = PRIVATE_TWITCH_CHANNEL;

    return json(apiResponse<string>(channelName));
}