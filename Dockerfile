# syntax=docker/dockerfile:1
FROM golang:1.25-bookworm AS build
WORKDIR /app
COPY api/src/go.mod api/src/go.sum ./
RUN --mount=type=secret,id=proxy_ca if [ -f /run/secrets/proxy_ca ]; then SSL_CERT_FILE=/run/secrets/proxy_ca go mod download; else go mod download; fi
COPY api/src/ ./
RUN CGO_ENABLED=0 go build -trimpath -o /pastotalk .
FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /pastotalk /pastotalk
EXPOSE 5000
ENTRYPOINT ["/pastotalk"]
