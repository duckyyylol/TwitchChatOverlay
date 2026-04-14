import { updateAppConfig } from '$lib/server/db/appConfig.js';
import { json } from '@sveltejs/kit';

export const POST = async ({params}): Promise<Response> => {
    let width = Number(params.width);

    if(Number.isNaN(width)) return json(false);

    let newConfig = updateAppConfig({overlay_width: width});

    return json(newConfig ? true : false);
}