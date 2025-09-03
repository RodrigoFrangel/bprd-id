# Estágio de build do backend
FROM node:20-alpine AS backend-build

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm install

COPY backend/ .

# Estágio de produção do backend
FROM node:20-alpine AS backend-production

WORKDIR /app/backend

COPY --from=backend-build /app/backend .

EXPOSE 3000

CMD ["npm", "start"]

# Estágio de produção do frontend
FROM nginx:alpine AS frontend

COPY frontend /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80