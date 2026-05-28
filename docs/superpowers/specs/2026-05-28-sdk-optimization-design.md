# SDK Optimization Design

**Date:** 2026-05-28
**Project:** kai-instance-api-sdk-js
**Status:** Approved

## Goal

Harden the public SDK to meet production shipping standards:
- Solid architecture (no boilerplate repetition, clear module boundaries)
- Automatic HTTP retry with exponential backoff
- Zero internal env variable or test code leaks
- Clean, accurate README

## Architecture

### New files

| File | Purpose |
|---|---|
| `modules/HttpClient.ts` | Axios wrapper with retry logic |
| `modules/BaseModule.ts` | Abstract base class all modules extend |

### Changed files

| File | Change |
|---|---|
| `modules/KMAudit.ts` | Extend BaseModule, remove constructor/axios boilerplate |
| `modules/SemanticGraph.ts` | Same |
| `modules/Orchestrator.ts` | Same |
| `modules/Document.ts` | Same |
| `index.ts` | Add optional `RetryOptions` param, remove `VITE_APP_API_URL` leak |
| `README.md` | Fix broken examples, remove internal env var names |

### Public API

No breaking changes. Existing call patterns continue to work:

```typescript
const api = new KaiInstanceApi({ instanceId: 'YOUR_INSTANCE_ID', apiKey: 'YOUR_API_KEY' });
await api.document().listDocuments();
```

Optional retry config as second constructor argument:

```typescript
const api = new KaiInstanceApi(
  { instanceId: 'YOUR_INSTANCE_ID', apiKey: 'YOUR_API_KEY' },
  { maxRetries: 3, retryDelay: 1000 }
);
```

## HttpClient

Single axios wrapper used by all modules. Holds headers and baseUrl. All requests go through `post<T>(endpoint, data)`.

**Retry behavior:**
- Retries on network errors (no response) and HTTP 5xx responses
- Does not retry on 4xx (client errors — retrying won't help)
- Throws the final axios error after all attempts are exhausted

**Backoff schedule** (defaults: `maxRetries: 3`, `retryDelay: 1000ms`):

```
attempt 1 → fails → wait 1000ms
attempt 2 → fails → wait 2000ms
attempt 3 → fails → wait 4000ms
throw
```

Formula: `retryDelay * 2^attemptIndex`

## RetryOptions interface

```typescript
interface RetryOptions {
  maxRetries?: number;   // default: 3
  retryDelay?: number;   // default: 1000 (ms)
}
```

Defined in `index.ts`, exported publicly.

## BaseModule

Abstract class. Constructor takes `(headers, baseUrl, retryOptions?)` and instantiates `HttpClient` internally. Exposes a single protected method:

```typescript
protected post<T>(endpoint: string, data: object = {}): Promise<T>
```

Modules call `this.post(...)` only — no axios import, no try/catch, no constructor logic in individual module files.

## Module pattern (after)

```typescript
export class KMAudit extends BaseModule {
  async listConflicts(limit = 200, offset = 0, ...): Promise<Anomaly[]> {
    return this.post('api/audit/conflict-information', { limit, offset, ... });
  }
}
```

## Env leak fix

Remove the `VITE_APP_API_URL` fallback from `resolveBaseUrl` in `index.ts`. The two valid modes are:
- **SaaS:** `instanceId` + `apiKey` → base URL is always `https://api.kai-studio.ai/`
- **Premise:** `host` passed by caller → base URL is `host`

No env var fallback belongs in a public SDK.

## README fixes

- Fix Quick Start example: `KaiStudio` → `KaiInstanceApi`, remove `.search()` call
- Replace `VUE_APP_INSTANCE_ID`, `VUE_APP_API_KEY`, `VUE_APP_HOST` with generic placeholders
- Add retry config example
- Ensure all four module sections match current method signatures
