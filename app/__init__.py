import json
import logging
from datetime import datetime, timezone

from flask import Flask, request
from werkzeug.middleware.proxy_fix import ProxyFix


class JsonLogFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "time": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if hasattr(record, "path"):
            payload["path"] = record.path
        if hasattr(record, "status"):
            payload["status"] = record.status
        if hasattr(record, "method"):
            payload["method"] = record.method
        return json.dumps(payload)


def configure_logging() -> None:
    root_logger = logging.getLogger()
    if root_logger.handlers:
        return

    handler = logging.StreamHandler()
    handler.setFormatter(JsonLogFormatter())
    root_logger.addHandler(handler)
    root_logger.setLevel(logging.INFO)


app = Flask(__name__)
app.config.from_object("app.config.Config")

configure_logging()
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)


@app.after_request
def add_security_headers(response):
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "geolocation=(self)")
    response.headers.setdefault(
        "Content-Security-Policy",
        "default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval';",
    )
    if app.config.get("ENFORCE_HTTPS") and request.is_secure:
        response.headers.setdefault(
            "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
        )
    return response


from app import routes  # noqa: E402,F401
