FROM node:20-slim
WORKDIR /app
COPY package*.json .
CMD [ "npm", "install" ]
EXPOSE 3000
COPY . .
CMD [ "node" "app.js" ]