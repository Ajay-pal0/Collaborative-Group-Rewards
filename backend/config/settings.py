import dj_database_url
from decouple import config
from datetime import timedelta
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent



# SECURITY
SECRET_KEY = config(
    'SECRET_KEY',
    default='django-insecure-dev-secret-key-change-in-production'
)

DEBUG = config(
    'DEBUG',
    default=True,
    cast=bool
)

ALLOWED_HOSTS = [
    host.strip().replace('https://', '').replace('http://', '').rstrip('/').split('/')[0]
    for host in config(
        'ALLOWED_HOSTS',
        default='localhost,127.0.0.1,.vercel.app,.onrender.com'
    ).split(',')
    if host.strip()
]




# INSTALLED APPS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'rest_framework',
    'corsheaders',

    # Local apps
    'apps.common',
    'apps.users',
    'apps.groups',
    'apps.rewards',
    'apps.activities',
]


# MIDDLEWARE
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


# URL / TEMPLATES
ROOT_URLCONF = 'config.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# DATABASE
DATABASE_URL = config(
    'DATABASE_URL',
    default=None
)

if DATABASE_URL and (DATABASE_URL.startswith('postgres://') or DATABASE_URL.startswith('postgresql://') or DATABASE_URL.startswith('sqlite://')):
    try:
        DATABASES = {
            'default': dj_database_url.config(
                default=DATABASE_URL,
                conn_max_age=600,
                ssl_require=False if DEBUG else True,
            )
        }
    except Exception:
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.sqlite3',
                'NAME': BASE_DIR / 'db.sqlite3',
            }
        }
elif config('DB_HOST', default=None):
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': config('DB_NAME', default='group_rewards'),
            'USER': config('DB_USER', default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='postgres'),
            'HOST': config('DB_HOST', default='localhost'),
            'PORT': config('DB_PORT', default='5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }


# USER
AUTH_USER_MODEL = 'users.User'


# PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME':
        'django.contrib.auth.password_validation.'
        'UserAttributeSimilarityValidator'
    },
    {
        'NAME':
        'django.contrib.auth.password_validation.'
        'MinimumLengthValidator'
    },
    {
        'NAME':
        'django.contrib.auth.password_validation.'
        'CommonPasswordValidator'
    },
    {
        'NAME':
        'django.contrib.auth.password_validation.'
        'NumericPasswordValidator'
    },
]


# INTERNATIONALIZATION
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# STATIC
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# REST FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),

    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),

    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],

    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/minute',
        'user': '300/minute',
        'auth': '10/minute',
    },
}


# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
}


# CORS
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in config(
        'CORS_ALLOWED_ORIGINS',
        default='http://localhost:5173'
    ).split(',')
    if origin.strip()
]

CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https:\/\/.*\.vercel\.app$",
    r"^https:\/\/.*\.pages\.dev$",
]

CORS_ALLOW_CREDENTIALS = True


# CSRF
CSRF_TRUSTED_ORIGINS = [
    origin.strip()
    for origin in config(
        'CSRF_TRUSTED_ORIGINS',
        default='https://*.vercel.app,https://*.pages.dev'
    ).split(',')
    if origin.strip()
]


# EXTERNAL INTEGRATIONS - SETU PAN VERIFICATION
SETU_PAN_VERIFY_URL = 'https://dg-sandbox.setu.co/api/verify/pan'
SETU_CLIENT_ID = '810bb42a-e09f-490a-838e-d9212a7966de'
SETU_CLIENT_SECRET = 'wARjJ7E6kMPD8YmrNTx7w7afMQCijB3t'
SETU_PRODUCT_INSTANCE_ID = '9578859d-c667-43f3-8712-c92df29998d9'


# EMAIL CONFIGURATION & PASSWORD RESET
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='Collaborative Group Rewards <noreply@group-rewards.app>')
FRONTEND_URL = config('FRONTEND_URL', default='https://collaborative-group-rewards.vercel.app').rstrip('/')


# LOGGING CONFIGURATION
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} [{name}] {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'integrations.external_api': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'users.pan_service': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}