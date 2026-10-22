import {getConnecterUser, triggerNotConnected} from "../lib/session";
import { Redis } from '@upstash/redis';
import {conversationKey, parseReactions} from "../lib/conversation";

const redis = Redis.fromEnv();

const ALLOWED = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export default async (request, response) => {
    try {
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
            return;
        }

        if (request.method !== "POST") {
            response.status(405).json({code: "METHOD_NOT_ALLOWED", message: "Méthode non supportée"});
            return;
        }

        const {messageId, emoji, targetUserId, targetRoomId} = request.body;
        if (typeof messageId !== "string" || messageId === "" || messageId.length > 100) {
            response.status(400).json({code: "BAD_MESSAGE", message: "Message invalide"});
            return;
        }
        if (!ALLOWED.includes(emoji)) {
            response.status(400).json({code: "BAD_EMOJI", message: "Emoji non supporté"});
            return;
        }
        if ((targetRoomId === undefined || targetRoomId === null)
            && (targetUserId === undefined || targetUserId === null)) {
            response.status(400).json({code: "MISSING_TARGET", message: "targetUserId ou targetRoomId requis"});
            return;
        }

        const key = conversationKey({roomId: targetRoomId, userIdA: user.id, userIdB: targetUserId});
        const hashKey = `react:${key}`;

        const all = (await redis.hgetall(hashKey)) ?? {};
        const reactions = parseReactions(all[messageId]);

        const users = Array.isArray(reactions[emoji]) ? reactions[emoji] : [];
        const index = users.findIndex((id) => Number(id) === Number(user.id));
        let reacted;
        if (index >= 0) {
            users.splice(index, 1);
            reacted = false;
        } else {
            users.push(Number(user.id));
            reacted = true;
        }

        if (users.length > 0) {
            reactions[emoji] = users;
        } else {
            delete reactions[emoji];
        }

        await redis.hset(hashKey, {[messageId]: JSON.stringify(reactions)});
        await redis.expire(hashKey, 86400);

        response.status(200).json({ok: true, reacted, reactions});
    } catch (error) {
        console.log(error);
        response.status(500).json({code: "SERVER_ERROR", message: "Erreur serveur"});
    }
};
