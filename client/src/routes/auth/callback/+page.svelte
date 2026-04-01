<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import type { Auth } from "duckylib";
    import { Column, getUserData, Heading, setUserData } from "duckylib";
    import { onMount } from "svelte";

    // let {data} = $props();

    async function getUser(): Promise<Auth.User | null> {
        let r = await (await fetch(`/api/users/@me`, {headers: {"x-requester-id": getUserData()?.id || "0"}})).json()
        return r.data || null;
    }

    let apiUser: Auth.User | null = $state(null);

    onMount(async () => {
        if(page.url.searchParams.has("out") && browser) {
            setTimeout(() => {
                setUserData(null as any);
                window.location.replace(`/${page.url.searchParams.has("a") ? "" : "?a"}`) 
            }, 1e3)
        }
        let i = 0;

        let ai = await (await fetch(`/api/users/@me`, {headers: {"x-requester-id": getUserData()?.id || "0"}})).json()
        console.log('ai', ai)
        

        if(!ai.data) return window.location.replace(`/login`);

        apiUser = ai.data;

        if(!page.url.searchParams.has("out")) setInterval(async () => {
            i++
            console.log(i)
            if(i > 4) {
                if(apiUser) {
                    console.log("apiUser", apiUser)
                    console.log("user a1", apiUser)
                    if(browser) setUserData(apiUser)
                    window.location.replace(page.url.searchParams.get("from") || "/")
                } else {
                    console.log("apiUser", apiUser)
                    console.log("user a2", apiUser)
                    apiUser = await (await fetch(`/api/users/@me`, {headers: {"x-requester-id": getUserData()?.id || "0"}})).json()
                    if(!apiUser && browser) window.location.replace("/login") 
                }

                i = 0;
            }
        },5e2)
    })
</script>
<Column>
    <Heading weight="bolder">{apiUser !== null && apiUser?.username ? `${page.url.searchParams.has("out") ? "Seeya, " : "Hello, "}${apiUser.username}!` : "Redirecting..."}</Heading>
</Column>