# ==============================
# 1. Build Stage
# ==============================
FROM node:20-alpine AS build
WORKDIR /app

# Copy package descriptors 
COPY package*.json ./
RUN npm install

# Copy source and build the Vite React application
COPY . .
RUN npm run build

# ==============================
# 2. Runtime Stage (Nginx)
# ==============================
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Clean default nginx html
RUN rm -rf ./*

# Copy built assets from build stage
COPY --from=build /app/dist .

# Copy custom Nginx configuration to handle React Router and reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 5173
ENTRYPOINT ["nginx", "-g", "daemon off;"]
