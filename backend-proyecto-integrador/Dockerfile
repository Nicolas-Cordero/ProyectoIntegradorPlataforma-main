FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

# Producción por defecto; docker-compose.yml lo sobreescribe con start:dev para desarrollo
CMD ["npm", "run", "start:prod"]
