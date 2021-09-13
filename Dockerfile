FROM node:14.16

RUN apt-get update
RUN apt-get upgrade -y
#RUN apt-get -y install docker-compose

# Create app directory
RUN mkdir -p /webapps/rinz-service
WORKDIR /webapps/rinz-service

# Install yarn
#RUN npm install -g npm@7.19.1
#RUN npm install -g yarn

# Install module
# ADD package.json /sources/api/package.json
COPY package.json /webapps/rinz-service
COPY . /webapps/rinz-service
RUN yarn

# COPY . /sources/web

# ENV REACT_APP_WEBM_HOST localhost

# Bundle app source

# EXPOSE 3000

CMD ["yarn","start"]
