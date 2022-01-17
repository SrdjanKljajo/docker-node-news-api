FROM node:14

WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json .

ARG NODE_ENV

RUN if [ "$NODE_ENV" = "development" ]; \
    then npm install; \
    else npm install --only=production; \
    fi

# Bundle app source
COPY . ./

EXPOSE 4000
CMD [ "node", "server.js" ]