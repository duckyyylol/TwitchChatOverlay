import { updateAppConfig } from '$lib/server/db/appConfig.js';
import { json } from '@sveltejs/kit';

export const POST = async ({params}): Promise<Response> => {
    let height = Number(params.height);

    if(Number.isNaN(height)) return json(false);

    let newConfig = updateAppConfig({overlay_height: height});

    return json(newConfig ? true : false);
}