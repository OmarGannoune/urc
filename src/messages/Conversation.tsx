import React, {useEffect, useRef, useState} from "react";
import {Form, Button, InputGroup} from "react-bootstrap";
import {useMessaging} from "../store/messaging";
import {useSession} from "../store/session";

export function Conversation() {
    const selection = useMessaging((state) => state.selection);
    const messages = useMessaging((state) => state.messages);
    const users = useMessaging((state) => state.users);
    const rooms = useMessaging((state) => state.rooms);
    const myId = useSession((state) => state.id);
    const send = useMessaging((state) => state.send);
    const [content, setContent] = useState("");
    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: "smooth"});
    }, [messages]);

    if (selection === null) {
        return <p className="text-muted text-center mt-5">Choisissez une conversation à gauche</p>;
    }

    const title = selection.type === "room"
        ? "# " + (rooms.find((room) => room.room_id === selection.id)?.name ?? "")
        : (users.find((user) => user.user_id === selection.id)?.username ?? "");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        send(content);
        setContent("");
    };

    return (
        <div className="conversation">
            <h5 className="conversation-title">{title}</h5>

            <div className="message-list">
                {messages.length === 0 &&
                    <p className="text-muted text-center mt-3">Aucun message</p>
                }
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={"message " + (message.from === myId ? "message-sent" : "message-received")}
                    >
                        <div className="message-meta">
                            {message.fromName} · {new Date(message.date).toLocaleString()}
                        </div>
                        <div className="message-content">{message.content}</div>
                    </div>
                ))}
                <div ref={bottomRef}/>
            </div>

            <Form onSubmit={handleSubmit} className="message-form">
                <InputGroup>
                    <Form.Control
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Écrire un message..."
                    />
                    <Button type="submit" variant="primary">Envoyer</Button>
                </InputGroup>
            </Form>
        </div>
    );
}
