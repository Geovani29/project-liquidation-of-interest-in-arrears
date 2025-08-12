from __future__ import annotations

from flask import Flask, jsonify
from flask_cors import CORS

from .config import Settings
from .routes import api_bp


def create_app(settings: Settings | None = None) -> Flask:
    settings = settings or Settings.from_env()

    app = Flask(__name__)

    # CORS
    cors_kwargs = {}
    if settings.allowed_origins:
        cors_kwargs["origins"] = settings.allowed_origins
    CORS(app, **cors_kwargs)

    # Registrar blueprints
    app.register_blueprint(api_bp, url_prefix="/api")

    # Healthcheck
    @app.get("/api/health")
    def health():
        return {"status": "ok"}

    # Errores estándar
    @app.errorhandler(400)
    def handle_400(err):
        return jsonify({"error": "Bad Request", "detail": getattr(err, "description", None)}), 400

    @app.errorhandler(401)
    def handle_401(err):
        return jsonify({"error": "Unauthorized", "detail": getattr(err, "description", None)}), 401

    @app.errorhandler(500)
    def handle_500(err):
        return jsonify({"error": "Internal Server Error"}), 500

    # Guardar settings en app
    app.config["SETTINGS"] = settings
    return app


