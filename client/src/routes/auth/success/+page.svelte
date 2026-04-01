<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { getUserData, setUserData, type Auth } from "duckylib";
    import { onMount } from "svelte";

    let user: Auth.User | null = $state(null);


    onMount(async () => {
        user = (await (await fetch(`/api/users/@me`)).json()).data || null;

        setInterval(async () => {
        if(user !== null && getUserData() === null) {
            setUserData(user)
        }else if (getUserData() !== null) {
            if(browser) window.location.replace(page.url.searchParams.get("from") || "/")
        } else if(user === null) {
            user = (await (await fetch(`${page.url.protocol}//${page.url.hostname}${page.url.protocol.includes("https") ? "" : `:${page.url.port}`}/api/users/@me`)).json()).data || null;
        }
    },5e2)
    })

    
</script>

👍 yuo have did it