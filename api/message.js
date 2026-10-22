import {getConnecterUser, triggerNotConnected} from "../lib/session";
import { Redis } from '@upstash/redis';
import {conversationKey, messageKey, parseReactions, sanitizeReply} from "../lib/conversation";

const redis = Redis.fromEnv();

export default async (request, response) => {
    try {
        const user = await getConnecterUser(request);
        if (user === undefined || user === null) {
            console.log("Not connected");
            triggerNotConnected(response);
            return;
        }

        if (request.method === "GET") {
            const {user_id, room_id} = request.query;
            if (room_id === undefined && user_id === undefined) {
                response.status(400).json({code: "MISSING_TARGET", message: "user_id ou room_id requis"});
                return;
            }
            const key = conversationKey({roomId: room_id, userIdA: user.id, userIdB: user_id});
            const messages = await redis.lrange(key, 0, -1);
            const allReactions = (await redis.hgetall(`react:${key}`)) ?? {};
            const enriched = messages.map((message) => ({
                ...message,
                id: messageKey(message),
                reactions: parseReactions(allReactions[messageKey(message)]),
            }));
            response.status(200).json(enriched);
            return;
        }

        if (request.method === "POST") {
            const {content, image, reply, targetUserId, targetRoomId} = request.body;
            if (!content && !image) {
                response.status(400).json({code: "MISSING_CONTENT", message: "Message vide"});
                return;
            }
            if (image && (!image.startsWith("https://") || !image.includes("blob.vercel-storage.com"))) {
                response.status(400).json({code: "BAD_IMAGE", message: "Image invalide"});
                return;
            }
            if (targetRoomId === undefined || targetRoomId === null) {
                if (targetUserId === undefined || targetUserId === null) {
                    response.status(400).json({code: "MISSING_TARGET", message: "targetUserId ou targetRoomId requis"});
                    return;
                }
            }
            const key = conversationKey({roomId: targetRoomId, userIdA: user.id, userIdB: targetUserId});

            const message = {
                id: crypto.randomUUID(),
                from: user.id,
                fromName: user.username,
                content: content ?? "",
                date: new Date().toISOString(),
                image: image ?? null,
                reply: sanitizeReply(reply),
            };
            await redis.lpush(key, message);
            await redis.expire(key, 86400);

            response.status(200).json({ok: true, id: message.id});
            return;
        }

        response.status(405).json({code: "METHOD_NOT_ALLOWED", message: "Méthode non supportée"});
    } catch (error) {
        console.log(error);
        response.status(500).json({code: "SERVER_ERROR", message: "Erreur serveur"});
    }
};
