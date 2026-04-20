FROM node:20

WORKDIR /app

# Backend dependencies (node:20 has python3/make/g++ built-in for better-sqlite3)
COPY package.json ./
RUN npm install

# Frontend dependencies
COPY frontend/package.json ./frontend/
RUN cd frontend && npm install

# Copy source
COPY backend/ ./backend/
COPY scripts/ ./scripts/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Runtime directories
RUN mkdir -p data uploads

EXPOSE 3000

CMD ["node", "backend/server.js"]
