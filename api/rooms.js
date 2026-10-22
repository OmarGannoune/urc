import { sql } from "@vercel/postgres";
import {checkSession, unauthorizedResponse} from "../lib/session";

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    try {
        const connected = await checkSession(request);
        if (!connected) {
            console.log("Not connected");
            return unauthorizedResponse();
        }

        const {rowCount, rows} = await sql`select room_id, name, TO_CHAR(created_on, 'DD/MM/YYYY HH24:MI') as created_on from rooms order by room_id`;
        console.log("Got " + rowCount + " rooms");
        return new Response(JSON.stringify(rows), {
            status: 200,
            headers: {'content-type': 'application/json'},
        });
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify(error), {
            status: 500,
            headers: {'content-type': 'application/json'},
        });
    }
};
