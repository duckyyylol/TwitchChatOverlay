<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { AppConfig } from "$lib/config";
    import type {
        ApiResponse,
        DBAppConfig,
        SevenTVEmote,
        TwitchChatPacket,
        TwitchGlobalBadge,
    } from "$lib/types";
    import { closeWebSocket, initWebSocket, socketStore } from "$lib/ws";
    import { Column, getUserData, Row, Text, ThemeButton } from "duckylib";
    import { onDestroy, onMount } from "svelte";
    import { flip } from "svelte/animate";
    import { fade, fly } from "svelte/transition";

    interface ChatProps {
        backgroundMode: "transparent" | "theme";

        borderRadiusPx?: number;
        widthPx?: number | "fill" | "fit";
        heightPx?: number | "fill" | "fit";
        widthPercent?: number;
        heightPercent?: number;
        paddingPx?: number;
        paddingLeftPx?: number;
        paddingRightPx?: number;
        paddingBottomPx?: number;
        paddingTopPx?: number;
    }

    interface DisplayedMessage {
        content: string;
        author: string;
        color: string;
        badges: string[];
        show: boolean;
        id: string;
    }

    let {
        backgroundMode = "theme",
        borderRadiusPx = 8,
        widthPercent = 100,
        heightPercent = 0,
        widthPx = "fit",
        heightPx = 480,
        paddingPx = 0,
        paddingBottomPx = 0,
        paddingLeftPx = 0,
        paddingRightPx = 0,
        paddingTopPx = 0,
    }: ChatProps = $props();

    let user = $state(getUserData());

    async function getBadgeUrl(
        setId: string,
        badgeId: string,
    ): Promise<string> {
        let fallbackImagePath = "src/lib/assets/favicon.png";
        let toReturn: string | null =
            (
                (await (
                    await fetch(
                        `/api/twitch/badges/channel/${user?.id}/${setId}/${badgeId}`,
                    )
                ).json()) as TwitchGlobalBadge
            )?.image_url_2x || null;

        console.log("BADGE", setId, badgeId);
        if (!toReturn) {
            toReturn =
                (
                    (await (
                        await fetch(
                            `/api/twitch/badges/global/${setId}/${badgeId}`,
                        )
                    ).json()) as TwitchGlobalBadge
                )?.image_url_2x || null;
        }

        if (!toReturn) {
            toReturn = fallbackImagePath;
        }

        return toReturn;
    }

    async function isUserIgnored(userId: string): Promise<boolean> {
        let res: ApiResponse<boolean> = await (
            await fetch(`/api/users/ignored/${userId}`)
        ).json();
        return res.data || false;
    }

    async function getAppConfig(): Promise<Partial<DBAppConfig>> {
        let res: ApiResponse<DBAppConfig | null> = await (
            await fetch(`/api/config`)
        ).json();
        return res.data || defaultAppConfig;
    }

    async function keepAlive(): Promise<void> {
        let r: ApiResponse<any | null> = await (
            await fetch(`/api/users/@me`)
        ).json();
        if (!r.data) {
            for (let i = 0; i < MAX_MESSAGES; i++) {
                let systemMsg = await buildMessage(null, true, "Authorization failed. Your session has expired and could not be refreshed. Please log in again.", `error-${i}`);
                if(systemMsg) postMessage(systemMsg);
            }
        }
    }

    async function getSevenTvEmotes(): Promise<SevenTVEmote[]> {
        if (!user?.id) return [];
        let res = await (await fetch(`/api/twitch/7tv/${user.id}`)).json();
        return res || [];
    }

    function findSevenTvEmotes(content: string): Record<string, string> {
        let toReturn: Record<string, string> = {};
        let matches: { emote: string; index: number }[] = [];
        let workingContent = content;
        let i = 0;

        sevenEmotes.forEach((e) => {
            let key = e.name;

            let firstChar = key[0];
            let finalChar = key[key.length - 1];
            // console.log("SEVEN EMOTE KEY", key, firstChar, finalChar)

            let keyRegex = new RegExp(key, "g");
            content.matchAll(keyRegex).forEach((match) => {
                console.log("MATCH", key, match);
                if (match[0])
                    matches.push({
                        emote: match[0],
                        index: workingContent.indexOf(match[0]),
                    });
                workingContent = workingContent.replace(
                    match[0],
                    "-".repeat(match[0].length),
                );
            });
        });

        matches = matches.sort((a, b) => a.index - b.index);
        workingContent = content;

        matches.forEach((match) => {
            let startIndex = match.index;
            let endIndex = startIndex + match.emote.length - 1;

            let emote = sevenEmotes.find((e) => e.name === match.emote);

            if (emote)
                toReturn[`${startIndex}-${endIndex}`] =
                    `https:${emote.data.host.url}/${emote.data.host.files.find((f) => f.name === "1x.webp")?.name}`;
        });

        console.log(`EMOTE MATCHES`, matches);
        console.log("TO RETURN", toReturn);

        return toReturn;
    }

    async function buildMessage(message: TwitchChatPacket | null, system: boolean = false, systemContent: string | null = null, systemId: string | null = null): Promise<DisplayedMessage | null> {
        // console.log("EMOTES", await getSevenTvEmotes())
        if(system && systemContent) {
            return {
                author: "System",
                color: "#7289da",
                badges: [],
                content: systemContent,
                id: systemId ? systemId : `${Math.floor(Math.random() * 3287482)}-system-${Math.floor(Math.random() * 3287482)}`,
                show: true,
            }
        }

        if(!message) return null;

        let ignored = await isUserIgnored(message.userInfo.userId);
        if (ignored) return null;
        console.log("TWITCH EMOTES", message.emoteOffsets);
        let built: DisplayedMessage = {
            id: `${Math.floor(Math.random() * 99999999).toString(16)}`,
            author: message.userInfo.display_name,
            color:
                message.userInfo.color ||
                `${Math.floor(Math.random() * 16777215).toString(16)}`,
            content: message.content,
            badges: [],
            show: true,
        };

        let badges = message.userInfo.badgeInfo;

        let b: string[] = [];

        Object.entries(badges).forEach(async ([setId, badgeId]) => {
            let badge = await getBadgeUrl(setId, badgeId);
            console.log(badge);
            b = [...b, badge];
            built.badges = [...built.badges, badge];
        });

        let p = Object.entries(badges).map(
            async ([setId, badgeId]) => await getBadgeUrl(setId, badgeId),
        );

        built.badges = await Promise.all(p);

        let sevenEmoteOffsets = findSevenTvEmotes(built.content);
        let emojisToReplace: { text: string; url: string }[] = [];
        Object.entries({
            ...message.emoteOffsets,
            ...sevenEmoteOffsets,
        }).forEach(([key, url]) => {
            let nums = key.split(/\-/g);
            let i = parseInt(nums[0]);
            let toReplace = "";
            while (i <= parseInt(nums[1])) {
                toReplace += message.content.charAt(i);
                i++;
            }

            emojisToReplace.push({ text: toReplace, url: url });
        });

        emojisToReplace.forEach((t) => {
            built.content = built.content.replaceAll(
                t.text,
                `\<img src=\'${t.url}\' alt=\"emoticon\" style="height:1.33em; line-height: 0.5em; margin-bottom: -5px;" class="emoji" \/\>`,
            );
        });

        let usernameRegex = new RegExp(
            user?.username || "---usernotfound",
            "gim",
        );

        // built.content = built.content.replaceAll(usernameRegex, `<span style="background-color:rgba(128, 50, 128, 0.508);padding: 0px 3px;">${user?.username}</span`)

        // emojisToReplace = [];

        // Object.entries(sevenEmoteOffsets).forEach(([key, url]) => {
        //     let nums = key.split(/\-/g);
        //     let i = parseInt(nums[0]);
        //     let toReplace = "";
        //     while (i <= parseInt(nums[1])) {
        //         toReplace += message.content.charAt(i);
        //         i++;
        //     }

        //     emojisToReplace.push({ text: toReplace, url: url });
        // });

        // emojisToReplace.forEach((t) => {
        //     built.content = built.content.replaceAll(
        //         t.text,
        //         `\<img src=\'${t.url}\' alt=\"emoticon\" style="height:1.33em; line-height: 0.5em; margin-bottom: -5px;" class="emoji" \/\>`,
        //     );
        // });

        return built;
    }

    onMount(async () => {
        await keepAlive();
        sevenEmotes = await getSevenTvEmotes();
        appConfig = await getAppConfig();

        if (
            page.url.searchParams.has("theme") &&
            ["light", "dark"].includes(
                page.url.searchParams.get("theme")?.toLowerCase() || "",
            )
        ) {
            if (browser) {
                window.localStorage.setItem(
                    "theme",
                    page.url.searchParams.get("theme") || "dark",
                );
                window.location.replace(page.url.pathname);
            }
        }

        setInterval(async () => {
            await keepAlive();
        }, 30e3);

        setInterval(async () => {
            appConfig = await getAppConfig();
        }, 5e2);

        initWebSocket();
    });

    onDestroy(() => {
        socketStore.update((sr) => {
            sr.messages = [];
            return sr;
        })
        closeWebSocket();
        
    });

    let MAX_MESSAGES = (() => backgroundMode)() === "transparent" ? 10 : 30;
    let MESSAGE_TIMEOUT = 5e3;

    function postMessage(message: DisplayedMessage): void {
        console.log("NEW MESSAGE", message);
        console.log(messages.length);

        if (messages.length >= MAX_MESSAGES) {
            messages = messages.slice(1);
        }

        messages = [...messages, message];
        showingMessages[message.id] = true;

        // if (backgroundMode === "theme")
        //     setTimeout(
        //         () => {
        //             showingMessages[message.id] = false;
        //         },
        //         message.content.length > 100
        //             ? Math.floor(MESSAGE_TIMEOUT / 0.5)
        //             : MESSAGE_TIMEOUT,
        //     );
        // setTimeout(
        //     () => {
        //         messages.shift();
        //     },
        //     message.content.length > 100
        //         ? Math.floor(MESSAGE_TIMEOUT * 2)
        //         : MESSAGE_TIMEOUT * 3,
        // );
        const isLongMessage = message.content.length > 100;
        const hideDelay = isLongMessage
            ? Math.floor(MESSAGE_TIMEOUT * 0.5)
            : MESSAGE_TIMEOUT;
        const removeDelay = isLongMessage
            ? Math.floor(MESSAGE_TIMEOUT * 2)
            : MESSAGE_TIMEOUT * 3;

        if (backgroundMode === "theme") {
            setTimeout(() => {
                showingMessages[message.id] = false;
            }, hideDelay);
        }

        setTimeout(() => {
            messages = messages.filter((m) => m.id !== message.id);
            delete showingMessages[message.id];
        }, removeDelay);
    }

    const processedPackets = new WeakSet();

    socketStore.subscribe(async (st) => {
        if (!st.messages) return;

        for (const packet of st.messages) {
            if (processedPackets.has(packet)) continue;
            processedPackets.add(packet);

            if (!packet.command) continue;

            if (packet.command === "chatclear") {
                console.log("chat cleared");
                messages = [];
                showingMessages = {};
                let systemMessage = await buildMessage(null, true, "Chat was cleared by a Moderator", `chat-clear-${Math.random() * 102040}`)
                if(systemMessage) postMessage(systemMessage);
                continue;
            }

            if (packet.command !== "chat") continue;

            let message: DisplayedMessage | null = await buildMessage(
                packet.data,
            );

            if (appConfig.ignore_commands && message?.content.startsWith("!"))
                continue;

            if (message) postMessage(message);
        }
    });

    let defaultAppConfig: Partial<DBAppConfig> = AppConfig.default_app_config;

    let messages: DisplayedMessage[] = $state([]);
    let sevenEmotes: SevenTVEmote[] = $state([]);
    let showingMessages: Record<string, boolean> = $state({});
    let appConfig: Partial<DBAppConfig> = $state(defaultAppConfig);
