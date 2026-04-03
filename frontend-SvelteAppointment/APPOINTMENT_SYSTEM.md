# Sistema de Citas - Configuración de Horarios y Zona Horaria

## Resumen de Cambios

Se ha actualizado el sistema de citas para que utilice la configuración de horarios de negocio (`BusinessHoursConfig`) en lugar de valores estáticos, y se ha implementado una gestión de zona horaria centralizada en el backend.

## 🌍 Gestión de Zona Horaria - Frontend Pasivo

### Principio Fundamental
**La lógica de tiempo está centralizada en el backend. El frontend es "pasivo" respecto a la conversión de zonas horarias.**

### Implementación
- ✅ **Envío**: UTC simple (`toISOString()`) - Backend convierte
- ✅ **Recepción**: ISO con offset - Navegador parsea automáticamente  
- ✅ **Visualización**: Solo formateo con `format()` o `Intl.DateTimeFormat`

### Flujo de Datos
```
Frontend (UTC) → Backend (Valida + Convierte) → Frontend (ISO con offset)
```

*Ver `TIMEZONE_CONFIG.md` para detalles completos*

## Cambios Principales

### 1. Eliminación de Horarios Estáticos
- **Eliminado**: `workingHours` con valores hardcodeados (08:00-21:00)
- **Reemplazado por**: Generación dinámica de time slots basada en `weeklyConfig`

### 2. Nueva Función: `generateTimeSlotsFromConfig`
```typescript
function generateTimeSlotsFromConfig(date: Date, config: WeeklyConfig): string[] {
  // Genera slots basados en la configuración de horarios del día seleccionado
  // Soporta múltiples bloques de tiempo (turno partido)
  // Respeta las horas de apertura/cierre configuradas
}
```

### 3. Flujo de Datos Actualizado

```
BusinessHoursConfig (BD) 
    ↓
weeklyConfig (estado)
    ↓
generateTimeSlotsFromConfig()
    ↓
timeSlots (disponibles)
    ↓
AppointmentHeader (formulario)
    ↓
handleSaveAppointment() (guardar cita)
```

## Características Implementadas

### ✅ Horarios Dinámicos
- Los time slots se generan según la configuración de horarios de la base de datos
- Soporte para turnos partidos (mañana y tarde)
- Días cerrados no muestran slots disponibles

### ✅ Validación de Disponibilidad
- Solo se muestran horarios dentro de los bloques configurados
- Respeta la duración de las citas (30 min por defecto)
- Evita solapamientos

### ✅ Formulario Completo
- Todos los campos de la base de datos:
  - `client_name` (requerido)
  - `client_phone` (opcional)
  - `client_email` (opcional)
  - `client_notes` (opcional)
  - `service_id` (requerido)
  - `collaborator_id` (requerido)
  - `start_time`, `end_time` (calculados)
  - `status` (default: 'scheduled')

### ✅ Tipos Compartidos
- Archivo centralizado: `/src/lib/types/appointment.ts`
- Elimina conflictos de interfaces entre componentes
- Tipos consistentes en todo el sistema

## Uso del Sistema

### 1. Configurar Horarios
1. Ve al panel "Horario de Servicio"
2. Activa los días de trabajo
3. Configura los bloques de tiempo (ej: 09:00-13:00, 16:00-20:00)
4. Guarda cambios

### 2. Crear Citas
1. Selecciona una fecha en el calendario
2. Haz clic en "Nueva Cita"
3. Completa los datos del cliente
4. Selecciona hora disponible (basada en horarios configurados)
5. Confirma reserva

### 3. Gestión de Citas
- Vista diaria con todos los turnos
- Cancelación de citas
- Filtros por estado

## Estructura de Archivos

```
src/
├── lib/
│   ├── types/
│   │   └── appointment.ts          # Tipos compartidos
│   └── api/
│       └── appointments.ts         # API de citas
└── components/
    └── appoinment/
        ├── AppointmentDashboard.svelte    # Panel principal
        ├── AppointmentHeader.svelte       # Formulario nueva cita
        ├── Appoinday.svelte              # Vista diaria
        ├── Appviewsday.svelte            # Vista semanal
        └── BusinessHoursConfig.svelte    # Configuración horarios
```

## Debug y Logs

El sistema incluye logs de depuración:
- `🔍 Generando slots para día:`
- `⏰ Procesando slot:`
- `✅ Slots generados:`
- `❌ Día no habilitado o sin time slots`

Revisa la consola del navegador para verificar la generación de horarios.

## Próximos Mejoras

- [ ] Cargar servicios y colaboradores desde la API
- [ ] Configurar duración de citas por servicio
- [ ] Validación de disponibilidad en tiempo real
- [ ] Notificaciones de confirmación

## Notas Técnicas

- Usa Svelte 5 con `$state` y `$derived`
- TypeScript con tipos estrictos
- Astro como framework base
- TailwindCSS para estilos
- API REST con autenticación por cookies
