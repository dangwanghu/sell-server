FROM node:5.7.1

MAINTAINER dangwanghu000@126.com

RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10

RUN apt-get update

RUN cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

RUN echo "Asia/Shanghai" >> /etc/timezone

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . /usr/src/app/

ENV NODE_ENV production

EXPOSE 3000

ENTRYPOINT ["npm", "start"]