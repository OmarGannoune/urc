import React, {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {registerUser} from "./registerApi";
import {CustomError} from "../model/CustomError";
import {Button, Card, Form, Alert, Container} from "react-bootstrap";

export function Register() {

    const [error, setError] = useState(new CustomError(""));
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get('login') as string;
        const email = data.get('email') as string;
        const password = data.get('password') as string;

        if (!username || !email || !password) {
            setError(new CustomError("Tous les champs sont obligatoires"));
            return;
        }

        registerUser({username, email, password},
            () => setDone(true),
            (registerError: CustomError) => setError(registerError));
    };

    if (done) {
        return (
            <Container className="auth-page">
                <Card className="auth-card">
                    <Card.Body className="text-center">
                        <Card.Title>Inscription réussie</Card.Title>
                        <p>Votre compte a été créé, vous pouvez vous connecter.</p>
                        <Button variant="primary" onClick={() => navigate("/login")}>Aller à la connexion</Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="auth-page">
            <Card className="auth-card">
                <Card.Body>
                    <Card.Title className="text-center mb-4">Créer un compte</Card.Title>
                    {error.message &&
                        <Alert variant="danger">{error.message}</Alert>
                    }
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Login</Form.Label>
                            <Form.Control name="login" placeholder="votre login"/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control name="email" type="email" placeholder="votre@email.fr"/>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control name="password" type="password" placeholder="mot de passe"/>
                        </Form.Group>
                        <Button variant="success" type="submit" className="w-100">S'inscrire</Button>
                    </Form>
                    <div className="text-center mt-3">
                        <Link to="/login">Déjà un compte ? Se connecter</Link>
                    </div>
                </Card.Body>
            </Card>
        </Container>
    );
}
