FROM node:18-slim

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
