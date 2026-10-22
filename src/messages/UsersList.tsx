import React from "react";
import {useNavigate, useParams} from "react-router-dom";
import {ListGroup} from "react-bootstrap";
import {useMessaging} from "../store/messaging";
import {useSession} from "../store/session";
import {Hash} from "@phosphor-icons/react";

export function UsersList() {
    const users = useMessaging((state) => state.users);
    const rooms = useMessaging((state) => state.rooms);
    const myId = useSession((state) => state.id);
    const navigate = useNavigate();
    const {type, id} = useParams();

    const others = users.filter((user) => user.user_id !== myId);

    const itemClass = (itemType: string, itemId: number) =>
        (type === itemType && Number(id) === itemId) ? "active-conversation" : "";

    const initials = (name: string) => name.slice(0, 2).toUpperCase();

    return (
        <div className="users-list">
            <h6 className="list-title">Salons</h6>
            <ListGroup>
                {rooms.map((room) => (
                    <ListGroup.Item
                        key={"room-" + room.room_id}
                        action
                        className={itemClass("room", room.room_id)}
                        onClick={() => navigate(`/messages/room/${room.room_id}`)}
                    >
                        <span className="avatar avatar-room"><Hash size={16} weight="fill"/></span>
                        <div className="list-item-info">
                            <div className="list-item-name">{room.name}</div>
                        </div>
                    </ListGroup.Item>
                ))}
            </ListGroup>

            <h6 className="list-title">Utilisateurs</h6>
            <ListGroup>
                {others.map((user) => (
                    <ListGroup.Item
                        key={"user-" + user.user_id}
                        action
                        className={itemClass("user", user.user_id)}
                        onClick={() => navigate(`/messages/user/${user.user_id}`)}
                    >
                        <span className="avatar">{initials(user.username)}</span>
                        <div className="list-item-info">
                            <div className="list-item-name">{user.username}</div>
                            {user.last_login &&
                                <div className="list-item-meta">vu le {user.last_login}</div>
                            }
                        </div>
                    </ListGroup.Item>
                ))}
                {others.length === 0 &&
                    <div className="empty-hint">Aucun autre utilisateur</div>
                }
            </ListGroup>
        </div>
    );
}
