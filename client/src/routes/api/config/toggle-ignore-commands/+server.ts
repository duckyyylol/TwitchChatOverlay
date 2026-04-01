import { AppConfig } from "$lib/config";
import { getAppConfig, updateAppConfig } from "$lib/server/db/appConfig"
import { type DBAppConfig } from "$lib/types";
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const POST = async () => {
    let appConfig = getAppConfig() || AppConfig.default_app_config;
    
    let na = updateAppConfig({ignore_commands: !appConfig?.ignore_commands});
    return json(apiResponse<DBAppConfig | null>(na))
}