# SDK Robustness Design

**Date:** 2026-05-29
**Project:** kai-instance-api-sdk-js
**Status:** Approved

## Goal

Address six robustness gaps in the current SDK before production release:

1. No request timeout — a hung server hangs the caller indefinitely
2. `downloadFile` likely returns wrong data — binary responses don't live at `response.data.response`
3. No credential validation — passing `{}` constructs silently but fails on every request
4. `parseInt` without radix — footgun in `KMAudit` response mapping
5. No module-level tests — endpoint strings and payload shapes are untested
6. Loose `any` types — callers get no type safety on key return shapes

## Approach

TDD for the two behavior fixes with non-obvious correct behavior (`downloadFile`, credential validation). Straightforward implementation for the mechanical fixes (`parseInt`, timeout). Module tests and type tightening added after.

## Section 1: HttpClient changes

### Timeout

Add `timeout?: number` to the existing `RetryOptions` interface. Default: `30000` ms. Pass to `axios.create()`.

```typescript
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;      // new — ms, default 30000
}
```

In `HttpClient` constructor:

```typescript
this.instance = axios.create({
  baseURL: baseUrl,
  headers,
  timeout: retryOptions?.timeout ?? 30000,
});
```

No breaking change — existing callers get a 30 s default they never had before.

### `downloadFile` fix

**Problem:** `HttpClient.execute()` always returns `response.data.response`. Binary file downloads don't follow this shape — content is at `response.data` directly and require `responseType: 'arraybuffer'`.

**Fix:** Add a dedicated `download()` method on `HttpClient` that:
- Sets `responseType: 'arraybuffer'` on the request config
- Returns `response.data` (raw buffer — no `.response` unwrap)
- Still goes through the full retry loop

```typescript
async download(endpoint: string, data?: object): Promise<Buffer> {
  for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
    try {
      const config: Record<string, unknown> = {
        method: 'POST',
        url: endpoint,
        responseType: 'arraybuffer',
      };
      if (data !== undefined) config.data = data;
      const response = await this.instance.request(config);
      return response.data as Buffer;
    } catch (err: unknown) {
      // same retry logic as execute()
      const isAxErr = (err as any)?.isAxiosError === true;
      const retryableStatus = new Set([502, 503, 504]);
      const shouldRetry = isAxErr
        ? (err as any).response === undefined || retryableStatus.has((err as any).response?.status)
        : false;
      if (!shouldRetry || attempt === this.maxRetries) throw err;
      await this.sleep(this.retryDelay * Math.pow(2, attempt));
    }
  }
  throw new Error('Unexpected end of retry loop');
}
```

`BaseModule` gets a corresponding protected passthrough:

```typescript
protected download(endpoint: string, data?: object): Promise<Buffer> {
  return this.http.download(endpoint, data);
}
```

`Document.downloadFile()` changes from `this.post(...)` to `this.download(...)`, return type from `any` to `Promise<Buffer>`.

**TDD:** Write a failing test for `HttpClient.download()` before implementing — confirming it returns `response.data` (not `.response`) and that `responseType: 'arraybuffer'` is set in the request config.

## Section 2: Credential validation + `parseInt`

### Credential validation

Add a guard at the top of the `KaiInstanceApi` constructor:

```typescript
constructor(credentials: KaiStudioCredentials, retryOptions?: RetryOptions) {
  if (!credentials.instanceId && !credentials.host) {
    throw new Error(
      'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
    );
  }
  // ...
}
```

Fails fast with a clear message instead of a silent bad request on every API call.

**TDD:** Write a test that confirms `new KaiInstanceApi({})` throws with the expected message before adding the guard.

### `parseInt` with radix

Three occurrences in `KMAudit.ts` — change `parseInt(x)` → `parseInt(x, 10)` throughout:

- `countConflictsPerSubject` mapping (6 fields: `count`, `count_detected`, `count_managed`, `count_ignored`, `count_redetected`, `count_disappeared`)
- `countConflictsByDocumentId` return value

The radix ensures base-10 parsing regardless of string format, which is the correct behavior for API count responses.

## Section 3: Module tests

Each module gets a test file in `tests/`. Mocking pattern is identical to `HttpClient.test.ts`: mock `axios.create()` to return a fake object with a `request` function, instantiate the module directly.

### Coverage targets

| Module | Methods to test | What to verify |
|---|---|---|
| `KMAudit` | `listConflicts`, `countConflictsPerSubject`, `countConflictsByDocumentId` | Endpoint, payload, `parseInt` transformation |
| `Document` | `listDocuments`, `downloadFile` | Endpoint, payload; `downloadFile` verifies `arraybuffer` path |
| `Orchestrator` | `launchPartialIndexation`, `countRegisteredBackgroundTasks` | Endpoint, payload |
| `SemanticGraph` | `getNodes`, `identifyNodes` | Endpoint, payload |

Each test asserts:
1. Correct endpoint string passed to the request mock
2. Correct payload shape
3. Correct return value (and transformation, where applicable)

Methods not covered are thin wrappers with no transformation logic — an endpoint string change would be caught at integration time.

## Section 4: Type tightening

### `DocumentSignature` and `DocumentSignatureExtraproperties`

Remove `[key: string]: any` index signatures. The known fields are already declared; the index signature defeats TypeScript's ability to catch access typos.

```typescript
// before
export interface DocumentSignature {
  id: string;
  name: string;
  url?: string;
  extraproperties: DocumentSignatureExtraproperties;
  [key: string]: any;   // ← remove
}

// after
export interface DocumentSignature {
  id: string;
  name: string;
  url?: string;
  extraproperties: DocumentSignatureExtraproperties;
}
```

Same removal for `DocumentSignatureExtraproperties`.

### `ConflictDocumentPair`

`getConflictDocumentPairs` currently returns `any[]`. Add a typed interface:

```typescript
export interface ConflictDocumentPair {
  document_ids: string[];
  conflict_count: number;
  state: string;
}
```

Update the method signature to `Promise<ConflictDocumentPair[]>`.

### `Anomaly.state`

Change from `string` to `AnomalyState` — the API only returns enum values here:

```typescript
export interface Anomaly {
  id: string;
  subject: string;
  state: AnomalyState;   // was: string
  documents: AnomalyInformationDocument[];
  explanation: string;
}
```

## File map

| Action | File | Change |
|---|---|---|
| Modify | `modules/HttpClient.ts` | Add `timeout` to `RetryOptions`, add `download()` method |
| Modify | `modules/BaseModule.ts` | Add `protected download()` passthrough |
| Modify | `modules/Document.ts` | `downloadFile` → calls `this.download()`, return type `Buffer`; remove index signatures |
| Modify | `modules/KMAudit.ts` | `parseInt(x, 10)` throughout; `Anomaly.state: AnomalyState`; add `ConflictDocumentPair` |
| Modify | `index.ts` | Add credential validation guard |
| Create | `tests/HttpClient.test.ts` | Add `download()` tests (timeout + arraybuffer path) |
| Create | `tests/KMAudit.test.ts` | Module-level tests |
| Create | `tests/Document.test.ts` | Module-level tests |
| Create | `tests/Orchestrator.test.ts` | Module-level tests |
| Create | `tests/SemanticGraph.test.ts` | Module-level tests |