FROM node:lts-alpine
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm ci
RUN npm i -g @nestjs/cli

EXPOSE 3000

CMD ["npm", "start"]
