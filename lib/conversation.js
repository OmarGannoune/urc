export function userConversationKey(idA, idB) {
    const min = Math.min(Number(idA), Number(idB));
    const max = Math.max(Number(idA), Number(idB));
    return `conv:${min}:${max}`;
}

export function roomConversationKey(roomId) {
    return `room:${roomId}`;
}

export function conversationKey(target) {
    if (target.roomId !== undefined && target.roomId !== null) {
        return roomConversationKey(target.roomId);
    }
    return userConversationKey(target.userIdA, target.userIdB);
}

/* clé stable d'un message (les anciens n'ont pas d'id) */
export function messageKey(message) {
    return message.id ?? `${message.from}-${message.date}`;
}

export function parseReactions(value) {
    if (value === undefined || value === null || value === "") {
        return {};
    }
    if (typeof value === "object") {
        return value;
    }
    try {
        const parsed = JSON.parse(value);
        return typeof parsed === "object" && parsed !== null ? parsed : {};
    } catch (error) {
        return {};
    }
}

export function sanitizeReply(reply) {
    if (reply === undefined || reply === null || typeof reply !== "object") {
        return null;
    }
    const from = Number(reply.from);
    const date = String(reply.date ?? "");
    const fromName = String(reply.fromName ?? "").slice(0, 50);
    if (!Number.isFinite(from) || date === "" || fromName === "") {
        return null;
    }
    let id = typeof reply.id === "string" && reply.id.length <= 64 ? reply.id : "";
    if (id === "") {
        id = `${from}-${date}`;
    }
    return {
        id: id,
        from: from,
        fromName: fromName,
        content: String(reply.content ?? "").slice(0, 200),
        date: date,
        image: typeof reply.image === "string" ? reply.image : null,
    };
}
