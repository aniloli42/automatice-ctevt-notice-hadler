FROM node:21-alpine3.17 AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"
ENV PUPPETEER_CACHE_DIR="/server/.cache/puppeteer"
WORKDIR /server
RUN corepack enable
RUN apt-get update && apt-get install gnupg wget -y && \
    wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install google-chrome-stable -y --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

FROM base AS setup
COPY package.json pnpm-lock.yaml ./
COPY . .
RUN pnpm i --frozen-lockfile
RUN pnpm build

FROM base AS production
ENV NODE_ENV=production
COPY --from=setup /server/dist ./dist
COPY --from=setup /server/node_modules ./node_modules
COPY --from=setup /server/package.json ./package.json
CMD [ "node","dist/index.js"] 
