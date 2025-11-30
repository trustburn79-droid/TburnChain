FROM node:20-alpine

ENV PORT=5000

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 5000 8546 3000 3001 3002 6000 8008 8000 4200 3003 5173

CMD [ "npm", "run", "start" ] 
