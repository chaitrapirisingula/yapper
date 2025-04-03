# Use the official Node.js LTS image
FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the compiled JavaScript server
CMD ["node", "dist/index.js"]