</script>

<div
    style={`
width: ${widthPercent !== 0 ? `${widthPercent}%` : widthPx === "fill" ? "100%" : widthPx === "fit" ? "auto" : `${widthPx}px`};
height: ${heightPercent !== 0 ? `${heightPercent}%` : heightPx === "fill" ? "100%" : heightPx === "fit" ? "auto" : `${heightPx}px`};
${heightPx !== 0 ? `max-height: ${heightPx}px;` : ""}
background-color: ${backgroundMode === "theme" ? "var(--crust)" : "transparent"};
border: ${backgroundMode === "theme" ? "3px solid var(--mantle)" : ""};
border-radius: ${borderRadiusPx}px;
${paddingPx !== 0 ? `padding: ${paddingPx}px;` : `padding: ${paddingTopPx}px ${paddingRightPx}px ${paddingBottomPx}px ${paddingLeftPx}px;`}
`}
    class="chat"
>
    {#each messages as message (message.id)}
    {#if showingMessages[message.id] !== false}
            <div
                class="message {backgroundMode !== 'transparent' &&
                (message.content
                    .toLowerCase()
                    .includes((user?.username || '---unknownuser').toLowerCase()) ||
                    message.author.toLowerCase() ===
                        (user?.username || '---unknownuser').toLowerCase())
                    ? 'mention'
                    : ''}"
                // animate:flip={{ duration: 250 }}
                in:fly={{ y: 20, duration: 300 }}
                out:fade={{ duration: 300 }}
            >
         <div class="author" style="color: {message.color};">
                {#if message.badges.length > 0}
                    <div class="badges">
                        {#each message.badges as badge}
                            <img src={badge} alt="chat badge" />
                        {/each}
                    </div>
                {/if}
                <Row widthPx="fill" heightPx="fit" gapEm={0}>
                    <Text inheritColor={true} weight="bold" sizeEm={0.9}
                        >{message.author}</Text
                    >
                    <Text inheritColor={false}>:</Text>
                </Row>
            </div>
            <div class="content">
                <Text
                    inheritColor={true}
                    weight="semibold"
                    maxLines={backgroundMode !== "transparent" &&
                    message.content
                        .toLowerCase()
                        .includes(
                            (user?.username || "---unknownuser").toLowerCase(),
                        )
                        ? undefined
                        : 3}>{@html message.content}</Text
                >
            </div>
        </div>
        {/if}
        <!-- <div
            class="message {showingMessages[message.id]
                ? ''
                : 'out'} {backgroundMode !== 'transparent' &&
            (message.content
                .toLowerCase()
                .includes((user?.username || '---unknownuser').toLowerCase()) ||
                message.author.toLowerCase() ===
                    (user?.username || '---unknownuser').toLowerCase())
                ? 'mention'
                : ''}"
            onanimationend={(e) => {
                e.currentTarget.style.display = showingMessages[message.id]
                    ? "flex"
                    : "none";
            }}
        >
            <div class="author" style="color: {message.color};">
                {#if message.badges.length > 0}
                    <div class="badges">
                        {#each message.badges as badge}
                            <img src={badge} alt="chat badge" />
                        {/each}
                    </div>
                {/if}
                <Row widthPx="fill" heightPx="fit" gapEm={0}>
                    <Text inheritColor={true} weight="bold" sizeEm={0.9}
                        >{message.author}</Text
                    >
                    <Text inheritColor={false}>:</Text>
                </Row>
            </div>
            <div class="content">
                <Text
                    inheritColor={true}
                    weight="semibold"
                    maxLines={backgroundMode !== "transparent" &&
                    message.content
                        .toLowerCase()
                        .includes(
                            (user?.username || "---unknownuser").toLowerCase(),
                        )
                        ? undefined
                        : 3}>{@html message.content}</Text
                >
            </div>
        </div> -->
    {/each}
</div>

<style>
    .chat {
        /* max-width: 100%;
        min-height: fit-content; */
        /* max-height: 100%; */
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-end;
        flex-wrap: nowrap;
        gap: 0.5em;
        /* flex-basis: content; */
    }

    @keyframes fadeOut {
        0% {
            opacity: 1;
            display: flex;
        }

        100% {
            opacity: 0;
            display: none;
        }
    }

    @keyframes fadeIn {
        0% {
            opacity: 0;
            display: none;
        }

        100% {
            opacity: 1;
            display: flex;
        }
    }

    .out {
        animation: 0.5s fadeOut ease-out forwards;
    }

    .in {
        animation: 0.5s fadeIn ease-out forwards;
    }

    .message {
        /* max-height: 75px; */
        min-height: fit-content;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        text-align: left;
        gap: 0.33em;
        word-break: break-word;
        overflow-wrap: break-word;
        /* flex-wrap: wrap; */
        /* text-wrap: wrap; */
        overflow: hidden;
        flex-shrink: 0;
    }

    .author {
        --px: 0.2px;
        --px-neg: -1px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 0.33em;
        text-shadow:
            var(--px-neg) var(--px-neg) 0 #4f4f4f,
            var(--px) var(--px-neg) 0 #4f4f4f,
            var(--px-neg) var(--px) 0 #4f4f4f,
            var(--px) var(--px) 0 #4f4f4f;
    }

    .badges img {
        height: 1em;
    }

    .badges {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 0.2em;
    }

    .content {
        --px: 0.5px;
        --px-neg: -0.5px;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 0.33em;
        text-wrap: wrap;
        min-height: 100%;
        color: white;
        text-shadow:
            var(--px-neg) var(--px-neg) 0 #4f4f4f,
            var(--px) var(--px-neg) 0 #4f4f4f,
            var(--px-neg) var(--px) 0 #4f4f4f,
            var(--px) var(--px) 0 #4f4f4f;
    }

    .mention {
        background-color: rgba(128, 0, 128, 0.308);
        border-radius: 8px;
    }
</style>
