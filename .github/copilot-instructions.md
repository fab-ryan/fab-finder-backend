# Copilot Instructions for fab-finder-backend

## Project Overview

- This is a NestJS (TypeScript) backend service, organized by feature modules and following standard NestJS conventions.
- The entrypoint is `src/main.ts`, which sets up global interceptors, filters, and middleware.
- Logging is handled via a custom Winston logger (`src/utils/logger.ts`) and a global `LoggingInterceptor`.
- API responses are standardized using a `ResponseDto` and a global `ResponseInterceptor` (see `src/common/response/`).
- The main controller is `src/app.controller.ts` (prefix `/api`).

## Key Patterns & Conventions

- **Response Structure:** All API responses are wrapped using `ResponseDto` via the `ResponseInterceptor`. Do not return raw data from controllers; always return objects to be wrapped.
- **Logging:** Use the `Logger` utility and `LoggingInterceptor` for all request/response logging. Logs are written to `logs/` in JSON lines format.
- **Error Handling:** Global exception filter (`HttpExceptionFilter`) is registered in `main.ts`.
- **Request Context:** Middleware attaches request context (see `requestContextMiddleware`).
- **Testing:**
  - Unit: `yarn test`
  - E2E: `yarn test:e2e`
  - Coverage: `yarn test:cov`
- **Build/Run:**
  - Dev: `yarn start:dev`
  - Prod: `yarn start:prod`
  - Docker: Use `Dockerfile` and `docker-compose.yml` for production, `Dockerfile.dev` and `docker-compose.dev.yml` for development.

## Integration & Extensibility

- **Swagger:** API docs are auto-generated and available at `/docs` (see `main.ts` for config).
- **External Logging:** Logs are compatible with tools like ELK, Loki, or Winston Dashboard.
- **Environment:** Uses dotenv for config; see `.env` and `config/` if present.

## Examples

- To add a new endpoint, create a controller in `src/`, register it in a module, and return an object (not a primitive) for response wrapping.
- To add a new service, use NestJS's dependency injection and register in the appropriate module.

## Important Files

- `src/main.ts`: Application bootstrap and global setup
- `src/common/response/`: Response DTO, helper, and interceptors
- `src/common/interceptors/`: Logging and response interceptors
- `src/utils/logger.ts`: Winston logger setup
- `logs/`: JSON logs for requests and responses

## Project-Specific Notes

- All logs are JSON lines for easy parsing and external ingestion.
- Request IDs are generated or passed via `x-request-id` header and included in logs and responses.
- All endpoints are prefixed with `/api` by default.

---

For more details, see the README.md and source files referenced above. If you are unsure about a pattern, check for similar usage in the `src/` directory.
