export enum EventSubSubscriptionTypes {
    AUTOMOD_MESSAGE_HOLD = "automod.message.hold",
    AUTOMOD_MESSAGE_UPDATE = "automod.message.update",
    AUTOMOD_SETTINGS_UPDATE = "automod.settings.update",
    AUTOMOD_TERMS_UPDATE = "automod.terms.update",
    CHANNEL_BITS_USE = "channel.bits.use",
    CHANNEL_UPDATE = "channel.update",
    CHANNEL_FOLLOW = "channel.follow",
    CHANNEL_AD_BREAK_BEGIN = "channel.ad_break.begin",
    CHANNEL_CHAT_CLEAR = "channel.chat.clear",
    CHANNEL_CHAT_CLEAR_USER_MESSAGES = "channel.chat.clear_user_messages",
    CHANNEL_CHAT_MESSAGE = "channel.chat.message",
    CHANNEL_CHAT_MESSAGE_DELETE = "channel.chat.message_delete",
    CHANNEL_CHAT_NOTIFICATION = "channel.chat.notification",
    CHANNEL_CHAT_SETTINGS_UPDATE = "channel.chat_settings.update",
    CHANNEL_CHAT_USER_MESSAGE_HOLD = "channel.chat.user_message_hold",
    CHANNEL_CHAT_USER_MESSAGE_UPDATE = "channel.chat.user_message_update",
    CHANNEL_SHARED_CHAT_BEGIN = "channel.shared_chat.begin",
    CHANNEL_SHARED_CHAT_UPDATE = "channel.shared_chat.update",
    CHANNEL_SHARED_CHAT_END = "channel.shared_chat.end",
    CHANNEL_SUBSCRIBE = "channel.subscribe",
    CHANNEL_SUBSCRIPTION_END = "channel.subscription.end",
    CHANNEL_SUBSCRIPTION_GIFT = "channel.subscription.gift",
    CHANNEL_SUBSCRIPTION_MESSAGE = "channel.subscription.message",
    CHANNEL_CHEER = "channel.cheer",
    CHANNEL_RAID = "channel.raid",
    CHANNEL_BAN = "channel.ban",
    CHANNEL_UNBAN = "channel.unban",
    CHANNEL_UNBAN_REQUEST_CREATE = "channel.unban_request.create",
    CHANNEL_UNBAN_REQUEST_RESOLVE = "channel.unban_request.resolve",
    CHANNEL_MODERATE = "channel.moderate",
    CHANNEL_MODERATOR_ADD = "channel.moderator.add",
    CHANNEL_MODERATOR_REMOVE = "channel.moderator.remove",
    CHANNEL_GUEST_STAR_SESSION_BEGIN = "channel.guest_star_session.begin",
    CHANNEL_GUEST_STAR_SESSION_END = "channel.guest_star_session.end",
    CHANNEL_GUEST_STAR_GUEST_UPDATE = "channel.guest_star_guest.update",
    CHANNEL_GUEST_STAR_SETTINGS_UPDATE = "channel.guest_star_settings.update",
    CHANNEL_CHANNEL_POINTS_AUTOMATIC_REWARD_REDEMPTION_ADD = "channel.channel_points_automatic_reward_redemption.add",
    CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_ADD = "channel.channel_points_custom_reward.add",
    CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_UPDATE = "channel.channel_points_custom_reward.update",
    CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_REMOVE = "channel.channel_points_custom_reward.remove",
    CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_REDEMPTION_ADD = "channel.channel_points_custom_reward_redemption.add",
    CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_REDEMPTION_UPDATE = "channel.channel_points_custom_reward_redemption.update",
    CHANNEL_POLL_BEGIN = "channel.poll.begin",
    CHANNEL_POLL_PROGRESS = "channel.poll.progress",
    CHANNEL_POLL_END = "channel.poll.end",
    CHANNEL_PREDICTION_BEGIN = "channel.prediction.begin",
    CHANNEL_PREDICTION_PROGRESS = "channel.prediction.progress",
    CHANNEL_PREDICTION_LOCK = "channel.prediction.lock",
    CHANNEL_PREDICTION_END = "channel.prediction.end",
    CHANNEL_SUSPICIOUS_USER_MESSAGE = "channel.suspicious_user.message",
    CHANNEL_SUSPICIOUS_USER_UPDATE = "channel.suspicious_user.update",
    CHANNEL_VIP_ADD = "channel.vip.add",
    CHANNEL_VIP_REMOVE = "channel.vip.remove",
    CHANNEL_WARNING_ACKNOWLEDGE = "channel.warning.acknowledge",
    CHANNEL_WARNING_SEND = "channel.warning.send",
    CHANNEL_CHARITY_CAMPAIGN_DONATE = "channel.charity_campaign.donate",
    CHANNEL_CHARITY_CAMPAIGN_START = "channel.charity_campaign.start",
    CHANNEL_CHARITY_CAMPAIGN_PROGRESS = "channel.charity_campaign.progress",
    CHANNEL_CHARITY_CAMPAIGN_STOP = "channel.charity_campaign.stop",
    CONDUIT_SHARD_DISABLED = "conduit.shard.disabled",
    DROP_ENTITLEMENT_GRANT = "drop.entitlement.grant",
    EXTENSION_BITS_TRANSACTION_CREATE = "extension.bits_transaction.create",
    CHANNEL_GOAL_BEGIN = "channel.goal.begin",
    CHANNEL_GOAL_PROGRESS = "channel.goal.progress",
    CHANNEL_GOAL_END = "channel.goal.end",
    CHANNEL_HYPE_TRAIN_BEGIN = "channel.hype_train.begin",
    CHANNEL_HYPE_TRAIN_PROGRESS = "channel.hype_train.progress",
    CHANNEL_HYPE_TRAIN_END = "channel.hype_train.end",
    CHANNEL_SHIELD_MODE_BEGIN = "channel.shield_mode.begin",
    CHANNEL_SHIELD_MODE_END = "channel.shield_mode.end",
    CHANNEL_SHOUTOUT_CREATE = "channel.shoutout.create",
    CHANNEL_SHOUTOUT_RECEIVE = "channel.shoutout.receive",
    STREAM_ONLINE = "stream.online",
    STREAM_OFFLINE = "stream.offline",
    USER_AUTHORIZATION_GRANT = "user.authorization.grant",
    USER_AUTHORIZATION_REVOKE = "user.authorization.revoke",
    USER_UPDATE = "user.update",
    USER_WHISPER_MESSAGE = "user.whisper.message"
}

