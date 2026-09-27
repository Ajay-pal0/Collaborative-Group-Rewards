import re
from typing import Any

PAN_REGEX = re.compile(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$')

SENSITIVE_HEADER_KEYS = {
    'x-client-id',
    'x-client-secret',
    'authorization',
    'proxy-authorization',
    'x-api-key',
    'cookie',
    'set-cookie',
}

SENSITIVE_PAYLOAD_KEYS = {
    'password',
    'secret',
    'client_secret',
    'token',
    'access_token',
    'refresh_token',
    'key',
    'api_key',
}


def mask_pan(pan: str | None) -> str:
    """
    Masks a 10-character PAN number preserving the first 5 characters and last 1 character.
    Example: ABCDE1234A -> ABCDE****A
    """
    if not pan:
        return ''
    clean_pan = str(pan).strip().upper()
    if len(clean_pan) == 10:
        return f'{clean_pan[:5]}****{clean_pan[9:]}'
    if len(clean_pan) > 4:
        return f'{clean_pan[:2]}****{clean_pan[-2:]}'
    return '****'


def validate_pan_format(pan: str | None) -> bool:
    """
    Validates whether the provided PAN strictly conforms to the Indian PAN structure (AAAAA9999A).
    """
    if not pan:
        return False
    return bool(PAN_REGEX.match(str(pan).strip().upper()))


def sanitize_headers(headers: dict[str, Any] | None) -> dict[str, Any]:
    """
    Returns a copy of headers with sensitive values masked.
    """
    if not headers or not isinstance(headers, dict):
        return {}
    sanitized = {}
    for key, value in headers.items():
        key_lower = str(key).lower()
        if key_lower in SENSITIVE_HEADER_KEYS or 'secret' in key_lower:
            sanitized[key] = '[REDACTED]'
        else:
            sanitized[key] = value
    return sanitized


def sanitize_payload(payload: Any) -> Any:
    """
    Recursively masks sensitive data (PANs, tokens, secrets) in JSON/dict payloads for audit logging.
    """
    if payload is None:
        return None
    if isinstance(payload, dict):
        cleaned: dict[str, Any] = {}
        for key, value in payload.items():
            key_lower = str(key).lower()
            if key_lower == 'pan':
                cleaned[key] = mask_pan(str(value)) if value else value
            elif key_lower in SENSITIVE_PAYLOAD_KEYS or 'secret' in key_lower:
                cleaned[key] = '[REDACTED]'
            else:
                cleaned[key] = sanitize_payload(value)
        return cleaned
    elif isinstance(payload, list):
        return [sanitize_payload(item) for item in payload]
    return payload
