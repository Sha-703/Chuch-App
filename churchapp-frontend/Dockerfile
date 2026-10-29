# Node 24 = même major que le build local vérifié.
# ATTENTION : ne pas redescendre sous Node 20 — workbox-build (utilisé par
# vite-plugin-pwa pour générer le service worker) exige "node >= 20" :
# sur Node 18 le build échoue avec
#   Error: Dynamic require of "workbox-build" is not supported
# (l'erreur réelle étant masquée par le try/catch du plugin).
FROM node:24-slim

WORKDIR /app

# Copier les dépendances d'abord (cache npm)
COPY package.json package-lock.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Builder le frontend
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
