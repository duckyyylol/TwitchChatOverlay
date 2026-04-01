// App API Types

export interface ApiError {
    message: string;
}

export interface ApiResponse<T = any> {
    v: number;
    for?: string;

    data: T;
    error?: ApiError;
    status?: number;
}

export interface DBBadge {
    id: string;
    channel_id?: string;
    badge_id: string;
    set_id: string;
    url: string;
}

export interface DBAppConfig {
    id: string;
    ignore_commands: boolean;
}

// Twitch API Types

export enum TwitchBroadcasterTypes {
    AFFILIATE = "affiliate",
    PARTNER = "partner",
    DEFAULT = ""
}

export enum TwitchUserTypes {
    ADMIN = "admin",
    GLOBAL_MOD = "global_mod",
    STAFF = "staff",
    DEFAULT = ""
}

export interface TwitchPaginatedResponse<T> {
    total: number;
    data: T[];
    pagination: {
        cursor: string;
    }
}

export interface TwitchArrayResponse<T> {
    data: T[];
}

export interface TwitchUserQueryResponse {
    data: TwitchUser[];
}

export interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type: TwitchBroadcasterTypes;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    created_at: string;
    view_count?: number;
}

export interface TwitchFollowedChannel {
    broadcaster_id: string;
    broadcaster_login: string;
    broadcaster_name: string;
    followed_at: string;
}

// Websocket

export interface Packets {
    hello: { userId: string; };
    unauthorized: { error?: string };
    ready: {};
}

export type Packet = {
    command: keyof Packets;
    data: any;
    id: number;
};

export interface TwitchChatPacket {
    content: string;
    date: Date;
    messageId: string;
    channelId: string;

    isHighlighted: boolean;
    isFirst: boolean;
    isCheer: boolean;
    isRedemption: boolean;
    isHypeChat: boolean;
    isReply: boolean;
    isReturningChatter: boolean;


    bits: number;

    emoteOffsets: Record<string, string>;

    hypeChatAmount?: number | null;
    hypeChatCurrency?: string | null;
    hypeChatIsSystemMessage?: boolean | null;
    hypeChatLevel?: number | null;
    hypeChatLocalizedAmount?: number | null;

    parentMessageId?: string | null;
    parentMessageText?: string | null;
    parentMessageUserDisplayName?: string | null;
    parentMessageUserId?: string | null;
    parentMessageUserName?: string | null;

    rewardId?: string | null;
    threadMessageId?: string | null;
    threadMessageUserId: string | null;

    userInfo: {
        badgeInfo: Record<string, string>;
        badges: Record<string, string>;
        display_name: string;
        login: string;
        type: 'mod' | 'global_mod' | 'admin' | 'staff' | 'default';

        isArtist: boolean;
        isMod: boolean;
        isLeadMod: boolean;
        isBroadcaster: boolean;
        isFounder: boolean;
        isSubscriber: boolean;
        isVip: boolean;

        color: string | null;
        userId: string;
    }
}

export interface TwitchGlobalBadge {
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
    title: string;
    description: string;
    click_action: string;
    click_url: string;
}

export interface TwitchGlobalBadgeSet {
    set_id: string;
    versions: TwitchGlobalBadge[];
}

export enum SevenTVPlatform {
    TWITCH = "TWITCH",
    DISCORD = "DISCORD",
}

export interface SevenTVEmoteHost {
    name: string;
    static_name: string;
    width: number;
    height: number;
    frame_count: number;
    size: number;
    format: string;
}

export interface SevenTVConnection {
    id: string;
    platform: SevenTVPlatform;
    username: string;
    display_name: string;
    linked_at: number;
    emote_capacity: number;
    emote_set_id: string;
}
export interface SevenTVUser {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
    style: {
        paint_id: string;
    }
    role_ids: string[];
    connections: SevenTVConnection[];
};


export interface SevenTVEmote {
    id: string;
    name: string;
    flags: number;
    timestamp: number;
    actor_id: string;
    data: {
        id: string;
        name: string;
        flags: number;
        lifecycle: number
        state: string[];
        listed: boolean;
        animated: boolean;
        owner: SevenTVUser;
        host: {
            url: string;
            files: SevenTVEmoteHost[];
        };
    };
    origin_id: string | null;
}