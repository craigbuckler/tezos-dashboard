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

# share volume
# VOLUME ${HOME}/static

# expose ports
EXPOSE 3000

# start development server
CMD [ "npm", "start" ]
