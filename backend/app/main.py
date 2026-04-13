import os
import sys
import time
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from zoneinfo import ZoneInfo

import uvicorn
from fastapi import FastAPI, Depends, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect, schema

from app.core.config import settings
from app.db.session import SessionLocal, engine
# Importamos Base desde el __init__ de models para asegurar el registro de todos los modelos
from app.models import Base 
from app.api.v1.api_route import api_router
from app.models.metrics import ApiRouteMetric

# --- Lógica de Métricas (SRP: Responsabilidad Única) ---
def save_metric_task(path: str, method: str, status_code: int, process_time: float):
    """Guarda métricas de las rutas en segundo plano para no ralentizar la respuesta."""
    db = SessionLocal()
    try:
        new_metric = ApiRouteMetric(
            path=path, method=method,
            status_code=status_code, process_time=process_time
        )
        db.add(new_metric)
        db.commit()
    except Exception as e:
        print(f"⚠️ Error guardando métricas: {e}")
    finally:
        db.close()

# --- Ciclo de Vida de la Aplicación (Lifespan) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Configuración de Bienvenida y Timezone
    print(f"🚀 Starting FastAPI app: {settings.TITLE_BACKEND}")
    print(f"🛠️ Environment: {settings.ENVIRONMENT}")
    
    try:
        local_tz = ZoneInfo(settings.APP_TIMEZONE)
        local_time = datetime.now(local_tz).strftime("%Y-%m-%d %H:%M:%S")
        print(f"🌍 Timezone: {local_tz} | 🕒 Local Time: {local_time}")
    except Exception as e:
        print(f"❌ Error de Timezone: {e}")

    # 2. Configuración de LangSmith (Tracing)
    if settings.LANGSMITH_TRACING:
        os.environ.update({
            "LANGCHAIN_TRACING_V2": "true",
            "LANGCHAIN_API_KEY": settings.LANGSMITH_API_KEY,
            "LANGCHAIN_PROJECT": settings.LANGSMITH_PROJECT,
            "LANGCHAIN_ENDPOINT": settings.LANGSMITH_ENDPOINT or "https://api.smith.langchain.com"
        })
        print("📊 LangSmith Tracing: ENABLED")

    # 3. Sincronización de Base de Datos y Schemas (BLOQUEANTE)
    print(f"--- Verificando conexión a {settings.NAME_DATABASE} ---")
    try:
        # Usamos engine.begin() para asegurar que todo sea una transacción atómica al arrancar
        with engine.begin() as conn:
            # A. Crear el esquema si no es el 'public' y no existe
            if settings.pg_schema and settings.pg_schema != "public":
                print(f"🛠️ Asegurando existencia del esquema: {settings.pg_schema}")
                conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {settings.pg_schema}"))

            # B. Activar la extensión pgvector (Obligatorio para la memoria de agentes)
            print(f"🧬 Verificando extensión pgvector en esquema: {settings.pg_schema}")
            conn.execute(text(f"CREATE EXTENSION IF NOT EXISTS vector SCHEMA {settings.pg_schema} CASCADE"))

            # C. Crear tablas
            # Al importar 'Base' de 'app.models', SQLAlchemy ya conoce ChatMessage, Metrics, etc.
            print("📑 Sincronizando todas las tablas...")
            Base.metadata.create_all(bind=conn)
            print("✅ Base de datos y extensiones sincronizadas correctamente.")

    except Exception as e:
        print(f"❌ ERROR CRÍTICO EN DB AL ARRANCAR: {str(e)}", file=sys.stderr)
        if settings.is_production:
            raise e # Detenemos el despliegue si la DB no está lista en producción

    # 4. LangGraph Checkpointer (Persistencia de Agentes)
    from app.agents.routing.graph import graph
    if settings.USE_PERSISTENT_CHECKPOINTS and settings.LANGGRAPH_DATABASE_URL:
        from langgraph.checkpoint.postgres.aio import AsyncPostgresSaver
        async with AsyncPostgresSaver.from_conn_string(settings.LANGGRAPH_DATABASE_URL) as checkpointer:
            await checkpointer.setup()
            graph.checkpointer = checkpointer
            print("✅ LangGraph: PostgreSQL checkpointer activo")
            yield
    else:
        from langgraph.checkpoint.memory import MemorySaver
        graph.checkpointer = MemorySaver()
        print("✅ LangGraph: MemorySaver activo (Desarrollo)")
        yield

    # 5. Shutdown (Apagado limpio)
    print("👋 Cerrando aplicación...")
    engine.dispose()
    print("🔌 Conexiones de DB liberadas.")

# --- Inicialización de FastAPI ---
app = FastAPI(
    title=settings.TITLE_BACKEND,
    description=f"Core API para {settings.BUSINESS_NAME}",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan,
    docs_url="/docs",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# --- Middlewares ---

# Middleware de Métricas (Background Tasks)
@app.middleware("http")
async def log_route_metrics(request: Request, call_next):
    start_time = time.perf_counter()
    response = await call_next(request)
    process_time = time.perf_counter() - start_time

    background_tasks = BackgroundTasks()
    background_tasks.add_task(
        save_metric_task,
        request.url.path, request.method,
        response.status_code, process_time
    )
    response.background = background_tasks
    return response

# Middleware de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"] if not settings.is_production else ["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# --- Inclusión de Rutas ---
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "app": settings.TITLE_BACKEND,
        "status": "online",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    """Verificación de salud rápida."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "connected",
            "schema": settings.pg_schema
        }
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.ENVIRONMENT == "development"
    )