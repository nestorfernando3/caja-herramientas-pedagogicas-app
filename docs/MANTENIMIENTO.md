# Mantenimiento y Respaldo

## Rutina semanal sugerida
1. Exportar JSON desde panel editorial.
2. Guardar copia en repositorio o almacenamiento institucional.
3. Verificar estado de propuestas pendientes.
4. Revisar categorias vacias o redundantes.

## Rutina mensual sugerida
1. Evaluar crecimiento por categoria con `/api/stats`.
2. Consolidar etiquetas duplicadas.
3. Revisar necesidad de nuevas categorias.

## Recuperacion
- Si hay dano de datos, reemplaza `data/db.json` por el ultimo backup valido.
- Reinicia la aplicacion.
