from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, computed_field

class Settings(BaseSettings):
    """
    Configuración centralizada del SaaS.
    Mapea las variables del archivo .env a atributos de Python.
    """

    # --- Base de Datos (Variables individuales) ---
    pg_host: str = Field(..., alias="PGHOST")
    pg_port: int = Field(5432, alias="PGPORT")
    pg_database: str = Field(..., alias="PGDATABASE")
    pg_user: str = Field(..., alias="PGUSER")
    pg_password: str = Field(..., alias="PGPASSWORD")
    pg_schema: str = Field("public", alias="PGSCHEMA")
    pg_sslmode: str = Field("disable", alias="PGSSLMODE")
    pg_channel_binding: str = Field("disable", alias="PGCHANNELBINDING")

    @computed_field
    @property
    def database_url(self) -> str:
        """
        Construye la URL de conexión asíncrona para SQLAlchemy + Psycopg3.
        Aplica aislamiento de Schema mediante search_path.
        """
        return (
            f"postgresql+psycopg://{self.pg_user}:{self.pg_password}@"
            f"{self.pg_host}:{self.pg_port}/{self.pg_database}?"
            f"options=-csearch_path%3D{self.pg_schema}&"
            f"sslmode={self.pg_sslmode}"
        )

    # --- Configuración de Pydantic ---
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # OpenAI API Key
    OPENAI_API_KEY: str = ""

    # Name of the AI
    NAME_IA: str = "Maria"

    # Use persistent checkpoints
    USE_PERSISTENT_CHECKPOINTS: bool = False

    # Nombre de la empresa
    BUSINESS_NAME: str = (
        "Default Business Name"  # Valor por defecto si no existe en .env
    )

    # Title for the backend:
    TITLE_BACKEND: str = "Default API Title"  # Valor por defecto si no existe en .env
    NAME_DATABASE: str = (
        "Default Database Name"  # Valor por defecto si no existe en .env
    )

    # --- Entorno y Debug ---
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # --- Base de Datos ---
    # Usamos una sola variable genérica. El .env o Docker deciden el valor.
    DATABASE_URL: Optional[str] = None

    # --- Seguridad ---
    SECRET_KEY: Optional[str] = None

    # --- JWT Settings ---
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # --- API Prefix ---
    API_V1_STR: str = "/api/v1"

    # --- CORS Settings ---
    # Un solo string que convertiremos en lista con la propiedad 'allow_origins'
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- Google OAuth ---
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # --- Meta Ws ---
    WHATSAPP_TOKEN: str = ""
    PHONE_NUMBER_ID: str = ""

    # --- Telegram ---
    TELEGRAM_BOT_NAME: str = ""
    TELEGRAM_TOKEN: str = ""

    # Zona Horaria
    APP_TIMEZONE: str = "UTC"

    # --- LangSmith ---
    LANGSMITH_TRACING: bool = False
    LANGSMITH_ENDPOINT: str = ""
    LANGSMITH_API_KEY: str = ""
    LANGSMITH_PROJECT: str = ""

    # --- LangGraph Database ---
    LANGGRAPH_DATABASE_URL: Optional[str] = None

    # --- Propiedades Calculadas (Helpers) ---
    @property
    def is_production(self) -> bool:
        """Retorna True si estamos en producción."""
        return self.ENVIRONMENT == "production"

    @property
    def allow_origins(self) -> List[str]:
        """
        Convierte el string de CORS_ORIGINS (separado por comas) en una lista real.
        Ejemplo: "http://localhost:3000,http://127.0.0.1:3000" -> ["http://localhost:3000", ...]
        """
        if not self.CORS_ORIGINS:
            return []
        # .strip() elimina espacios accidentales alrededor de las URLs
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


# Instanciamos para que todo el proyecto use esta misma configuración
settings = Settings()
