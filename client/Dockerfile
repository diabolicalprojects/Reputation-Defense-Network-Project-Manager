FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
# Run npm install instead of ci to fix native bindings for rolldown on Vite 6
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
# Copy built dist files
COPY --from=builder /app/dist /usr/share/nginx/html
# Provide nginx config for React SPA routing
RUN echo 'server { listen 80; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
