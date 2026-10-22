import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {loginUser} from "./loginApi";
import type {Session} from "../model/common";
import {CustomError} from "../model/CustomError";
import {useSession} from "../store/session";
import {Button, Card, Form, Alert, Container} from "react-bootstrap";
import {ChatTeardropText} from "@phosphor-icons/react";

export function Login() {

    const [error, setError] = useState(new CustomError(""));
    const setSession = useSession((state) => state.setSession);
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        loginUser({user_id: -1, username: data.get('login') as string, password: data.get('password') as string},
            (session: Session) => {
                setSession(session);
                navigate("/");
            }, (loginError: CustomError) => {
                setError(loginError);
            });
    };

    return (
        <Container className="auth-page">
            <Card className="auth-card">
                <Card.Body>
                    <div className="auth-logo">
                        <span className="logo-mark"><ChatTeardropText size={22} weight="fill"/></span>
                    </div>
                    <Card.Title className="text-center mb-1">UBO Relay Chat</Card.Title>
                    <p className="auth-subtitle text-center mb-4">Connectez-vous pour discuter</p>
                    {error.message &&
                        <Alert variant="danger">{error.message}</Alert>
                    }
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Login</Form.Label>
                            <Form.Control name="login" placeholder="votre login"/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control name="password" type="password" placeholder="mot de passe"/>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">Connexion</Button>
                    </Form>
                    <div className="text-center mt-3">
                        <Link to="/register" className="auth-link">Pas de compte ? S'inscrire</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
