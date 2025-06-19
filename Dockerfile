# Use official Node.js image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --only=production

# Copy application files (ignore files in .dockerignore)
COPY . .

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "index.js"]