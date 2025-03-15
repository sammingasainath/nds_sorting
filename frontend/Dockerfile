FROM node:18-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with more verbose output
RUN npm ci --verbose

# Copy the rest of the code
COPY . .

# Build the app with the simpler build script
RUN npm run build:docker || (echo "Build failed with error code $?" && ls -la && exit 1)

# Production stage
FROM nginx:alpine

# Copy the build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a healthcheck script
RUN echo '#!/bin/sh\nwget -q --spider http://localhost:80 || exit 1' > /healthcheck.sh && \
    chmod +x /healthcheck.sh

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD [ "/healthcheck.sh" ]

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"] 