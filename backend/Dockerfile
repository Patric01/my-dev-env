FROM node:18
WORKDIR /app
RUN npm install -g nodemon
COPY package*.json ./
RUN npm install
COPY . .
CMD ["nodemon", "--legacy-watch", "index.js"]
