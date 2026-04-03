# 🚨 Optimización para Neon Database - Reducción de Compute Units

## 📊 **Problema Identificado**
La base de datos Neon (Serverless) consumía 28.2/100 CU-hrs porque no podía entrar en estado de suspensión (Idle) debido a conexiones constantes desde el frontend.

## 🔍 **Causa Raíz**
### **Server-Sent Events (SSE) - Conexión Permanente**
- **Archivo**: `src/lib/api/realtime.ts`
- **Problema**: `EventSource` mantenía túnel abierto 24/7
- **Impacto**: Prevenía que Neon entrara en estado idle (requiere 5 min sin actividad)

## 🛠️ **Solución Implementada**

### **1. Desactivación Temporal de SSE**
```typescript
// ANTES (conexión permanente)
constructor() {
    if (typeof window !== 'undefined') {
        this.initRealtime(); // Mantiene DB activa 24/7
    }
}

// AHORA (desactivado temporalmente)
constructor() {
    // TEMPORALMENTE DESACTIVADO: Conexión SSE para evitar consumo excesivo en Neon
    // La DB necesita 5 min de inactividad para entrar en estado idle
}
```

### **2. Refresh Manual en Acciones Críticas**
- `createAppointment()`: Refresco manual tras crear
- `deleteAppointment()`: Refresco manual tras eliminar

## 📈 **Impacto Esperado**
- ✅ **Neon podrá entrar en estado idle** tras 5 min de inactividad
- ✅ **Reducción drástica de Compute Units** (de 28.2 a ~5-10 CU-hrs)
- ✅ **Ahorro económico** significativo en plan Neon

## ⚠️ **Cambios en UX**
- **Sin sincronización automática** entre múltiples pestañas
- **Refresh manual requerido** para ver cambios de otros usuarios
- **Botón de refresh en Navigation** para sincronización explícita

## 🔄 **Próximos Pasos (Opcional)**
1. **Implementar polling de 15+ minutos** si se desea sincronización automática
2. **Considerar WebSocket con heartbeat configurable** para control preciso
3. **Monitorear consumo** en dashboard de Neon para validar la optimización

## 📝 **Notas de Reversión**
Para re-activar SSE en el futuro:
1. Descomentar `initRealtime()` en constructor
2. Remover refresh manual de `createAppointment()` y `deleteAppointment()`
3. Asegurar polling de 15+ min o mecanismo de desconexión automática

---
**Fecha**: 2026-02-23  
**Motivo**: Optimización de costos en Neon Database  
**Estado**: Implementado y listo para monitoreo
