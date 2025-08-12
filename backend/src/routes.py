from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from flask import Blueprint, abort, current_app, jsonify, request, send_file

from .auth import (
    require_auth,
    roble_login,
    roble_signup,
    roble_signup_direct,
    roble_verify_email,
    roble_forgot_password,
    roble_reset_password,
    roble_logout,
)
from .domain import parse_date, generate_tramos
from .excel import build_excel


api_bp = Blueprint("api", __name__)


def _validate_payload(data: Dict[str, Any]) -> Dict[str, Any]:
    required = ["fechaInicial", "fechaCorte", "capitalBase", "tasaMensual"]
    for key in required:
        if key not in data:
            abort(400, description=f"Falta campo: {key}")

    try:
        start = parse_date(str(data["fechaInicial"]))
        end = parse_date(str(data["fechaCorte"]))
    except Exception:
        abort(400, description="Formato de fecha inválido. Use dd/mm/aaaa")

    if start > end:
        abort(400, description="fechaInicial no puede ser mayor que fechaCorte")

    try:
        base = float(data["capitalBase"])
        tasa = float(data["tasaMensual"])
    except Exception:
        abort(400, description="capitalBase y tasaMensual deben ser numéricos")

    if base <= 0:
        abort(400, description="capitalBase debe ser > 0")
    if tasa < 0:
        abort(400, description="tasaMensual debe ser >= 0")

    vencimiento = None
    if data.get("fechaVencimiento"):
        try:
            vencimiento = parse_date(str(data["fechaVencimiento"]))
        except Exception:
            abort(400, description="fechaVencimiento inválida")
        if not (start < vencimiento <= end):
            abort(400, description="fechaVencimiento debe estar entre fechaInicial (exclusivo) y fechaCorte (inclusive)")

    return {
        "start": start,
        "end": end,
        "base": base,
        "tasa": tasa,
        "vencimiento": vencimiento,
    }


@api_bp.post("/auth/login")
def auth_login():
    data = request.get_json(force=True) or {}
    email = str(data.get("email", "")).strip()
    password = str(data.get("password", ""))
    if not email or not password:
        abort(400, description="email y password son requeridos")
    tokens = roble_login(email, password)
    return jsonify({"accessToken": tokens.access_token, "refreshToken": tokens.refresh_token})


@api_bp.post("/auth/signup")
def auth_signup():
    data = request.get_json(force=True) or {}
    email = str(data.get("email", "")).strip()
    password = str(data.get("password", ""))
    name = str(data.get("name", "")).strip()
    if not email or not password or not name:
        abort(400, description="email, password y name son requeridos")
    res = roble_signup(email, password, name)
    return jsonify(res)


@api_bp.post("/auth/signup-direct")
def auth_signup_direct():
    data = request.get_json(force=True) or {}
    email = str(data.get("email", "")).strip()
    password = str(data.get("password", ""))
    name = str(data.get("name", "")).strip()
    if not email or not password or not name:
        abort(400, description="email, password y name son requeridos")
    res = roble_signup_direct(email, password, name)
    return jsonify(res)


@api_bp.post("/auth/verify-email")
def auth_verify_email():
    data = request.get_json(force=True) or {}
    email = str(data.get("email", "")).strip()
    code = str(data.get("code", "")).strip()
    if not email or not code:
        abort(400, description="email y code son requeridos")
    res = roble_verify_email(email, code)
    return jsonify(res)


@api_bp.post("/auth/forgot-password")
def auth_forgot_password():
    data = request.get_json(force=True) or {}
    email = str(data.get("email", "")).strip()
    if not email:
        abort(400, description="email es requerido")
    res = roble_forgot_password(email)
    return jsonify(res)


@api_bp.post("/auth/reset-password")
def auth_reset_password():
    data = request.get_json(force=True) or {}
    token = str(data.get("token", "")).strip()
    new_password = str(data.get("newPassword", ""))
    if not token or not new_password:
        abort(400, description="token y newPassword son requeridos")
    res = roble_reset_password(token, new_password)
    return jsonify(res)


@api_bp.post("/auth/logout")
@require_auth
def auth_logout():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.split(" ", 1)[1]
    res = roble_logout(token)
    return jsonify(res)


@api_bp.post("/calculate")
@require_auth
def api_calculate():
    data = request.get_json(force=True) or {}
    payload = _validate_payload(data)
    result = generate_tramos(payload["start"], payload["end"], payload["base"], payload["tasa"], payload["vencimiento"])
    return jsonify(result)


@api_bp.post("/export")
@require_auth
def api_export():
    data = request.get_json(force=True) or {}
    payload = _validate_payload(data)
    result = generate_tramos(payload["start"], payload["end"], payload["base"], payload["tasa"], payload["vencimiento"])
    stream = build_excel(result)
    filename = f"liquidacion_{payload['start'].strftime('%Y%m%d')}_{payload['end'].strftime('%Y%m%d')}.xlsx"
    return send_file(
        stream,
        as_attachment=True,
        download_name=filename,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )


