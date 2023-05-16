FROM node:lts-alpine
WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm ci
RUN npm run build

EXPOSE 3000

ENTRYPOINT ["./bin/run"]
