FROM node:20-alpine

# better-sqlite3 native compilation uchun
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Backend dependencies
COPY package.json ./
RUN npm install

# Frontend dependencies
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install

# Copy all source
COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Runtime directories
RUN mkdir -p data uploads

EXPOSE 3000

CMD ["node", "backend/server.js"]
