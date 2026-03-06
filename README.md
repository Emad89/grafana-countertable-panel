# Counter Table Panel

`em-countertable-panel` is a Grafana panel plugin that behaves like the native Table panel and adds a configurable counter column.

## Features

- Counter column that displays `1..N` for the current visible row order.
- Counter updates after table sorting and filtering.
- Counter options:
  - show/hide
  - header text
  - left/right position
  - width
- Supports native table capabilities exposed through Grafana table internals:
  - sorting
  - filtering
  - column resize
  - pagination
  - field config based rendering

## Local Development

```bash
npm install
npm run dev
docker compose up --build
```

Grafana is available at `http://localhost:3000`.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
npm run e2e
```

## Build Artifact

Production plugin files are generated in `dist/`.

## Signing

For production usage, sign the plugin with a Grafana Cloud API key:

```bash
npm run sign
```
