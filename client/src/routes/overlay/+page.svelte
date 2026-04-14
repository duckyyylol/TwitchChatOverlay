<script lang="ts">
    import Chat from "$lib/components/Chat.svelte";
    import { AppConfig } from "$lib/config";
    import type { DBAppConfig, ApiResponse } from "$lib/types";
    import { onMount } from "svelte";

    async function getAppConfig(): Promise<Partial<DBAppConfig>> {
        let res: ApiResponse<DBAppConfig | null> = await (
            await fetch(`/api/config`)
        ).json();
        return res.data || defaultAppConfig;
    }

    let defaultAppConfig = AppConfig.default_app_config;

    let appConfig: Partial<DBAppConfig> = $state(defaultAppConfig);

    onMount(async () => {
        appConfig = await getAppConfig();

        setInterval(async () => {
            appConfig = await getAppConfig();
        })
    })

</script>
<Chat backgroundMode="transparent" widthPx={appConfig.overlay_width} heightPx={appConfig.overlay_height} borderRadiusPx={0} />