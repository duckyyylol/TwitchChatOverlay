import { browser } from "$app/environment";
import { page } from "$app/state";
import { PUBLIC_TWITCH_OAUTH_BASE_URL, PUBLIC_TWITCH_CLIENT_ID, PUBLIC_TWITCH_OAUTH_REDIRECT_URI } from "$env/static/public";
import type { ApiResponse } from "$lib/types";

export const load = async ({ fetch, url }) => {
    async function fetchScopes(): Promise<string[]> {
        let res: ApiResponse<string[]> = await (await fetch(`/api/scopes`)).json();
        return res.data || [];
    }

    let scopes = await fetchScopes();

    let redirectUrl = new URL(`${PUBLIC_TWITCH_OAUTH_BASE_URL}/authorize`);
    redirectUrl.searchParams.append("response_type", "code")
    redirectUrl.searchParams.append("client_id", PUBLIC_TWITCH_CLIENT_ID)
    redirectUrl.searchParams.append("redirect_uri", PUBLIC_TWITCH_OAUTH_REDIRECT_URI)
    redirectUrl.searchParams.append("scope", scopes.join(" "));
    redirectUrl.searchParams.append("state", "/");

    if (browser) window.location.replace(redirectUrl);

    return {
        scopes,
        redirectUrl
    }
}