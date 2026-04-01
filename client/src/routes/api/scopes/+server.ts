import { getScopes } from "$lib/auth"
import { apiResponse } from "$lib/util";
import { json } from "@sveltejs/kit";

export const GET = async (): Promise<Response> => {
    let scopes = getScopes();

    return json(apiResponse(scopes))
}