from __future__ import annotations

import os
from dataclasses import dataclass
from typing import List


@dataclass
class Settings:
    roble_db_name: str
    allowed_origins: List[str]
    debug: bool
    host: str
    port: int

    @staticmethod
    def from_env() -> "Settings":
        # Por defecto usar el dbName provisto por el usuario/proyecto
        roble_db_name = os.getenv("ROBLE_DB_NAME", "moraliquidation_0dded518ba")
        allowed_origins_raw = os.getenv("ALLOWED_ORIGINS", "*")
        allowed_origins = [o.strip() for o in allowed_origins_raw.split(",") if o.strip()]
        debug = os.getenv("FLASK_DEBUG", "true").lower() == "true"
        host = os.getenv("HOST", "0.0.0.0")
        port = int(os.getenv("PORT", "5000"))
        return Settings(
            roble_db_name=roble_db_name,
            allowed_origins=allowed_origins,
            debug=debug,
            host=host,
            port=port,
        )


