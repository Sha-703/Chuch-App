FROM node:18-slim

WORKDIR /app

# Copier les dépendances d'abord (cache npm)
COPY churchapp-frontend/package.json churchapp-frontend/package-lock.json ./
RUN npm install

# Copier le reste du code frontend
COPY churchapp-frontend/ .

# Builder le frontend
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
