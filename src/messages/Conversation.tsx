import React, {useEffect, useRef, useState} from "react";
import {Form, Button, InputGroup} from "react-bootstrap";
import {useMessaging} from "../store/messaging";
import {useSession} from "../store/session";
import {uploadImage} from "./messagesApi";

export function Conversation() {
    const selection = useMessaging((state) => state.selection);
    const messages = useMessaging((state) => state.messages);
    const users = useMessaging((state) => state.users);
    const rooms = useMessaging((state) => state.rooms);
    const myId = useSession((state) => state.id);
    const send = useMessaging((state) => state.send);
    const [content, setContent] = useState("");
    const [image, setImage] = useState<string | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement | null>(null);
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

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (file === undefined) {
            return;
        }
        setUploading(true);
        try {
            setImage(await uploadImage(file));
        } catch (error) {
            console.log(error);
            alert((error as Error).message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (content.trim() === "" && !image) {
            return;
        }
        send(content, image);
        setContent("");
        setImage(undefined);
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
                        {message.image &&
                            <a href={message.image} target="_blank" rel="noreferrer">
                                <img src={message.image} alt="image" className="message-image"/>
                            </a>
                        }
                        {message.content && <div className="message-content">{message.content}</div>}
                    </div>
                ))}
                <div ref={bottomRef}/>
            </div>

            {image &&
                <div className="image-preview">
                    <img src={image} alt="aperçu"/>
                    <Button size="sm" variant="outline-secondary" onClick={() => setImage(undefined)}>Retirer</Button>
                </div>
            }

            <Form onSubmit={handleSubmit} className="message-form">
                <InputGroup className="mb-2">
                    <Form.Control
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder="Message"
                    />
                    <Button
                        variant="outline-primary"
                        disabled={uploading}
                        onClick={() => fileRef.current?.click()}
                    >
                        {uploading ? "Envoi..." : "Image"}
                    </Button>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/png,image/jpeg,image/gif,image/webp"
                        hidden
                        onChange={handleFile}
                    />
                </InputGroup>
                <Button type="submit" variant="primary" className="w-100">Envoyer</Button>
            </Form>
        </div>
    );
}
