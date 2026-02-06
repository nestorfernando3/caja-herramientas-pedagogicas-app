# Seguridad

## Reporte de vulnerabilidades
Reporta hallazgos de seguridad al mantenedor del repositorio por canal privado.

## Medidas actuales
- Endpoints administrativos protegidos por `x-api-key`.
- Separacion de datos publicados y no publicados.
- Validaciones basicas de payload en backend.

## Mejoras recomendadas
- Migrar a autenticacion con usuarios y roles.
- Registrar auditoria de acciones editoriales.
- Implementar limites de peticiones por IP.
