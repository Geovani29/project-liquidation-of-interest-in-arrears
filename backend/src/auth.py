from __future__ import annotations

import functools
from dataclasses import dataclass
from typing import Callable, Dict

import requests
from flask import current_app, request, abort


ROBLES_BASE = "https://roble-api.openlab.uninorte.edu.co/auth"


@dataclass
class RobleTokens:
    access_token: str
    refresh_token: str


def roble_login(email: str, password: str) -> RobleTokens:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/login"
    res = requests.post(url, json={"email": email, "password": password}, timeout=15)
    if not (200 <= res.status_code < 300):
        abort(401, description="Credenciales inválidas")
    data = res.json()
    return RobleTokens(access_token=data.get("accessToken", ""), refresh_token=data.get("refreshToken", ""))


def roble_refresh(refresh_token: str) -> str:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/refresh-token"
    res = requests.post(url, json={"refreshToken": refresh_token}, timeout=15)
    if not (200 <= res.status_code < 300):
        abort(401, description="Refresh token inválido")
    return res.json().get("accessToken", "")


def roble_verify(access_token: str) -> Dict:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/verify-token"
    res = requests.get(url, headers={"Authorization": f"Bearer {access_token}"}, timeout=15)
    if not (200 <= res.status_code < 300):
        abort(401, description="Token inválido")
    return res.json()


def require_auth(view_func: Callable):
    @functools.wraps(view_func)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            abort(401, description="Falta token")
        token = auth_header.split(" ", 1)[1]
        roble_verify(token)
        return view_func(*args, **kwargs)

    return wrapper


# Signup y manejo de cuentas
def roble_signup(email: str, password: str, name: str) -> Dict:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/signup"
    res = requests.post(url, json={"email": email, "password": password, "name": name}, timeout=20)
    if not (200 <= res.status_code < 300):
        abort(res.status_code, description=res.text or "Error en signup")
    return res.json()


def roble_signup_direct(email: str, password: str, name: str) -> Dict:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/signup-direct"
    res = requests.post(url, json={"email": email, "password": password, "name": name}, timeout=20)
    if not (200 <= res.status_code < 300):
        abort(res.status_code, description=res.text or "Error en signup-direct")
    return res.json()


def roble_verify_email(email: str, code: str) -> Dict:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/verify-email"
    res = requests.post(url, json={"email": email, "code": code}, timeout=20)
    if not (200 <= res.status_code < 300):
        abort(res.status_code, description=res.text or "Error al verificar correo")
    return res.json()


def roble_forgot_password(email: str) -> Dict:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/forgot-password"
    res = requests.post(url, json={"email": email}, timeout=20)
    if not (200 <= res.status_code < 300):
        abort(res.status_code, description=res.text or "Error al solicitar recuperación")
    return res.json() if res.text else {"ok": True}


def roble_reset_password(token: str, new_password: str) -> Dict:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/reset-password"
    res = requests.post(url, json={"token": token, "newPassword": new_password}, timeout=20)
    if not (200 <= res.status_code < 300):
        abort(res.status_code, description=res.text or "Error al restablecer")
    return res.json() if res.text else {"ok": True}


def roble_logout(access_token: str) -> Dict:
    db_name = current_app.config["SETTINGS"].roble_db_name
    url = f"{ROBLES_BASE}/{db_name}/logout"
    res = requests.post(url, headers={"Authorization": f"Bearer {access_token}"}, timeout=15)
    if not (200 <= res.status_code < 300):
        abort(res.status_code, description=res.text or "Error al cerrar sesión")
    return res.json() if res.text else {"ok": True}


