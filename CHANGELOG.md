# Changelog

All notable changes to `kai-instance-api-sdk-js` are documented here.

---

## [20260529.1.0] — 2026-05-29

### Added
- **Request timeout** — `RetryOptions` now accepts `timeout?: number` (default 30 000 ms). Requests that exceed the timeout throw immediately rather than hanging indefinitely.
- **Credential validation** — `KaiInstanceApi` constructor throws a clear error if neither `instanceId` (SaaS) nor `host` (Premise) is provided, instead of silently making unauthenticated requests.
- **Module-level test suite** — unit tests covering endpoint strings, payload shapes, and response mappings for all four modules (`KMAudit`, `Document`, `Orchestrator`, `SemanticGraph`).

### Fixed
- **`Document.downloadFile()`** — previously returned `undefined` because binary responses don't follow the standard `response.data.response` envelope. Now uses a dedicated `arraybuffer` path and returns `Promise<Buffer>`.
- **`parseInt` without radix** — `KMAudit.countConflictsPerSubject` and `countConflictsByDocumentId` now use `parseInt(x, 10)` explicitly.

### Refactored
- **`HttpClient`** — retry loop extracted into a private `withRetry<T>()` helper shared by both `execute()` and the new `download()` method, eliminating duplication.
- **Type tightening** — `Anomaly.state` typed as `AnomalyState` (was `string`); `ConflictDocumentPair` interface added for `getConflictDocumentPairs`; `[key: string]: any` index signatures removed from `DocumentSignature` and `DocumentSignatureExtraproperties`.

---

## [20260528.1.0] — 2026-05-28

### Added
- **`HttpClient`** — new axios wrapper with exponential backoff retry (default: 3 retries, 1 s base delay). Retries on network errors and HTTP 502/503/504 only.
- **`BaseModule`** — abstract base class extended by all four modules. Exposes protected `get`, `post`, `put`, `patch`, `delete` methods. Eliminates per-module axios boilerplate.
- **`RetryOptions`** — exported interface (`maxRetries?`, `retryDelay?`) accepted as second argument to `KaiInstanceApi`.
- **Full HTTP verb support** — `GET`, `PUT`, `PATCH`, `DELETE` available on `HttpClient` and `BaseModule` (GET sends data as query params; others send as request body).

### Fixed
- **Env variable leak** — removed `VITE_APP_API_URL` fallback from `resolveBaseUrl`. The SDK no longer reads internal environment variables.
- **Retry scope** — retries limited to 502/503/504; non-transient 5xx errors (e.g. 500) are not retried.
- **`getNodes` fallback** — removed `|| 20` / `|| 0` guards that masked invalid input.
- **Package name and headers** — corrected `name` field in `package.json`; removed misleading comment from `buildHeaders`.

### Refactored
- All four modules (`KMAudit`, `SemanticGraph`, `Orchestrator`, `Document`) migrated to extend `BaseModule`. Passthrough constructors removed.

### Docs
- README rewritten: corrected Quick Start example, removed internal env var references, added retry configuration section.

---

## Earlier versions

Prior to 20260528.1.0 the project used unversioned incremental commits. That history is available via `git log` but is not documented here.