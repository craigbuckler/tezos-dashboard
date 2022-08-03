# base Node.js v18 image
FROM node:18-alpine

# environment variables
ENV NODE_ENV=development
ENV HOME=/home/node/app
ENV PATH=${HOME}/node_modules/.bin:${PATH}

# create application folder and assign rights to node user
RUN mkdir -p $HOME && chown -R node:node $HOME

# set working directory
WORKDIR $HOME

# set active user
USER node

# copy package.json
COPY --chown=node:node package.json $HOME/

# install modules
RUN npm install

# copy remaining files and build
COPY --chown=node:node . .

# expose ports
EXPOSE 3100
EXPOSE 9229

# start application
CMD [ "npm", "startapi" ]
