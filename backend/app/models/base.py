from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Importamos los modelos aquí para que se registren en el objeto Base
# Asegúrate de que la ruta coincida con tus archivos reales
try:
    from app.models.appointments import Appointment
    from app.models.business_hours import BusinessHours
    from app.models.clients import Client
    from app.models.collaborators import Collaborator
    from app.models.departments import Department
    from app.models.reminder import ScheduledReminder
    from app.models.services import Service
    from app.models.metrics import ApiRouteMetric
    
except ImportError:
    pass
