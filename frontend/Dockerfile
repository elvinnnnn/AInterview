FROM node:20.18-alpine
ENV NEXT_PUBLIC_BACKEND_ADDR="http://localhost:5000"

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "dev"]