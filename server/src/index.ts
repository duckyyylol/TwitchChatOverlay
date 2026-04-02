import { configDotenv } from "dotenv"
import { join } from "path"
import { EventSubMessages, EventSubSubscriptionTypes, EventSubVersions, TwitchPacket, TwitchWelcomePacketData, Listener, Packet, Packets } from "./lib/types";
import { post } from "axios";
import { WebSocketServer } from "ws";
import express from "express";
import { createServer, IncomingMessage } from "http";
import { randomUUID } from "crypto";
import { ApiClient } from "@twurple/api";
import { StaticAuthProvider } from "@twurple/auth";
import { ChatClient, ChatMessage } from "@twurple/chat";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { parseCookie } from "cookie";

configDotenv({ quiet: true, path: join(process.cwd(), ".env") });

// const subscribeToEvent = async (event: EventSubSubscriptionTypes, condition: any) => {
//     if (!socketId) return console.log("Invalid Socket ID when subscribing to event", event);
//     if (!condition) return console.log("Invalid condition when subscribing to event", event, condition);
//     let eventSubHelixUrl = `${helixBaseUrl}/eventsub/subscriptions`
//     let res = await post(eventSubHelixUrl, {
//         type: event,
//         version: EventSubVersions[event],
//         condition,


//     })
// }

function createPacket<T extends keyof Packets>(command: T, data: Packets[T], id: number = 0) {
    return JSON.stringify({ command, data, id });
}

function broadcastChatClear(channelName: string) {
    let sentUserIds = [];
    let channelSockets: Listener[] = [];
    for (const listener of socketMap.entries()) {
        if (!channelSockets.find(s => listener[0] === `${s.user_id}-${s.channel_id}`) && (listener[1].channel_name === channelName)) channelSockets.push(listener[1]);
    }

    channelSockets.forEach((s: Listener) => {
        if(!sentUserIds.includes(s.user_id)) {
            s.socket.send(createPacket("chatclear", {}));
            sentUserIds.push(s.user_id);
        }
    })
}

function broadcastChannelJoin(channelName: string) {
    let sentUserIds = [];
    let channelSockets: Listener[] = [];
    for (const listener of socketMap.entries()) {
        if (!channelSockets.find(s => listener[0] === `${s.user_id}-${s.channel_id}`) && (listener[1].channel_name === channelName)) channelSockets.push(listener[1]);
    }

    channelSockets.forEach((s: Listener) => {
        if(!sentUserIds.includes(s.user_id)) {
            s.socket.send(createPacket("joined", {channel_name: channelName}));
            sentUserIds.push(s.user_id);
        }
    })
}

function broadcastChannelPart(channelName: string) {
    let sentUserIds = [];
    let channelSockets: Listener[] = [];
    for (const listener of socketMap.entries()) {
        if (!channelSockets.find(s => listener[0] === `${s.user_id}-${s.channel_id}`) && (listener[1].channel_name === channelName)) channelSockets.push(listener[1]);
    }

    channelSockets.forEach((s: Listener) => {
        if(!sentUserIds.includes(s.user_id)) {
            s.socket.send(createPacket("parted", {channel_name: channelName}));
            sentUserIds.push(s.user_id);
        }
    })
}

