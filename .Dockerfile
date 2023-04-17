# Use the official Node.js 18 image as a base
FROM node:18

# Create the working directory for the app
WORKDIR /

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install app dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the default port (3000) for the app
EXPOSE 3000

# Start the app
CMD [ "npm", "start" ]
