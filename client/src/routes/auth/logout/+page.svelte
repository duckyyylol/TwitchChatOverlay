<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { setUserData } from "duckylib";
    import { onMount } from "svelte";

    onMount(() => {
        if(browser) window.localStorage.removeItem("userData")
        setTimeout(() => {
            if(browser) window.location.replace("/")
        }, 1000)
    })
</script>