function broadcastChat(channelName: string, message: ChatMessage) {
    console.log(`[${channelName}/${message.userInfo.userName}(${message.userInfo.userId})] ${message.text}`)
    let channelSockets: Listener[] = [];
    for (const listener of socketMap.entries()) {
        if (!channelSockets.find(s => listener[0] === `${s.user_id}-${s.channel_id}`) && (listener[1].channel_name === channelName)) channelSockets.push(listener[1]);
    }

    let user = message.userInfo;

    console.log(user.badges)

    let badges: Record<string, string> = {};

    for (const badge of user.badges.entries()) {
        badges[badge[0]] = badge[1];
    }


    let emojis: Record<string, string> = {};
    if (message.emoteOffsets.size > 0) {
        message.emoteOffsets.forEach((v, k) => {
            const emoji_url = `https://static-cdn.jtvnw.net/emoticons/v2/${k}/default/dark/1.0`
            // emojis[v.join("")] = emoji_url;
            v.forEach(range => {
                emojis[range] = emoji_url;
            })
        })
    }

    let chatPacket = createPacket("chat", {
        content: message.text,
        bits: message.bits,
        channelId: message.channelId,
        date: message.date,
        emoteOffsets: emojis,
        isCheer: message.isCheer,
        isFirst: message.isFirst,
        isHighlighted: message.isHighlight,
        isHypeChat: message.isHypeChat,
        isRedemption: message.isRedemption,
        isReply: message.isReply,
        isReturningChatter: message.isReturningChatter,
        messageId: message.id,
        threadMessageUserId: message.threadMessageUserId,

        hypeChatAmount: message.hypeChatAmount || null,
        hypeChatCurrency: message.hypeChatCurrency || null,
        hypeChatIsSystemMessage: message.hypeChatIsSystemMessage || null,
        hypeChatLevel: message.hypeChatLevel || null,
        hypeChatLocalizedAmount: message.hypeChatLocalizedAmount || null,

        parentMessageId: message.parentMessageId || null,
        parentMessageText: message.parentMessageText || null,
        parentMessageUserDisplayName: message.parentMessageUserDisplayName || null,
        parentMessageUserId: message.parentMessageUserId || null,
        parentMessageUserName: message.parentMessageUserName || null,

        rewardId: message.rewardId || null,
        threadMessageId: message.threadMessageId || null,


        userInfo: {
            type: user.userType as any || 'default',
            badgeInfo: badges,
            badges: badges,
            color: user.color,
            display_name: user.displayName,
            isArtist: user.isArtist,
            isBroadcaster: user.isBroadcaster,
            isFounder: user.isFounder,
            isLeadMod: user.isLeadMod,
            isMod: user.isMod,
            isSubscriber: user.isSubscriber,
            isVip: user.isVip,
            login: user.userName,
            userId: user.userId
        }
    });

    let sentUserIds = [];

    channelSockets.forEach((s: Listener) => {
        if(!sentUserIds.includes(s.user_id)) {
            s.socket.send(chatPacket);
            sentUserIds.push(s.user_id);
        }
    })


}

const PORT = process.env.PORT || 3000;
if (!process.env.WSS_PATH) throw new Error("WSS_PATH is not set");


const app = express();

app.use(express.json());

const server = createServer(app);

const wss = new WebSocketServer({ server: server, path: process.env.WSS_PATH });
const socketMap: Map<string, Listener> = new Map<string, Listener>();

let eventsub: EventSubWsListener;
let chatClient: ChatClient;

let dev = false;
let devChannel = "caedrel";
let currentUsername = null;

async function addChatClientEvents(c: ChatClient) {
    c.onJoin((channel, user) => {
        console.log(`[${user}] JOINED ${channel}`)
        broadcastChannelJoin(channel);
    })

    c.onPart((ch, user) => {
        console.log(`[${user}] LEFT ${ch}`);
        broadcastChannelPart(ch);
    })

    c.onMessage(async (channel, username, content, message: ChatMessage) => {
        console.log(message.userInfo.badgeInfo)
        if(channel.toLowerCase() !== devChannel) broadcastChat(channel, message)
        if(channel.toLowerCase() === devChannel) {
            if(currentUsername !== null) c.say(currentUsername, content)
        }
    })

    c.onRitual((channel, user, ritual, message) => {
        console.log(ritual.ritualName, ritual.message)
    })

    c.onChatClear(async (channel) => {
        broadcastChatClear(channel);
    })
}


async function initEventSub(token: string, userId: string, broadcasterId: string): Promise<boolean> {
    try {
        let authProvider = new StaticAuthProvider(process.env.CLIENT_ID as string, token, [
        'user:read:follows',
        'user:read:chat',
        'channel:bot',
        'chat:read'
    ])
        let apiClient = new ApiClient({ authProvider });

        let apiBroadcaster = await apiClient.users.getUserById(broadcasterId);

        console.log("BROADCASTER", apiBroadcaster)


        eventsub = new EventSubWsListener({ apiClient })
        chatClient = new ChatClient({ authProvider, channels: dev ? [apiBroadcaster.name, devChannel] : [
            apiBroadcaster.name
        ] });
        currentUsername = apiBroadcaster.name

        if(!chatClient?.isConnected) await addChatClientEvents(chatClient)

        if(!chatClient?.isConnected) chatClient.connect()
        // await chatClient.join(apiBroadcaster.name);
        eventsub.start();

        return true;
    } catch (e) {
        console.log(e)
        return false;
    }
}


