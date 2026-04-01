<script lang="ts">
    import { browser } from '$app/environment';
    import { onMount } from 'svelte';

    let {data} = $props();

    let url = $derived(data.redirectUrl);

    onMount(() => {
        if(url && browser) window.location.replace(url);
    })
</script>