export const EventSubVersions: Record<EventSubSubscriptionTypes, string> = {
  [EventSubSubscriptionTypes.AUTOMOD_MESSAGE_HOLD]: "2",
  [EventSubSubscriptionTypes.AUTOMOD_MESSAGE_UPDATE]: "2",
  [EventSubSubscriptionTypes.AUTOMOD_SETTINGS_UPDATE]: "1",
  [EventSubSubscriptionTypes.AUTOMOD_TERMS_UPDATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_BITS_USE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_UPDATE]: "2",
  [EventSubSubscriptionTypes.CHANNEL_FOLLOW]: "2",
  [EventSubSubscriptionTypes.CHANNEL_AD_BREAK_BEGIN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_CLEAR]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_CLEAR_USER_MESSAGES]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_MESSAGE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_MESSAGE_DELETE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_NOTIFICATION]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_SETTINGS_UPDATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_USER_MESSAGE_HOLD]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHAT_USER_MESSAGE_UPDATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SHARED_CHAT_BEGIN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SHARED_CHAT_UPDATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SHARED_CHAT_END]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SUBSCRIBE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SUBSCRIPTION_END]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SUBSCRIPTION_GIFT]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SUBSCRIPTION_MESSAGE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHEER]: "1",
  [EventSubSubscriptionTypes.CHANNEL_RAID]: "1",
  [EventSubSubscriptionTypes.CHANNEL_BAN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_UNBAN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_UNBAN_REQUEST_CREATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_UNBAN_REQUEST_RESOLVE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_MODERATE]: "2",
  [EventSubSubscriptionTypes.CHANNEL_MODERATOR_ADD]: "1",
  [EventSubSubscriptionTypes.CHANNEL_MODERATOR_REMOVE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_GUEST_STAR_SESSION_BEGIN]: "beta",
  [EventSubSubscriptionTypes.CHANNEL_GUEST_STAR_SESSION_END]: "beta",
  [EventSubSubscriptionTypes.CHANNEL_GUEST_STAR_GUEST_UPDATE]: "beta",
  [EventSubSubscriptionTypes.CHANNEL_GUEST_STAR_SETTINGS_UPDATE]: "beta",
  [EventSubSubscriptionTypes.CHANNEL_CHANNEL_POINTS_AUTOMATIC_REWARD_REDEMPTION_ADD]: "2",
  [EventSubSubscriptionTypes.CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_ADD]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_UPDATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_REMOVE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_REDEMPTION_ADD]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHANNEL_POINTS_CUSTOM_REWARD_REDEMPTION_UPDATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_POLL_BEGIN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_POLL_PROGRESS]: "1",
  [EventSubSubscriptionTypes.CHANNEL_POLL_END]: "1",
  [EventSubSubscriptionTypes.CHANNEL_PREDICTION_BEGIN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_PREDICTION_PROGRESS]: "1",
  [EventSubSubscriptionTypes.CHANNEL_PREDICTION_LOCK]: "1",
  [EventSubSubscriptionTypes.CHANNEL_PREDICTION_END]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SUSPICIOUS_USER_MESSAGE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SUSPICIOUS_USER_UPDATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_VIP_ADD]: "1",
  [EventSubSubscriptionTypes.CHANNEL_VIP_REMOVE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_WARNING_ACKNOWLEDGE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_WARNING_SEND]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHARITY_CAMPAIGN_DONATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHARITY_CAMPAIGN_START]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHARITY_CAMPAIGN_PROGRESS]: "1",
  [EventSubSubscriptionTypes.CHANNEL_CHARITY_CAMPAIGN_STOP]: "1",
  [EventSubSubscriptionTypes.CONDUIT_SHARD_DISABLED]: "1",
  [EventSubSubscriptionTypes.DROP_ENTITLEMENT_GRANT]: "1",
  [EventSubSubscriptionTypes.EXTENSION_BITS_TRANSACTION_CREATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_GOAL_BEGIN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_GOAL_PROGRESS]: "1",
  [EventSubSubscriptionTypes.CHANNEL_GOAL_END]: "1",
  [EventSubSubscriptionTypes.CHANNEL_HYPE_TRAIN_BEGIN]: "2",
  [EventSubSubscriptionTypes.CHANNEL_HYPE_TRAIN_PROGRESS]: "2",
  [EventSubSubscriptionTypes.CHANNEL_HYPE_TRAIN_END]: "2",
  [EventSubSubscriptionTypes.CHANNEL_SHIELD_MODE_BEGIN]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SHIELD_MODE_END]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SHOUTOUT_CREATE]: "1",
  [EventSubSubscriptionTypes.CHANNEL_SHOUTOUT_RECEIVE]: "1",
  [EventSubSubscriptionTypes.STREAM_ONLINE]: "1",
  [EventSubSubscriptionTypes.STREAM_OFFLINE]: "1",
  [EventSubSubscriptionTypes.USER_AUTHORIZATION_GRANT]: "1",
  [EventSubSubscriptionTypes.USER_AUTHORIZATION_REVOKE]: "1",
  [EventSubSubscriptionTypes.USER_UPDATE]: "1",
  [EventSubSubscriptionTypes.USER_WHISPER_MESSAGE]: "1"
};

export enum EventSubMessages {
    WELCOME = "session_welcome"
}

export interface TwitchPacketMetadata {
    message_id: string;
    message_type: EventSubMessages;
    message_timestamp: string;
}

export interface TwitchPacket<T = any> {
    metadata: TwitchPacketMetadata;
    payload: T;
}

export interface TwitchWelcomePacketData {
    session: {
        id: string;
        status: string;
        connected_at: string;
        keepalive_timeout_seconds: number;
        reconnect_url: string | null;
    }
}

export interface Packets {
    unauthorized: {message: string};
    hello: {token?: string; user_id?: string; channel_name?: string;};
    heartbeat: {};
    chat: ChatPacket;
    authorized: {};
    chatclear: {};
    joined: {channel_name: string};
    parted: {channel_name: string};
}

export type Packet = {
    command: keyof Packets;
    data: any;
    id: number;
};

export interface ChatPacket {
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

export interface Listener {
    socket: WebSocket;
    channel_name: string;
    channel_id: string;
    user_id: string;
}