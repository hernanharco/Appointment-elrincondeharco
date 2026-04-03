# 🌍 Gestión de Zona Horaria - Frontend Pasivo

## 📋 Principio Fundamental

**En este proyecto, la lógica de tiempo está centralizada en el backend. El frontend es "pasivo" respecto a la conversión de zonas horarias.**

## 🔧 Implementación Frontend

### 1. Envío de Datos (Backend-bound)
```typescript
// ✅ CORRECTO: Enviar UTC simple, backend convierte
start_time: start.toISOString(),  // "2026-02-05T10:00:00.000Z"
end_time: end.toISOString(),    // "2026-02-05T10:30:00.000Z"

// ❌ INCORRECTO: No hacer cálculos manuales de offset
start_time: format(start, "yyyy-MM-dd'T'HH:mm:ssXXX") // No!
```

### 2. Recepción de Datos (Backend-to-Frontend)
```typescript
// ✅ CORRECTO: Backend envía ISO con offset, navegador parsea automáticamente
start_time: new Date(apt.start_time), // "2026-02-05T11:00:00+01:00"
end_time: new Date(apt.end_time),     // "2026-02-05T11:30:00+01:00"

// ❌ INCORRECTO: No usar parseISO manualmente
start_time: parseISO(apt.start_time) // No!
```

### 3. Visualización (Display-only)
```typescript
// ✅ CORRECTO: Solo para mostrar al usuario
{format(appointment.start_time, 'HH:mm')} // "11:00"

// ✅ CORRECTO: Usar Intl.DateTimeFormat
new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit'
}).format(appointment.start_time) // "11:00"
```

## 🔄 Flujo de Datos

```
Frontend (UTC) → Backend (Valida + Convierte) → Frontend (ISO con offset)
     ↑                                                        ↓
     └────────────── Visualización Local ──────────────────────┘
```

## 📝 Ejemplos Prácticos

### Crear Cita
```typescript
// Usuario selecciona: 5 Feb 2026, 10:00 AM
const selectedDate = new Date('2026-02-05'); // Fecha local
const time = '10:00';

// Frontend crea UTC simple
const start = new Date(selectedDate);
start.setUTCHours(10, 0, 0, 0); // UTC: 10:00
// Envía: "2026-02-05T10:00:00.000Z"

// Backend recibe, valida y convierte a zona del negocio
// Si BUSINESS_TZ = Europe/Madrid:
// - Recibe: 2026-02-05T10:00:00.000Z (UTC)
// - Convierte: 2026-02-05T11:00:00+01:00 (Madrid)
// - Almacena en BD: UTC con timezone info
// - Responde: "2026-02-05T11:00:00+01:00"

// Frontend recibe y muestra
const appointment = {
  start_time: new Date("2026-02-05T11:00:00+01:00") // Navegador entiende offset
};
// Muestra: "11:00" (hora local del usuario)
```

### TimeSlots Disponibles
```typescript
// Backend genera slots localizados y los envía
const availableSlots = [
  "09:00", "09:30", "10:00", // Ya convertidos a zona del negocio
];

// Frontend solo renderiza
{#each availableSlots as slot}
  <option value={slot}>{slot}</option>
{/each}
```

## 🚫 Errores Comunes a Evitar

1. **❌ No sumar/restar horas manualmente**
   ```typescript
   // Incorrecto
   const localTime = new Date(utcTime + 3600000); // No!
   ```

2. **❌ No calcular offsets manualmente**
   ```typescript
   // Incorrecto
   const offset = getTimezoneOffset(); // No!
   ```

3. **❌ No usar librerías de conversión de zona horaria**
   ```typescript
   // Incorrecto
   import { zonedTimeToUtc } from 'date-fns-tz'; // No!
   ```

## ✅ Buenas Prácticas

1. **✅ Confiar en el backend**
   - Enviar UTC simple al crear
   - Recibir ISO con offset al leer
   - Dejar que el navegador maneje los offsets

2. **✅ Solo formatear para visualización**
   - Usar `format()` de date-fns para mostrar
   - Usar `Intl.DateTimeFormat` para localización
   - Nunca para cálculos

3. **✅ Mantener el frontend simple**
   - Sin lógica de zona horaria
   - Sin cálculos de tiempo
   - Sin librerías adicionales

## 🎯 Regla de Oro

> **"El frontend es pasivo: recibe tiempos localizados, los muestra tal cual, y envía UTC simple. Toda la magia de la zona horaria está en el backend."**

## 📁 Archivos Clave

- `AppointmentDashboard.svelte` - Creación y carga de citas
- `Appoinday.svelte` - Visualización de horarios
- `AppointmentHeader.svelte` - Formulario de creación
- `TIMEZONE_CONFIG.md` - Esta documentación

---

*Esta configuración asegura consistencia entre frontend y backend y elimina errores comunes de zona horaria.*
