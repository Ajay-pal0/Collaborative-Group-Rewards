import time
import uuid
import logging
from dataclasses import dataclass, field
from typing import Any
import requests
from django.utils import timezone

from apps.common.models import ExternalApiLog
from apps.common.security import sanitize_headers, sanitize_payload

logger = logging.getLogger('integrations.external_api')


@dataclass
class ExternalApiResponse:
    status_code: int | None
    data: Any
    headers: dict[str, str] = field(default_factory=dict)
    is_success: bool = False
    is_timeout: bool = False
    error_message: str = ''
    duration_ms: int = 0
    trace_id: str = ''
    external_reference_id: str = ''
    log_id: uuid.UUID | None = None


class ExternalApiClient:
    """
    Centralized, provider-agnostic external API client.
    Guarantees:
    1. Uniform HTTP execution across GET, POST, PUT, DELETE, PATCH.
    2. Comprehensive request & response audit logging via ExternalApiLog.
    3. Strict sanitization of secrets (credentials, auth tokens) and PII (PAN numbers).
    4. Resilient error handling (connection failures, timeouts, bad status codes).
    5. Clean response envelope containing data, metadata, and audit log linkage.
    """

    def __init__(self, default_timeout: int = 15):
        self.default_timeout = default_timeout

    def execute(
        self,
        provider: str,
        api_name: str,
        method: str,
        url: str,
        headers: dict[str, Any] | None = None,
        json_data: dict[str, Any] | None = None,
        params: dict[str, Any] | None = None,
        timeout: int | None = None,
    ) -> ExternalApiResponse:
        http_method = method.upper()
        effective_timeout = timeout or self.default_timeout
        request_headers = headers or {}
        request_timestamp = timezone.now()
        start_mono = time.monotonic()

        sanitized_req_headers = sanitize_headers(request_headers)
        sanitized_req_payload = sanitize_payload(json_data)

        response_status: int | None = None
        raw_response_data: Any = None
        sanitized_res_payload: Any = None
        sanitized_res_headers: dict[str, Any] = {}
        is_success = False
        is_timeout = False
        error_message = ''
        trace_id = ''
        external_reference_id = ''

        try:
            resp = requests.request(
                method=http_method,
                url=url,
                headers=request_headers,
                json=json_data,
                params=params,
                timeout=effective_timeout,
            )
            response_status = resp.status_code
            sanitized_res_headers = sanitize_headers(dict(resp.headers))

            try:
                raw_response_data = resp.json()
            except ValueError:
                raw_response_data = resp.text

            sanitized_res_payload = sanitize_payload(raw_response_data)

            # Extract trace ID and reference ID if returned in response JSON
            if isinstance(raw_response_data, dict):
                trace_id = str(
                    raw_response_data.get('traceId')
                    or raw_response_data.get('trace_id')
                    or resp.headers.get('x-trace-id', '')
                )
                external_reference_id = str(
                    raw_response_data.get('id')
                    or raw_response_data.get('reference_id')
                    or ''
                )

            is_success = 200 <= response_status < 300

            if not is_success:
                error_message = f'HTTP {response_status} from {provider}'
                if isinstance(raw_response_data, dict):
                    err_detail = raw_response_data.get('message') or raw_response_data.get('error')
                    if err_detail:
                        error_message = f'{error_message}: {err_detail}'

        except requests.exceptions.Timeout as ex:
            is_timeout = True
            is_success = False
            response_status = 504
            error_message = f'Request to {provider} timed out after {effective_timeout}s'
            logger.warning('External API timeout: [%s:%s] %s', provider, api_name, ex)
        except requests.exceptions.RequestException as ex:
            is_success = False
            error_message = f'Connection error to {provider}: {str(ex)}'
            logger.error('External API connection error: [%s:%s] %s', provider, api_name, ex)
        except Exception as ex:
            is_success = False
            error_message = f'Unexpected integration failure: {str(ex)}'
            logger.exception('External API unhandled error: [%s:%s] %s', provider, api_name, ex)
        finally:
            end_mono = time.monotonic()
            response_timestamp = timezone.now()
            duration_ms = int((end_mono - start_mono) * 1000)

            # Persist audit record in database
            try:
                log_entry = ExternalApiLog.objects.create(
                    provider=provider,
                    api_name=api_name,
                    endpoint_url=url,
                    http_method=http_method,
                    request_headers=sanitized_req_headers,
                    request_payload=sanitized_req_payload,
                    request_timestamp=request_timestamp,
                    response_status=response_status,
                    response_headers=sanitized_res_headers,
                    response_payload=sanitized_res_payload,
                    response_timestamp=response_timestamp,
                    is_success=is_success,
                    error_message=error_message,
                    trace_id=trace_id,
                    external_reference_id=external_reference_id,
                    duration_ms=duration_ms,
                )
                log_id = log_entry.id
            except Exception as log_ex:
                logger.error('Failed to persist ExternalApiLog: %s', log_ex)
                log_id = None

        return ExternalApiResponse(
            status_code=response_status,
            data=raw_response_data,
            headers=sanitized_res_headers,
            is_success=is_success,
            is_timeout=is_timeout,
            error_message=error_message,
            duration_ms=duration_ms,
            trace_id=trace_id,
            external_reference_id=external_reference_id,
            log_id=log_id,
        )
