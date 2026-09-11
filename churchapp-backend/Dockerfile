FROM node:18-slim

WORKDIR /app

# Copier les dépendances d'abord (cache npm)
COPY package.json package-lock.json ./
RUN npm install --production

# Copier le reste du code
COPY . .

# Créer les dossiers nécessaires
RUN mkdir -p data uploads

EXPOSE 4000

CMD ["npm", "start"]
