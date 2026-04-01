import { getAppConfig } from "$lib/server/db/appConfig"
import { type DBAppConfig } from "$lib/types";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async () => {
    let appConfig = getAppConfig();
    return json(apiResponse<DBAppConfig | null>(appConfig))
}