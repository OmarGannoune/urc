import {getConnecterUser, triggerNotConnected} from "../lib/session";
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

function errorResponse(status, code, message) {
    return new Response(JSON.stringify({code, message}), {
        status,
        headers: {'content-type': 'application/json'},
    });
}

function userConversationKey(idA, idB) {
    const min = Math.min(Number(idA), Number(idB));
    const max = Math.max(Number(idA), Number(idB));
    return `conv:${min}:${max}`;
}

function roomConversationKey(roomId) {
    return `room:${roomId}`;
}

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
            let key;
            if (room_id !== undefined) {
                key = roomConversationKey(room_id);
            } else if (user_id !== undefined) {
                key = userConversationKey(user.id, user_id);
            } else {
                response.status(400).json({code: "MISSING_TARGET", message: "user_id ou room_id requis"});
                return;
            }
            const messages = await redis.lrange(key, 0, -1);
            response.status(200).json(messages);
            return;
        }

        if (request.method === "POST") {
            const {content, targetUserId, targetRoomId} = request.body;
            if (!content) {
                response.status(400).json({code: "MISSING_CONTENT", message: "Message vide"});
                return;
            }
            let key;
            if (targetRoomId !== undefined && targetRoomId !== null) {
                key = roomConversationKey(targetRoomId);
            } else if (targetUserId !== undefined && targetUserId !== null) {
                key = userConversationKey(user.id, targetUserId);
            } else {
                response.status(400).json({code: "MISSING_TARGET", message: "targetUserId ou targetRoomId requis"});
                return;
            }

            const message = {
                from: user.id,
                fromName: user.username,
                content: content,
                date: new Date().toISOString(),
            };
            await redis.lpush(key, message);
            await redis.expire(key, 86400);

            response.status(200).json({ok: true});
            return;
        }

        response.status(405).json({code: "METHOD_NOT_ALLOWED", message: "Méthode non supportée"});
    } catch (error) {
        console.log(error);
        response.status(500).json({code: "SERVER_ERROR", message: "Erreur serveur"});
    }
};
