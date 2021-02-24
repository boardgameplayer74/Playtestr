# Build locally
# docker build . -t nextapp
# Run locally
# docker run -it -p 8080:3000 nextapp

FROM public.ecr.aws/bitnami/node:14.15.1-debian-10-r8
WORKDIR /app

COPY package.json yarn.lock ./
#  installs yarn
RUN yarn

COPY . .

# runs the build script (next build)
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]