FROM node:23-alpine as base
WORKDIR /app


FROM base as turbo-builder
RUN apk update
RUN yarn global add turbo

FROM turbo-builder AS sources
COPY . .
RUN turbo prune --docker --out-dir pruned backend web-ssr

FROM turbo-builder AS builder
COPY --from=sources /app/turbo.json ./turbo.json
COPY --from=sources /app/pruned/json/ .
COPY --from=sources /app/pruned/yarn.lock ./yarn.lock
COPY --from=sources /app/pruned/full/ .
COPY .gitignore .gitignore

RUN yarn install --frozen-lockfile

RUN yarn turbo build

# ENV NODE_ENV="production"

FROM base AS runner
COPY --from=builder /app/apps/backend/dist/ /app/apps/backend/dist/
COPY --from=builder /app/apps/web-ssr/dist/ /app/apps/web-ssr/dist
COPY --from=builder /app/node_modules/ /app/node_modules/

COPY deploy/entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh

ENV REACT_SSR_CLIENT_STATIC_DIR="/app/apps/web-ssr/dist/client"
ENV REACT_SSR_CLIENT_INDEX_HTML_PATH="/app/apps/web-ssr/dist/client/index.html"
ENV REACT_SSR_SERVER_ENTRY_JS_PATH="/app/apps/web-ssr/dist/server/entry-server.js"
ENV ENTRYPOINT_JS="/app/apps/backend/dist/src/entrypoints/reactSSR/main.js"

# Ensure all required runtime files and directories exist
RUN [ -f "$REACT_SSR_CLIENT_INDEX_HTML_PATH" ] || (echo "Error: File not found - $REACT_SSR_CLIENT_INDEX_HTML_PATH" && exit 1)
RUN [ -f "$REACT_SSR_SERVER_ENTRY_JS_PATH" ] || (echo "Error: File not found - $REACT_SSR_SERVER_ENTRY_JS_PATH" && exit 1)
RUN [ -f "$ENTRYPOINT_JS" ] || (echo "Error: File not found - $ENTRYPOINT_JS" && exit 1)
RUN [ -d "$REACT_SSR_CLIENT_STATIC_DIR" ] || (echo "Error: Directory not found - $REACT_SSR_CLIENT_STATIC_DIR" && exit 1)

CMD ["/bin/sh", "/app/entrypoint.sh"]

