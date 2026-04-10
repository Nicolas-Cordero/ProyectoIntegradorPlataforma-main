FROM node:22-alpine
WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

EXPOSE 3000
CMD ["npm", "run", "start:dev"]
