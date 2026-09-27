import uuid
from django.db import models


class ExternalApiLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    provider = models.CharField(max_length=64, db_index=True, help_text='External service provider (e.g. setu)')
    api_name = models.CharField(max_length=128, db_index=True, help_text='Logical API name (e.g. pan_verification)')
    endpoint_url = models.TextField(help_text='Destination URL')
    http_method = models.CharField(max_length=10)
    request_headers = models.JSONField(default=dict, blank=True, help_text='Sanitized request headers')
    request_payload = models.JSONField(null=True, blank=True, help_text='Sanitized request payload')
    request_timestamp = models.DateTimeField(db_index=True)
    response_status = models.IntegerField(null=True, blank=True)
    response_headers = models.JSONField(default=dict, blank=True, help_text='Sanitized response headers')
    response_payload = models.JSONField(null=True, blank=True, help_text='Sanitized response payload')
    response_timestamp = models.DateTimeField(null=True, blank=True)
    is_success = models.BooleanField(default=False, db_index=True)
    error_message = models.TextField(blank=True, default='')
    trace_id = models.CharField(max_length=255, blank=True, default='', db_index=True)
    external_reference_id = models.CharField(max_length=255, blank=True, default='')
    duration_ms = models.IntegerField(null=True, blank=True, help_text='Execution duration in milliseconds')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'external_api_logs'
        ordering = ['-request_timestamp']
        indexes = [
            models.Index(fields=['provider', 'api_name']),
            models.Index(fields=['is_success', 'request_timestamp']),
        ]

    def __str__(self):
        status = self.response_status or 'ERROR'
        return f'[{self.provider}:{self.api_name}] {self.http_method} {self.endpoint_url} ({status})'
