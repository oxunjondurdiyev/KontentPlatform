FROM node:20-alpine

WORKDIR /app

# Backend dependencies
COPY package*.json ./
RUN npm ci

# Frontend dependencies + build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy all source
COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Create runtime directories
RUN mkdir -p data uploads

EXPOSE 3000

CMD ["node", "backend/server.js"]
