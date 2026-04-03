# Etapa 1: Construcción
FROM node:20-slim AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Etapa 2: Ejecución (Runtime)
FROM node:20-slim AS runtime
WORKDIR /app

# Copiamos TODO el contenido de la build para asegurar
COPY --from=build /app/.vercel ./.vercel
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

EXPOSE 4321

# Intentemos con la ruta que suele usar el Bridge de Vercel localmente
# Si esto falla, el 'ls -R' del paso anterior te dirá la ruta exacta
CMD ["node", ".vercel/output/functions/index.func/index.js"]