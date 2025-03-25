"use client"

import { useState, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Collapse, Grid, Typography, Button, TextField } from "@mui/material"
import { confirmSignIn, signIn } from "aws-amplify/auth"

const Login = () => {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(true)
    const [userName, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [newConfirmedPassword, setNewConfirmedPassword] = useState("")
    const [changePasswordSuccess, setChangePasswordSuccess] = useState(false)
    const [newPasswordRequired, setNewPasswordRequired] = useState(false)

    const tryLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if (newPasswordRequired) {
                return await changeTemporaryPassword()
            }
            setLoading(true)
            const { nextStep } = await signIn({
                username: userName.toLowerCase(),
                password,
            })
            if (nextStep.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
                setNewPasswordRequired(true)
                setLoading(false)
                return
            }
            setLoading(false)
            router.push("/")
        } catch (err) {
            console.error("Login error:", err)
            setSuccess(false)
            setLoading(false)
        }
    }

    const changeTemporaryPassword = async () => {
        try {
            if (newPassword !== newConfirmedPassword) {
                return alert("Die Passwörter stimmen nicht überein!")
            }
            setLoading(true)
            const changePasswordRequest = await confirmSignIn({ challengeResponse: newPassword })
            if (!changePasswordRequest) {
                setSuccess(false)
                setLoading(false)
                return alert("Fehler beim Ändern des Passworts!")
            }
            setLoading(false)
            setChangePasswordSuccess(true)
            setNewPasswordRequired(false)
        } catch (err) {
            console.error("Change password error:", err)
            setSuccess(false)
            setLoading(false)
        }
    }

    return (
        <form onSubmit={tryLogin}>
            <Typography variant="h1">{newPasswordRequired ? "Temporäres Passwort ändern" : "Einloggen"}</Typography>
            <Collapse in={changePasswordSuccess}>
                <Grid container justifyContent="center" alignItems="center">
                   
                    <Typography>Passwort erfolgreich geändert!</Typography>
                </Grid>
            </Collapse>
            <TextField label="E-Mail-Adresse" value={userName} onChange={(e) => setUsername(e.target.value)} required fullWidth />
            <TextField label={newPasswordRequired ? "Temporäres Passwort" : "Passwort"} type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
            <Collapse in={newPasswordRequired}>
                <TextField label="Neues Passwort" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} fullWidth />
                <TextField label="Neues Passwort wiederholen" type="password" value={newConfirmedPassword} onChange={(e) => setNewConfirmedPassword(e.target.value)} fullWidth />
            </Collapse>
            {!newPasswordRequired && <Link href="/forgot-password">Passwort vergessen?</Link>}
            <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth>
                {newPasswordRequired ? "Passwort ändern" : "Einloggen"}
            </Button>
        </form>
    )
}

export default Login
