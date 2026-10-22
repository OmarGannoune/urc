import React, {useEffect} from "react";
import {Container, Row, Col, Alert, Navbar, Button} from "react-bootstrap";
import {useParams, Navigate, useNavigate, Link} from "react-router-dom";
import {useMessaging} from "../store/messaging";
import type {Selection} from "../store/messaging";
import {useSession} from "../store/session";
import {UsersList} from "./UsersList";
import {Conversation} from "./Conversation";
import {ChatTeardropText, SignOut} from "@phosphor-icons/react";

export function Messages() {
    const {type, id} = useParams();
    const token = useSession((state) => state.token);
    const username = useSession((state) => state.username);
    const clearSession = useSession((state) => state.clearSession);
    const navigate = useNavigate();
    const selection = useMessaging((state) => state.selection);
    const error = useMessaging((state) => state.error);
    const select = useMessaging((state) => state.select);
    const clearSelection = useMessaging((state) => state.clearSelection);
    const loadUsers = useMessaging((state) => state.loadUsers);
    const loadRooms = useMessaging((state) => state.loadRooms);
    const refreshMessages = useMessaging((state) => state.refreshMessages);

    useEffect(() => {
        if (token) {
            loadUsers();
            loadRooms();
        }
    }, [token, loadUsers, loadRooms]);
 
    useEffect(() => {
        if (!token) {
            return;
        }
        if ((type === "user" || type === "room") && id !== undefined) {
            const next: Selection = {type, id: Number(id)};
            if (selection === null || selection.type !== next.type || selection.id !== next.id) {
                select(next);
            }
        } else {
            clearSelection();
        } 
    }, [type, id]);
 
    useEffect(() => {
        if (selection === null) {
            return;
        }
        const interval = window.setInterval(refreshMessages, 4000);
        return () => window.clearInterval(interval);
    }, [selection, refreshMessages]);
 
    useEffect(() => {
        const sw = navigator.serviceWorker;
        if (sw != null) {
            sw.onmessage = () => {
                console.log("notification reçue, rafraîchissement des messages");
                refreshMessages();
            };
        }
        return () => {
            if (sw != null) {
                sw.onmessage = null;
            }
        };
    }, [refreshMessages]);

    if (!token) {
        return <Navigate to="/login" replace/>;
    }

    const logout = () => {
        clearSession();
        navigate("/login");
    };

    return (
        <div className="messages-page">
            <Navbar className="messages-header" expand="sm">
                <Navbar.Brand as={Link} to="/" className="messages-brand">
                    <span className="logo-mark logo-mark-sm"><ChatTeardropText size={16} weight="fill"/></span>
                    UBO Relay Chat
                </Navbar.Brand>
                <div className="messages-header-right">
                    <span className="messages-user">{username}</span>
                    <Button size="sm" variant="outline-danger" onClick={logout}>
                        <SignOut size={15}/> Se déconnecter
                    </Button>
                </div>
            </Navbar>
            <Container fluid className="messages-body">
                <Row className="h-100">
                    <Col xs={12} md={4} lg={3} className="users-col">
                        <UsersList/>
                    </Col>
                    <Col xs={12} md={8} lg={9} className="conversation-col">
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Conversation/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}
