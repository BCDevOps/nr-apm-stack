FROM node:18-alpine

LABEL org.opencontainers.image.source=https://github.com/BCDevOps/nr-apm-stack
LABEL org.opencontainers.image.description="Event stream processing lambda"
LABEL org.opencontainers.image.licenses=Apache-2.0

WORKDIR /usr/src/app
COPY . /usr/src/app

RUN npm ci
RUN npm i --location=global @nestjs/cli

EXPOSE 3000

CMD ["npm", "start"]