wss.on("connection", (socket: WebSocket, req: IncomingMessage) => {
    socketMap.clear();
    if(chatClient) {
        try {

            chatClient.quit();
            console.log(`Dropped old chat client for new connection`)
        } catch(e){console.log("Failed to quit chat client")}
    }
    if(eventsub) {
        try {

            eventsub.stop();
            console.log(`Dropped old eventsub instance for new connection`)
        } catch(e){console.log("Failed to quit eventsub instance")}
    }

    const cookies = parseCookie(req.headers.cookie || '')
    let heartbeat: NodeJS.Timeout;
    let socketId: string;
    let authorized: boolean = false;
    let channelName: string;

    socket.send(createPacket("hello", {}));

    socket.onclose = async () => {
        console.log(`[WEBSOCKET] Socket ID ${socketId} closed`)
        clearInterval(heartbeat);
        authorized = false;
        if (eventsub) eventsub.stop()
        if (chatClient && channelName) chatClient.part(
            channelName
        )
        if(chatClient) chatClient.quit();

        socketMap.clear()
        socketId = null;

        // eventsub = null;
        // chatClient = null;
        // channelName = null;

        // console.log()
    }

    socket.onmessage = async ({ data }) => {
        const tokenCookie = cookies['token-0'] || null;
        console.log("token", tokenCookie)
        const packet = JSON.parse(data.toString()) as Packet;

        switch (packet.command) {
            case "hello": {
                if (!tokenCookie) {
                    authorized = false;
                    socket.send(createPacket("unauthorized", { message: "You are not authorized to use this endpoint." }))
                    socket.close();

                    return;
                } else if (!packet.data.user_id) {
                    authorized = false;
                    socket.send(createPacket("unauthorized", { message: "Invalid User ID. You are not authorized to use this endpoint." }))
                    socket.close();

                    return;
                }
                else if (!packet.data.channel_name) {
                    authorized = false;
                    socket.send(createPacket("unauthorized", { message: "Invalid Channel Name. You are not authorized to use this endpoint." }))
                    socket.close();

                    return;
                } else if (!packet.data.channel_id) {
                    authorized = false;
                    socket.send(createPacket("unauthorized", { message: "Invalid Channel ID. You are not authorized to use this endpoint." }))
                    socket.close();

                    return;
                } else {
                    let id = `${packet.data.user_id}-${packet.data.channel_id}`;

                    if(socketMap.has(id)) {
                        try {
                            if(chatClient) chatClient.part(packet.data.channel_name);
                        }catch(e){}
                        console.log(`Deleted listener ID ${id}`)
                    }
                    
                    let initSuccessful = await initEventSub(tokenCookie, packet.data.user_id, packet.data.channel_id);
                    if (!initSuccessful) {
                        socket.send(createPacket("unauthorized", { message: "Invalid Token." }))
                        socket.close();
                        
                        return;
                    } else {
                        socketMap.clear();
                        
                        socketId = id;

                        if(socketMap.has(socketId)) socketMap.delete(socketId);

                        authorized = true;
                        socketMap.set(socketId, {
                            socket,
                            channel_name: packet.data.channel_name,
                            channel_id: packet.data.channel_id,
                            user_id: packet.data.user_id
                        });

                        

                        console.log(`[WEBSOCKET] Socket ID ${socketId} is now listening to events`)
                        heartbeat = setInterval(() => {
                            socket.send(createPacket("heartbeat", {}));
                        }, 3e3)
                        channelName = packet.data.channel_name;
                        socket.send(createPacket("authorized", {}))

                    }
                }

                break;
            }
        }
    }
})



app.get("/ws", async (req, res) => { });

app.get("/ws/ping", async (req, res) => {
    res.send({is: (chatClient && chatClient.isConnected) ? true : false})
})

app.get("/auth", async (req, res) => {

})

try {
    server.listen(PORT)
    console.log(`Server listening on port ${PORT} (wss path ${process.env.WSS_PATH})`)
} catch (e) {
        console.log(`Server failed to connect on port ${PORT} (wss path ${process.env.WSS_PATH})`, e)
}