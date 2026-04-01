<script lang="ts">
    import { browser } from "$app/environment";
    import { PUBLIC_APP_URL } from "$env/static/public";
    import Chat from "$lib/components/Chat.svelte";
    import { AppConfig } from "$lib/config";
    import {
        type ApiResponse,
        type DBAppConfig,
        type TwitchUser,
    } from "$lib/types";
    import { socketStore } from "$lib/ws";
    import {
        Button,
        ButtonCard,
        Code,
        Column,
        getUserData,
        Heading,
        HorizontalRule,
        Markdown,
        Row,
        Symbol,
        Text,
    } from "duckylib";
    import { onMount } from "svelte";

    async function keepAlive(): Promise<void> {
        if (!getUserData()) alive = false;
        let r: ApiResponse<any | null> = await (
            await fetch(`/api/users/@me`)
        ).json();
        if (!r.data && getUserData()) {
            alive = false;
            if (browser) window.location.replace("/auth/logout");
        } else if (r.data && getUserData() !== null) {
            alive = true;
        }
        console.log("KEEP ALIVE", r.data);
    }

    async function getAppConfig(): Promise<Partial<DBAppConfig>> {
        let res: ApiResponse<DBAppConfig | null> = await (
            await fetch(`/api/config`)
        ).json();
        return res.data || defaultAppConfig;
    }

    async function getTargetChannel(): Promise<string | null> {
        let res: ApiResponse<string | null> = await (
            await fetch(`/api/config/channel`)
        ).json();
        return res.data || null;
    }

    async function toggleIgnoreCommands(): Promise<DBAppConfig | null> {
        let res: ApiResponse<DBAppConfig | null> = await (
            await fetch(`/api/config/toggle-ignore-commands`, {
                method: "POST",
            })
        ).json();
        return res.data || null;
    }

    async function getAllIgnoredUsers(): Promise<
        { id: string; username: string }[]
    > {
        let res: ApiResponse<{ id: string; username: string }[]> = await (
            await fetch(`/api/users/ignored`)
        ).json();
        return res.data || [];
    }

    async function toggleIgnored(userId: string): Promise<boolean> {
        let res: ApiResponse<{ id: string; username: string } | null> = await (
            await fetch(`/api/users/ignored/${userId}`, { method: "POST" })
        ).json();
        return res.error !== null;
    }

    async function getOverlayConnected(): Promise<boolean> {
        let res = await (await (fetch(`${PUBLIC_APP_URL}/ws/ping`))).json();
        return res?.is || false;
    }

    let connectionMessage: string = $state("Overlay Connecting...")
    let overlayConnected: boolean = $state(false);
    let defaultAppConfig = AppConfig.default_app_config;
    let alive: boolean = $state(true);
    let appConfig: Partial<DBAppConfig> = $state(defaultAppConfig);
    let ignoreCommands = $derived(appConfig.ignore_commands);
    let ignoredUsers: { id: string; username: string }[] = $state([]);

    let userIdQueued: string = $state("");
    let usernameToIgnore: string = $state("");

    let usernameInvalid = $state(false);
    let usernameMessage = $state("");

    async function tryToIgnore(username: string) {
        let user: ApiResponse<TwitchUser | null> = await (
            await fetch(`/api/twitch/users/${usernameToIgnore}`)
        ).json();
        if (!user.data) {
            usernameInvalid = true;
            usernameToIgnore = "";
        } else {
            let alreadyIgnored = ignoredUsers.some(
                (i) => i.id === user.data?.id,
            );

            usernameMessage = alreadyIgnored
                ? `Un-ignoring ${user.data.display_name}...`
                : `Ignoring ${user.data.display_name}...`;

            let r = await toggleIgnored(user.data.id);

            if (r) {
                usernameMessage = alreadyIgnored
                    ? `Un-ignored ${user.data.display_name}!`
                    : `Ignored ${user.data.display_name}!`;
            } else {
                usernameMessage = alreadyIgnored
                    ? `Failed to un-ignore ${user.data.display_name} :(`
                    : `Failed to ignore ${user.data.display_name} :(`;
            }
            usernameToIgnore = "";
        }

        setTimeout(() => {
            usernameInvalid = false;
            usernameMessage = "";
        }, 1e2);
    }

    onMount(async () => {
        
        overlayConnected = await getOverlayConnected();
        await keepAlive();
        appConfig = await getAppConfig();
        ignoredUsers = await getAllIgnoredUsers();
        targetChannel = await getTargetChannel();

        let i = 0;
        let m = 5;

        setInterval(async () => {
            if(alive) {
                appConfig = await getAppConfig();
                ignoredUsers = await getAllIgnoredUsers();
                overlayConnected = await getOverlayConnected();

                if(!overlayConnected && !connectionMessage.includes("Disconnected") && (i >= m)) {
                    connectionMessage = "Overlay Disconnected"
                    i = 0;
                }

                if(overlayConnected) {
                    // connectionMessage = "Overlay Connected!"
                    i = 0;
                }
                i++
            }
        }, 1e3);

        window.addEventListener("keypress", async (ev) => {
            ev.preventDefault();
            if (ev.key === "Enter" && usernameToIgnore !== "") {
                await tryToIgnore(usernameToIgnore);
            }
        });
    });

    let targetChannel: string | null = $state(null);

    let deleting: boolean = $state(false);

    let joined: string | null = $state(null);
    let parted: string | null = $state(null);

    const processedEvents = new WeakSet();

    socketStore.subscribe((st) => {
        if (!st.messages) return;

        for (const packet of st.messages) {
            if (processedEvents.has(packet)) continue;
            processedEvents.add(packet);

            if (packet.command === "joined") {
                joined = packet.data.channel_name || "Anonymous";
                parted = null;
            }

            if (packet.command === "parted") {
                parted = packet.data.channel_name || "Anonymous";
                joined = null;
            }
        }
    });
