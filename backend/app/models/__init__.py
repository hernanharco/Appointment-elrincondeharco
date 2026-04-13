# app/models/__init__.py
from .base import Base
from .appointments import Appointment
from .business_hours import BusinessHours, TimeSlot
from .clients import Client
from .collaborators import Collaborator
from .departments import Department
from .reminder import ScheduledReminder
from .services import Service
from .metrics import ApiRouteMetric
# IMPORTANTE: Importamos el modelo de chat que está en la carpeta de agentes
from app.agents.memory.memory_models import ChatMessage

__all__ = [
    "Base",
    "Service",
    "BusinessHours",
    "TimeSlot",
    "Client",
    "Collaborator",
    "Department",
    "Appointment",    
    "ScheduledReminder",
    "ApiRouteMetric",
    "ChatMessage", # <--- Y esto
]