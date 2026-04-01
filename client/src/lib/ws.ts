import { browser } from "$app/environment";
import { PUBLIC_WS_URL } from "$env/static/public";
import { getUserData } from "duckylib";
import { writable } from "svelte/store";

interface WebsocketState {
    isAuthorized: boolean;
    isConnected: boolean;
    messages: any[];
    error: string | null;
}

let authorized = false;
let messageBuffer: any[] = [];
let flushInterval: ReturnType<typeof setInterval> | null = null;

const initialState: WebsocketState = {
    isAuthorized: false,
    isConnected: false,
    messages: [],
    error: null
};

export const socketStore = writable<WebsocketState>(initialState);

let socket: WebSocket | null = null;

export const initWebSocket = () => {
    if (!browser) return;

    const userData = getUserData();
    if (!userData?.id || !userData?.username) return;

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    socket = new WebSocket(PUBLIC_WS_URL);

    socket.onopen = () => {
        socketStore.update(state => ({ ...state, isConnected: true, error: null }));

        if (!flushInterval) {
            flushInterval = setInterval(() => {
                if (messageBuffer.length > 0) {
                    socketStore.update(state => ({
                        ...state,
                        messages: [...state.messages, ...messageBuffer].slice(-100)
                    }));
                    messageBuffer = [];
                }
            }, 250);
        }
    };

    socket.onmessage = (ev) => {
        try {
            const data = JSON.parse(ev.data);

            if (data.command) {
                if (data.command === "hello" && !authorized) {
                    socket?.send(JSON.stringify({
                        id: 0, command: "hello", data: {
                            user_id: userData.id,
                            channel_id: userData.id,
                            channel_name: userData.username
                        }
                    }));
                    authorized = true;
                    socketStore.update(state => ({ ...state, isAuthorized: true }));
                    return;
                }

                if (data.command !== "heartbeat") {
                    messageBuffer.push(data);
                }
            }
        } catch (e) {
            console.error(e);
        }
    };

    socket.onerror = (error) => {
        socketStore.update(state => ({ ...state, error: `WebSocket error occurred: ${error}` }));
    };

    socket.onclose = () => {
        socketStore.update(state => ({ ...state, isConnected: false, isAuthorized: false }));
        authorized = false;
        if (flushInterval) {
            clearInterval(flushInterval);
            flushInterval = null;
        }
    };
};

export const sendPacket = (command: string, data: any) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ id: 0, command, data }));
    }
};

export const closeWebSocket = () => {
    if (socket) {
        socket.close();
        socket = null;
    }
    if (flushInterval) {
        clearInterval(flushInterval);
        flushInterval = null;
    }
};