</script>

{#if alive}
{#if !overlayConnected}
<Column widthPx="fit" heightPx="fit" alignItems="flex-start" justifyContent="flex-start" marginBottomPx={20} textWrap={true} textAlign="left">
    <Heading size={4} classList={[overlayConnected ? "green" : connectionMessage.includes("Connecting") ? "yellow" : "red"]} weight="bold">{connectionMessage}</Heading>
    {#if !connectionMessage.includes("Connecting")}
    <Text>Please refresh the chat overlay, or add it to OBS if you haven't done so yet.</Text>
    {/if}
    <Text classList={["yellow", "italic"]}>This message will disappear once the overlay is successfully connected.</Text>

    {#if !connectionMessage.includes("Connecting")}

    <Column widthPx="fit" heightPx="fit" alignItems="flex-start" justifyContent="flex-start" marginBottomPx={20} textWrap={true} textAlign="left">
        <Heading size={6} classList={["red"]} weight="bold">Not Connecting?</Heading>
        <Text>This app must be ran inside of a Custom Browser Dock.</Text>
        <!-- svelte-ignore a11y_invalid_attribute -->
        <Text>1. Add this page as a dock in OBS (Docks -> Custom Browser Docks -> Add {PUBLIC_APP_URL} <a href="#" onclick={async () => {
        if(browser) {
            try {
                await window.navigator.clipboard.writeText(`${PUBLIC_APP_URL}`)
                alert("Copied URL to Clipboard")
            } catch(e: any) {
                alert(`Failed to copy text.${e?.message ? `\n\nError: ${e?.message}` : ""}`)
            }
        }
    }}>[click to copy]</a>)</Text>
        <Text>2. Log in with Twitch within the OBS browser dock</Text>
        <Text>3. Follow the instructions below to add the overlay source if you haven't done so</Text>
        <Text>4. Refresh the overlay browser source</Text>
    </Column>

    {/if}

    <HorizontalRule />
    {#if !connectionMessage.includes("Connecting")}

    <Text classList={["green"]} weight="bold">The Chat Overlay is a Browser Source</Text>
    <Text>Width: 500</Text>
    <Text>Height: 210</Text>
    <Text>URL: <a href="{PUBLIC_APP_URL}/overlay" target="_blank">{PUBLIC_APP_URL}/overlay</a></Text>
    <Button label="Copy URL to Clipboard" type="primary" onclick={async () => {
        if(browser) {
            try {
                await window.navigator.clipboard.writeText(`${PUBLIC_APP_URL}/overlay`)
                alert("Copied URL to Clipboard")
            } catch(e: any) {
                alert(`Failed to copy text.${e?.message ? `\n\nError: ${e?.message}` : ""}`)
            }
        }
    }} />

<HorizontalRule />
{/if}
</Column>
{:else}
<Column widthPx="fit" heightPx="fit" alignItems="flex-start" justifyContent="flex-start" marginBottomPx={20} textWrap={true} textAlign="left">
    <Heading size={6} classList={["green"]} weight="bold">Overlay Connected!</Heading>
</Column>
{/if}
<Row
        heightPx="fit"
        flexWrap={true}
        alignItems="flex-start"
        justifyContent="flex-start"
    >
        <Column
            heightPx="fit"
            alignItems="flex-start"
            justifyContent="flex-start"
            widthPx={250}
            textWrap={true}
            textAlign="left"
        >
            <Row heightPx="fit" justifyContent="flex-start" alignItems="center">
                
                <input
                    type="checkbox"
                    name="ignore-commands"
                    id="ignore-commands"
                    bind:checked={ignoreCommands}
                    onclick={async () => {
                        await toggleIgnoreCommands();
                    }}
                />
                <label for="ignore-commands"
                    >{ignoreCommands
                        ? "Ignoring Commands"
                        : "Ignore Commands?"}</label
                >
            </Row>
            <Text>
                <Markdown
                    content={ignoreCommands
                        ? "Currently ignoring chatbot commands (messages that begin with `!`)"
                        : "Ignores chatbot commands (messages that begin with `!`)"}
                />
            </Text>
        </Column>
        <HorizontalRule />
        <Column
            heightPx="fit"
            alignItems="flex-start"
            widthPx={250}
            textWrap={true}
            textAlign="left"
        >
            <Row heightPx="fit" justifyContent="flex-start" alignItems="center">
                <input
                    type="text"
                    name="ignore-user"
                    id="ignore-user"
                    bind:value={usernameToIgnore}
                />
                <Button
                    label={usernameInvalid ? "Invalid User" : "Ignore"}
                    type={usernameMessage !== ""
                        ? "primary"
                        : usernameToIgnore === ""
                          ? "secondary"
                          : "success"}
                    onclick={async () => {
                        if (usernameToIgnore !== "") {
                            await tryToIgnore(usernameToIgnore);
                        }
                    }}
                />
            </Row>
            <Text>
                <Text
                    >{usernameMessage !== ""
                        ? usernameMessage
                        : usernameToIgnore === ""
                          ? "Enter a username to prevent that user's messages from appearing"
                          : `Prevent ${usernameToIgnore}'s messages from appearing`}</Text
                >
            </Text>
            {#if !(ignoredUsers.some(i => AppConfig.known_chatbots.some(c => c.toLowerCase() === i.username.toLowerCase())))}
                <Button label="Ignore All Common Chatbots ({AppConfig.known_chatbots.length})" type="success" onclick={async () => {
                    AppConfig.known_chatbots.forEach(async c => {
                        if(!ignoredUsers.some(i => i.username === c)) {
                            usernameToIgnore = c;
                            await tryToIgnore(c)
                        }
                    })
                }} />
            {/if}
        </Column>
        <HorizontalRule />

        <Column
            heightPercent={100}
            alignItems="flex-start"
            justifyContent="flex-start"
            widthPx={250}
            textWrap={true}
            textAlign="left"
            gapEm={0.1}
        >
            <Heading size={6} weight="bold">
                Ignored Users {joined} ({ignoredUsers.length})
            </Heading>

            <ol>
                {#each ignoredUsers as ignored}
                    <!-- {#if ignoredUsers.indexOf(ignored) < 4} -->
                    <li>
                        <Row
                            widthPx="fit"
                            heightPx="fit"
                            alignItems="flex-start"
                            justifyContent="flex-start"
                            textAlign="left"
                            gapEm={0.33}
                        >
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <span
                                class="delete-ignored"
                                onclick={async () => {
                                    if (ignored && ignored.username && !deleting) {
                                        deleting = true;
                                        usernameToIgnore = ignored.username
                                        tryToIgnore(usernameToIgnore).then(() => {
                                            deleting = false;
                                        }).catch(e => {
                                            deleting = false;
                                        });
                                    }
                                }}
                            >
                                <Symbol
                                    name="delete"
                                    inheritColor={true}
                                    sizePx={16}
                                />
                            </span>
                            <Text classList={usernameToIgnore.toLowerCase() === ignored.username.toLowerCase() ? ["strike"] : []}>{ignored.username}</Text>
                        </Row>
                    </li>
                    <!-- {/if} -->
                {/each}
                <!-- {#if ignoredUsers.length - 5 > 0}
                            <Text classList={["yellow", "italic"]} weight="bold"
                                >{ignoredUsers.length - 4} more not shown...</Text
                            >
                        {/if} -->
            </ol>
        </Column>
    </Row>
    <!-- <Column heightPx="fit" alignItems="flex-start" marginLeftPx="auto" marginRightPx="auto" widthPercent={70} gapEm={0.66}>
    <Heading size={2} weight="bold">Chat Preview</Heading>
    <Text classList={["italic", joined !== null ? "green" : parted !== null ? "red" : "yellow"]}>{joined !== null ? `#${joined}` : parted !== null ? `Left #${parted}` : "Connecting to chat..."}
        {#if joined !== null}
        
        <a href="/overlay" target="_blank">&bullet; Click here for OBS Overlay</a>
        {/if}
        </Text>
        <Chat backgroundMode="theme" paddingPx={10} widthPx="fill" />
    </Column> -->
{:else}
    <Column
        justifyContent="flex-start"
        alignItems="center"
        gapEm={2}
        widthPercent={100}
        marginLeftPx="auto"
        marginRightPx="auto"
        // flexWrap={true}
    >
        <Heading size={2} weight="bold">Not Logged In</Heading>
        <Row
            justifyContent="center"
            alignItems="flex-start"
            gapEm={2}
            heightPx="fit"
            flexWrap={true}
            widthPercent={90}
        >
            {#if targetChannel}
                <!-- <Heading size={6} weight="bolder" classList={["green"]}
                >Are you {targetChannel}?</Heading
            >
            <Text weight="semibold" classList={["italic"]}
                >Log in using the Log In button above, <a href="/auth">or by clicking here</a></Text
            > -->
                <ButtonCard
                    title="Are you {targetChannel}?"
                    text="Log in with Twitch to start using the app."
                    symbol="co_present"
                    buttons={[
                        {
                            text: `Log In`,
                            type: "success",
                            href: `/login`,
                        },
                    ]}
                />
                <!-- </Column> -->
                <!-- <Column justifyContent="flex-start" alignItems="flex-start" gapEm={0.66}>
            <Heading size={6} weight="bolder" classList={["yellow"]}
                >Are you a Viewer?</Heading
            >
            <Text weight="semibold" classList={["italic"]}
                >There nothing for you here!</Text
            >
            <Button label="Watch {targetChannel} on Twitch" type="success" href="https://twitch.tv/{targetChannel}" /> -->
                <ButtonCard
                    title="Are you a Viewer?"
                    text="There's nothing for you here! Carry on..."
                    symbol="visibility"
                    buttons={[
                        {
                            text: `Watch ${targetChannel} on Twitch`,
                            type: "success",
                            href: `https://twitch.tv/${targetChannel}`,
                        },
                    ]}
                />
            {/if}
        </Row>
    </Column>
{/if}

<style>
    .delete-ignored {
        color: var(--red);
        cursor: pointer;
    }

    input[type="checkbox"] {
        appearance: none;
        cursor: pointer;
        width: 1.33em;
        height: 1.33em;
        background-color: var(--red);
        border: 2px solid var(--crust);
    }

    input[type="checkbox"]:checked {
        content: "h";
        background-color: var(--green);
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"><path fill="%23000" d="M9 19l-7-7 1.41-1.41L9 16.17l13.59-13.59L24 4l-15 15z"/></svg>');
        background-size: cover;
    }

    li {
        margin-left: -0.33em;
        margin-bottom: 0.1em;
    }
</style>
