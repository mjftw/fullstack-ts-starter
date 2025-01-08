FROM node:23-alpine as base
WORKDIR /app

FROM base AS builder
RUN apk update
RUN yarn global add turbo
COPY . .
RUN turbo prune --docker backend react-ssr

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock
COPY --from=builder /app/turbo.json ./turbo.json

RUN yarn install --frozen-lockfile

FROM base AS builder

COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY .gitignore .gitignore
RUN yarn turbo run build --scope=backend --include-dependencies --no-deps

FROM base AS builder
COPY --from=builder /app/ .

ENV EXEC

COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
