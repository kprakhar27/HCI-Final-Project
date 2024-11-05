# Use the official Node.js image.
# https://hub.docker.com/_/node
FROM node:14

# Set the working directory in the container.
WORKDIR /app

# Copy package.json and package-lock.json files first to leverage Docker cache.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Build the React app.
RUN npm run build

# Make port 3000 available to the world outside this container.
EXPOSE 3000

# Start the application.
CMD ["npm", "start"]