# Frontend PastoTalk

React, TypeScript, Ant Design e Vite. Consulte o README da raiz para iniciar API, banco e migrações.

```sh
npm ci
npm run dev
npm run lint
npm run build
```

O Vite encaminha /api para localhost:5000. No Docker, o Nginx serve o build e encaminha /api para a API Go.

Para testes, com a aplicação e um banco exclusivo já iniciados:

```sh
npx playwright install chromium
npm run test:e2e
```
