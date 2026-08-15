"""
Test-only settings — overrides the PostgreSQL DB with an in-memory SQLite
database so tests run in milliseconds without any Docker/network overhead.
"""
from backends.config.settings import *  # noqa: F401, F403

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# Speed up password hashing in tests
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Silence logging noise during tests
LOGGING = {}
