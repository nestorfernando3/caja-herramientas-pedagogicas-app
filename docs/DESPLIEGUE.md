# Despliegue y Operacion

## Requisitos
- Node.js 20+
- NPM 10+

## Local
```bash
npm install
cp .env.example .env
npm run dev
```

## Variables
- `PORT`: puerto HTTP.
- `ADMIN_API_KEY`: clave editorial.

## Produccion
```bash
npm install --omit=dev
npm start
```

## Recomendaciones
- Ejecutar con process manager (`pm2`, `systemd` o contenedor).
- Montar volumen persistente para `data/db.json`.
- Respaldar `data/db.json` de forma periodica.
- Definir `ADMIN_API_KEY` fuerte y secreta.
