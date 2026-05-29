# SDK Robustness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close six robustness gaps in kai-instance-api-sdk-js: request timeout, broken `downloadFile`, missing credential validation, `parseInt` without radix, no module-level tests, and loose `any` types.

**Architecture:** All HttpClient changes (timeout, `withRetry` extraction, `download()`) land first. `BaseModule` and `Document` are updated to surface the new `download()` path. Credential validation is a single guard in `KaiInstanceApi`. Module tests are written per-module after the fixes are in. Type tightening closes out the plan.

**Tech Stack:** TypeScript 5, axios ^1.6.0, Jest + ts-jest

---

## File Map

| Action | File | Change |
|---|---|---|
| Modify | `modules/HttpClient.ts` | Add `timeout` to `RetryOptions`; extract `withRetry()`; add `download()` |
| Modify | `modules/BaseModule.ts` | Add `protected download()` passthrough |
| Modify | `modules/Document.ts` | `downloadFile` → `this.download()`; return type `Buffer`; remove `any` index signatures |
| Modify | `modules/KMAudit.ts` | `parseInt(x, 10)` throughout; `Anomaly.state: AnomalyState`; add `ConflictDocumentPair` |
| Modify | `index.ts` | Add credential validation guard in constructor |
| Modify | `tests/HttpClient.test.ts` | Add timeout tests + `download()` tests |
| Create | `tests/KaiInstanceApi.test.ts` | Credential validation tests |
| Create | `tests/KMAudit.test.ts` | Module-level tests |
| Create | `tests/Document.test.ts` | Module-level tests (includes `downloadFile`) |
| Create | `tests/Orchestrator.test.ts` | Module-level tests |
| Create | `tests/SemanticGraph.test.ts` | Module-level tests |

---

## Task 1: Add timeout to HttpClient (TDD)

**Files:**
- Modify: `modules/HttpClient.ts`
- Modify: `tests/HttpClient.test.ts`

- [ ] **Step 1: Write the failing timeout tests**

Open `tests/HttpClient.test.ts`. Add these two tests inside the `describe('HttpClient', ...)` block, after the last existing test:

```typescript
// ── timeout ───────────────────────────────────────────────────────────────

it('passes custom timeout to axios.create', () => {
  mockedAxios.create.mockReturnValue(makeMockInstance(jest.fn()));
  new HttpClient({}, 'https://api.example.com/', { timeout: 5000 });
  expect(mockedAxios.create).toHaveBeenCalledWith(
    expect.objectContaining({ timeout: 5000 })
  );
});

it('uses default timeout of 30000ms when not specified', () => {
  mockedAxios.create.mockReturnValue(makeMockInstance(jest.fn()));
  new HttpClient({}, 'https://api.example.com/');
  expect(mockedAxios.create).toHaveBeenCalledWith(
    expect.objectContaining({ timeout: 30000 })
  );
});
```

- [ ] **Step 2: Run to verify the tests fail**

```bash
npx jest tests/HttpClient.test.ts --testNamePattern="timeout"
```

Expected: FAIL — `expect(received).toHaveBeenCalledWith(expected)` — `timeout` property is not present.

- [ ] **Step 3: Add `timeout` to `RetryOptions` and pass it to `axios.create`**

Open `modules/HttpClient.ts`. Make these two changes:

Change `RetryOptions`:
```typescript
export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}
```

Change the `axios.create` call inside the constructor:
```typescript
this.instance = axios.create({
  baseURL: baseUrl,
  headers,
  timeout: retryOptions?.timeout ?? 30000,
});
```

- [ ] **Step 4: Run the timeout tests to verify they pass**

```bash
npx jest tests/HttpClient.test.ts --testNamePattern="timeout"
```

Expected: PASS — 2 tests.

- [ ] **Step 5: Run the full HttpClient suite to verify nothing broke**

```bash
npx jest tests/HttpClient.test.ts
```

Expected: all existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add modules/HttpClient.ts tests/HttpClient.test.ts
git commit -m "feat: add request timeout to HttpClient (default 30s)"
```

---

## Task 2: Extract `withRetry` and add `download()` to HttpClient (TDD)

**Files:**
- Modify: `modules/HttpClient.ts`
- Modify: `tests/HttpClient.test.ts`

- [ ] **Step 1: Write the failing `download()` tests**

Open `tests/HttpClient.test.ts`. Add these tests inside the `describe('HttpClient', ...)` block, after the timeout tests:

```typescript
// ── download ──────────────────────────────────────────────────────────────

it('download() returns response.data directly (not response.data.response)', async () => {
  const buffer = Buffer.from('binary content');
  const mockRequest = jest.fn().mockResolvedValueOnce({ data: buffer });
  mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

  const client = new HttpClient({}, 'https://api.example.com/');
  const result = await client.download('api/document/download', { id: 'doc-123' });

  expect(result).toBe(buffer);
  expect(mockRequest).toHaveBeenCalledWith(
    expect.objectContaining({
      method: 'POST',
      url: 'api/document/download',
      responseType: 'arraybuffer',
      data: { id: 'doc-123' },
    })
  );
});

it('download() retries on 503 and recovers', async () => {
  const error = makeAxiosError(503);
  const buffer = Buffer.from('ok');
  const mockRequest = jest.fn()
    .mockRejectedValueOnce(error)
    .mockResolvedValueOnce({ data: buffer });
  mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

  const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 1, retryDelay: 10 });
  const result = await client.download('api/document/download', { id: 'doc-123' });

  expect(result).toBe(buffer);
  expect(mockRequest).toHaveBeenCalledTimes(2);
});

it('download() does not retry on 4xx', async () => {
  const error = makeAxiosError(404);
  const mockRequest = jest.fn().mockRejectedValue(error);
  mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

  const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 2, retryDelay: 10 });

  await expect(client.download('api/document/download', {})).rejects.toEqual(error);
  expect(mockRequest).toHaveBeenCalledTimes(1);
});
```

- [ ] **Step 2: Run to verify the tests fail**

```bash
npx jest tests/HttpClient.test.ts --testNamePattern="download"
```

Expected: FAIL — `client.download is not a function`.

- [ ] **Step 3: Replace `modules/HttpClient.ts` with the refactored version**

Replace the entire file with:

```typescript
import axios, { AxiosInstance } from 'axios';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class HttpClient {
  private readonly instance: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    this.maxRetries = retryOptions?.maxRetries ?? 3;
    this.retryDelay = retryOptions?.retryDelay ?? 1000;
    this.instance = axios.create({
      baseURL: baseUrl,
      headers,
      timeout: retryOptions?.timeout ?? 30000,
    });
  }

  get<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('GET', endpoint, data);
  }

  post<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('POST', endpoint, data);
  }

  put<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('PUT', endpoint, data);
  }

  patch<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('PATCH', endpoint, data);
  }

  delete<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('DELETE', endpoint, data);
  }

  private execute<T>(method: string, endpoint: string, data?: object): Promise<T> {
    return this.withRetry(async () => {
      const config: Record<string, unknown> = { method, url: endpoint };
      if (data !== undefined) {
        config[method === 'GET' ? 'params' : 'data'] = data;
      }
      const response = await this.instance.request(config);
      return response.data.response as T;
    });
  }

  async download(endpoint: string, data?: object): Promise<Buffer> {
    return this.withRetry(async () => {
      const config: Record<string, unknown> = {
        method: 'POST',
        url: endpoint,
        responseType: 'arraybuffer',
      };
      if (data !== undefined) config.data = data;
      const response = await this.instance.request(config);
      return response.data as Buffer;
    });
  }

  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (err: unknown) {
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

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

- [ ] **Step 4: Run the full HttpClient suite**

```bash
npx jest tests/HttpClient.test.ts
```

Expected: all tests pass — including the new `download()` tests and all pre-existing tests.

- [ ] **Step 5: Commit**

```bash
git add modules/HttpClient.ts tests/HttpClient.test.ts
git commit -m "refactor: extract withRetry helper; feat: add download() to HttpClient"
```

---

## Task 3: Add `download()` to BaseModule and fix `Document.downloadFile()` (TDD)

**Files:**
- Modify: `modules/BaseModule.ts`
- Modify: `modules/Document.ts`
- Create: `tests/Document.test.ts`

- [ ] **Step 1: Write the failing `downloadFile` test**

Create `tests/Document.test.ts`:

```typescript
import axios from 'axios';
import { Document } from '../modules/Document';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('Document', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('downloadFile', () => {
    it('uses arraybuffer responseType and returns response.data directly', async () => {
      const buffer = Buffer.from('binary content');
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: buffer });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const doc = new Document({}, 'https://api.example.com/');
      const result = await doc.downloadFile('doc-123');

      expect(result).toBe(buffer);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/document/download',
          responseType: 'arraybuffer',
          data: { id: 'doc-123' },
        })
      );
    });
  });
});
```

- [ ] **Step 2: Run to verify the test fails**

```bash
npx jest tests/Document.test.ts
```

Expected: FAIL — the test receives `undefined` for `result` (current code returns `response.data.response` which doesn't exist on a binary response).

- [ ] **Step 3: Add `protected download()` to `BaseModule`**

Open `modules/BaseModule.ts`. Replace the entire file with:

```typescript
import { HttpClient, RetryOptions } from './HttpClient';

export abstract class BaseModule {
  private readonly http: HttpClient;

  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    this.http = new HttpClient(headers, baseUrl, retryOptions);
  }

  protected get<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.get<T>(endpoint, data);
  }

  protected post<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.post<T>(endpoint, data);
  }

  protected put<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.put<T>(endpoint, data);
  }

  protected patch<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.patch<T>(endpoint, data);
  }

  protected delete<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.delete<T>(endpoint, data);
  }

  protected download(endpoint: string, data?: object): Promise<Buffer> {
    return this.http.download(endpoint, data);
  }
}
```

- [ ] **Step 4: Fix `Document.downloadFile()` and remove `any` index signatures**

Open `modules/Document.ts`. Replace the entire file with:

```typescript
import { BaseModule } from './BaseModule';

export interface DocumentSignatureExtraproperties {
  audit_done: boolean;
  kb_signature: Record<string, string>;
  kai_internal_state: string;
  kai_internal_count_chunks: number;
}

export interface DocumentSignature {
  id: string;
  name: string;
  url?: string;
  extraproperties: DocumentSignatureExtraproperties;
}

export class Document extends BaseModule {
  async listDocuments(offset: number = 0, limit: number = 20, state?: string): Promise<DocumentSignature[]> {
    return this.post('api/document/list-docs', { offset, limit, state });
  }

  async getDocumentDetail(id: string): Promise<DocumentSignature | null> {
    return this.post('api/document/doc', { id });
  }

  async countDocuments(state?: string, documentIds?: string[]): Promise<number> {
    const payload: Record<string, unknown> = {};
    if (state !== undefined) payload.state = state;
    if (documentIds) payload.document_ids = documentIds;
    return this.post('api/document/count-documents', payload);
  }

  async downloadFile(documentId: string): Promise<Buffer> {
    return this.download('api/document/download', { id: documentId });
  }

  async docsByIds(ids: string[], offset: number = 0, limit: number = 20): Promise<DocumentSignature[]> {
    return this.post('api/document/docs-by-ids', { ids, offset, limit });
  }
}
```

- [ ] **Step 5: Run the Document test to verify it passes**

```bash
npx jest tests/Document.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run the full suite to verify nothing broke**

```bash
npx jest
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add modules/BaseModule.ts modules/Document.ts tests/Document.test.ts
git commit -m "feat: add download() to BaseModule; fix Document.downloadFile() — use arraybuffer path"
```

---

## Task 4: Credential validation in `KaiInstanceApi` (TDD)

**Files:**
- Create: `tests/KaiInstanceApi.test.ts`
- Modify: `index.ts`

- [ ] **Step 1: Write the failing credential validation tests**

Create `tests/KaiInstanceApi.test.ts`:

```typescript
import axios from 'axios';
import { KaiInstanceApi } from '../index';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  mockedAxios.create.mockReturnValue({ request: jest.fn() } as any);
  jest.clearAllMocks();
});

describe('KaiInstanceApi constructor', () => {
  it('throws if neither instanceId nor host is provided', () => {
    expect(() => new KaiInstanceApi({})).toThrow(
      'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
    );
  });

  it('throws if only apiKey is provided (no instanceId or host)', () => {
    expect(() => new KaiInstanceApi({ apiKey: 'key-only' })).toThrow(
      'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
    );
  });

  it('constructs successfully with instanceId alone', () => {
    expect(() => new KaiInstanceApi({ instanceId: 'inst-abc' })).not.toThrow();
  });

  it('constructs successfully with instanceId and apiKey (SaaS mode)', () => {
    expect(() => new KaiInstanceApi({ instanceId: 'inst-abc', apiKey: 'key-xyz' })).not.toThrow();
  });

  it('constructs successfully with host alone (Premise mode)', () => {
    expect(() => new KaiInstanceApi({ host: 'https://my-server.example.com/' })).not.toThrow();
  });
});
```

- [ ] **Step 2: Run to verify the tests fail**

```bash
npx jest tests/KaiInstanceApi.test.ts
```

Expected: FAIL — no error is thrown when `{}` is passed.

- [ ] **Step 3: Add the guard to the `KaiInstanceApi` constructor**

Open `index.ts`. Add the guard as the first statement inside the constructor body:

```typescript
constructor(credentials: KaiStudioCredentials, retryOptions?: RetryOptions) {
  if (!credentials.instanceId && !credentials.host) {
    throw new Error(
      'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
    );
  }

  this.credentials = credentials;
  // ... rest of constructor unchanged
```

The full constructor after the change:

```typescript
constructor(credentials: KaiStudioCredentials, retryOptions?: RetryOptions) {
  if (!credentials.instanceId && !credentials.host) {
    throw new Error(
      'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
    );
  }

  this.credentials = credentials;

  const headers = this.buildHeaders(credentials);
  const baseUrl = this.resolveBaseUrl(credentials);

  this._auditInstance = new KMAudit(headers, baseUrl, retryOptions);
  this._semanticGraph = new SemanticGraph(headers, baseUrl, retryOptions);
  this._orchestrator = new Orchestrator(headers, baseUrl, retryOptions);
  this._document = new Document(headers, baseUrl, retryOptions);
}
```

- [ ] **Step 4: Run the credential validation tests**

```bash
npx jest tests/KaiInstanceApi.test.ts
```

Expected: PASS — all 5 tests.

- [ ] **Step 5: Run the full suite**

```bash
npx jest
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add index.ts tests/KaiInstanceApi.test.ts
git commit -m "feat: validate credentials in KaiInstanceApi constructor — fail fast with clear message"
```

---

## Task 5: Fix `parseInt` in `KMAudit`

**Files:**
- Modify: `modules/KMAudit.ts`

- [ ] **Step 1: Fix `countConflictsPerSubject` — add radix to all six `parseInt` calls**

Open `modules/KMAudit.ts`. Find the `countConflictsPerSubject` method and replace the `raw.map(...)` block:

```typescript
// before
return raw.map(item => ({
  subject: item.subject,
  count: parseInt(item.count),
  count_detected: parseInt(item.count_detected),
  count_managed: parseInt(item.count_managed),
  count_ignored: parseInt(item.count_ignored),
  count_redetected: parseInt(item.count_redetected),
  count_disappeared: parseInt(item.count_disappeared),
}));

// after
return raw.map(item => ({
  subject: item.subject,
  count: parseInt(item.count, 10),
  count_detected: parseInt(item.count_detected, 10),
  count_managed: parseInt(item.count_managed, 10),
  count_ignored: parseInt(item.count_ignored, 10),
  count_redetected: parseInt(item.count_redetected, 10),
  count_disappeared: parseInt(item.count_disappeared, 10),
}));
```

- [ ] **Step 2: Fix `countConflictsByDocumentId` — add radix**

In the same file, find `countConflictsByDocumentId` and change:

```typescript
// before
return parseInt(raw);

// after
return parseInt(raw, 10);
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add modules/KMAudit.ts
git commit -m "fix: parseInt with explicit radix 10 in KMAudit"
```

---

## Task 6: KMAudit module tests

**Files:**
- Create: `tests/KMAudit.test.ts`

- [ ] **Step 1: Create `tests/KMAudit.test.ts`**

```typescript
import axios from 'axios';
import { KMAudit, AnomalyState } from '../modules/KMAudit';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('KMAudit', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listConflicts', () => {
    it('posts to the correct endpoint with all parameters', async () => {
      const mockConflicts = [
        {
          id: 'c-1',
          subject: 'Contradiction',
          state: AnomalyState.DETECTED,
          documents: [],
          explanation: 'doc A and doc B conflict',
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: mockConflicts } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      const result = await audit.listConflicts(10, 5, 'myquery', 'report.pdf', AnomalyState.DETECTED);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/audit/conflict-information',
          data: {
            limit: 10,
            offset: 5,
            query: 'myquery',
            document_name: 'report.pdf',
            state: AnomalyState.DETECTED,
          },
        })
      );
      expect(result).toEqual(mockConflicts);
    });

    it('uses defaults when called with no arguments', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      await audit.listConflicts();

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ limit: 200, offset: 0 }),
        })
      );
    });
  });

  describe('countConflictsPerSubject', () => {
    it('maps string counts to integers using parseInt', async () => {
      const raw = [
        {
          subject: 'Topic A',
          count: '5',
          count_detected: '2',
          count_managed: '1',
          count_ignored: '0',
          count_redetected: '1',
          count_disappeared: '1',
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: raw } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      const result = await audit.countConflictsPerSubject();

      expect(result).toEqual([
        {
          subject: 'Topic A',
          count: 5,
          count_detected: 2,
          count_managed: 1,
          count_ignored: 0,
          count_redetected: 1,
          count_disappeared: 1,
        },
      ]);
    });
  });

  describe('countConflictsByDocumentId', () => {
    it('parses the string response to an integer', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: '42' } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      const result = await audit.countConflictsByDocumentId(['doc-1', 'doc-2'], AnomalyState.DETECTED);

      expect(result).toBe(42);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/audit/count-conflict-by-document-ids',
          data: { document_ids: ['doc-1', 'doc-2'], state: AnomalyState.DETECTED },
        })
      );
    });
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest tests/KMAudit.test.ts
```

Expected: PASS — all tests.

- [ ] **Step 3: Commit**

```bash
git add tests/KMAudit.test.ts
git commit -m "test: add KMAudit module tests"
```

---

## Task 7: Document module tests

**Files:**
- Modify: `tests/Document.test.ts`

- [ ] **Step 1: Add `listDocuments` and `docsByIds` tests to `tests/Document.test.ts`**

Open `tests/Document.test.ts` (created in Task 3 — it already has the `downloadFile` test). Add the following describes inside the `describe('Document', ...)` block, after the existing `downloadFile` describe:

```typescript
  describe('listDocuments', () => {
    it('posts to the correct endpoint with offset, limit, and state', async () => {
      const mockDocs = [
        {
          id: 'doc-1',
          name: 'report.pdf',
          extraproperties: {
            audit_done: true,
            kb_signature: {},
            kai_internal_state: 'INDEXED',
            kai_internal_count_chunks: 12,
          },
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: mockDocs } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const doc = new Document({}, 'https://api.example.com/');
      const result = await doc.listDocuments(0, 10, 'INDEXED');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/document/list-docs',
          data: { offset: 0, limit: 10, state: 'INDEXED' },
        })
      );
      expect(result).toEqual(mockDocs);
    });
  });

  describe('docsByIds', () => {
    it('posts document IDs with offset and limit', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const doc = new Document({}, 'https://api.example.com/');
      await doc.docsByIds(['id-1', 'id-2'], 5, 20);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/document/docs-by-ids',
          data: { ids: ['id-1', 'id-2'], offset: 5, limit: 20 },
        })
      );
    });
  });
```

- [ ] **Step 2: Run the tests**

```bash
npx jest tests/Document.test.ts
```

Expected: PASS — all tests including the `downloadFile` test from Task 3.

- [ ] **Step 3: Commit**

```bash
git add tests/Document.test.ts
git commit -m "test: add Document module tests"
```

---

## Task 8: Orchestrator module tests

**Files:**
- Create: `tests/Orchestrator.test.ts`

- [ ] **Step 1: Create `tests/Orchestrator.test.ts`**

```typescript
import axios from 'axios';
import { Orchestrator } from '../modules/Orchestrator';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('Orchestrator', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('launchPartialIndexation', () => {
    it('posts to the correct endpoint and returns the response', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const orch = new Orchestrator({}, 'https://api.example.com/');
      const result = await orch.launchPartialIndexation();

      expect(result).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/orchestrator/differential-indexation',
        })
      );
    });
  });

  describe('countRegisteredBackgroundTasks', () => {
    it('posts to the correct endpoint and returns task count map', async () => {
      const counts = { indexation: 3, extraction: 1 };
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: counts } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const orch = new Orchestrator({}, 'https://api.example.com/');
      const result = await orch.countRegisteredBackgroundTasks();

      expect(result).toEqual(counts);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/orchestrator/count-back-tasks',
        })
      );
    });
  });

  describe('reindexDocument', () => {
    it('sends document id in payload', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const orch = new Orchestrator({}, 'https://api.example.com/');
      await orch.reindexDocument('doc-abc');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/orchestrator/reindex-document',
          data: { id: 'doc-abc' },
        })
      );
    });
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest tests/Orchestrator.test.ts
```

Expected: PASS — all tests.

- [ ] **Step 3: Commit**

```bash
git add tests/Orchestrator.test.ts
git commit -m "test: add Orchestrator module tests"
```

---

## Task 9: SemanticGraph module tests

**Files:**
- Create: `tests/SemanticGraph.test.ts`

- [ ] **Step 1: Create `tests/SemanticGraph.test.ts`**

```typescript
import axios from 'axios';
import { SemanticGraph } from '../modules/SemanticGraph';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('SemanticGraph', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getNodes', () => {
    it('posts to the correct endpoint with limit and offset', async () => {
      const nodes = [
        {
          id: 'n-1',
          node_1: 'ConceptA',
          node_2: 'ConceptB',
          edge: 'relates_to',
          extraproperties: { documents: [], chunks: [], count: 0 },
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: nodes } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const graph = new SemanticGraph({}, 'https://api.example.com/');
      const result = await graph.getNodes(5, 10);

      expect(result).toEqual(nodes);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/semantic-graph/nodes',
          data: { limit: 5, offset: 10 },
        })
      );
    });
  });

  describe('identifyNodes', () => {
    it('maps needDocumentsContent to need_documents_content in the payload', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const graph = new SemanticGraph({}, 'https://api.example.com/');
      await graph.identifyNodes('search query', true);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/semantic-graph/identify-nodes',
          data: { query: 'search query', need_documents_content: true },
        })
      );
    });

    it('defaults needDocumentsContent to false', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const graph = new SemanticGraph({}, 'https://api.example.com/');
      await graph.identifyNodes('query only');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { query: 'query only', need_documents_content: false },
        })
      );
    });
  });
});
```

- [ ] **Step 2: Run the tests**

```bash
npx jest tests/SemanticGraph.test.ts
```

Expected: PASS — all tests.

- [ ] **Step 3: Commit**

```bash
git add tests/SemanticGraph.test.ts
git commit -m "test: add SemanticGraph module tests"
```

---

## Task 10: Type tightening

**Files:**
- Modify: `modules/KMAudit.ts`

`Document.ts` index signatures were already removed in Task 3.

- [ ] **Step 1: Change `Anomaly.state` from `string` to `AnomalyState`**

Open `modules/KMAudit.ts`. Find the `Anomaly` interface and change `state`:

```typescript
// before
export interface Anomaly {
  id: string;
  subject: string;
  state: string;
  documents: AnomalyInformationDocument[];
  explanation: string;
}

// after
export interface Anomaly {
  id: string;
  subject: string;
  state: AnomalyState;
  documents: AnomalyInformationDocument[];
  explanation: string;
}
```

- [ ] **Step 2: Add `ConflictDocumentPair` interface and update `getConflictDocumentPairs` return type**

> **Important:** The field names below are inferred from naming conventions and must be verified against a real API response before shipping. Log a response from `getConflictDocumentPairs` and compare.

Add the interface before the `KMAudit` class definition:

```typescript
export interface ConflictDocumentPair {
  document_ids: string[];
  conflict_count: number;
  state: string;
}
```

Update `getConflictDocumentPairs` signature:

```typescript
// before
async getConflictDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string, state?: string, sortOrder?: string): Promise<any[]> {

// after
async getConflictDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string, state?: string, sortOrder?: string): Promise<ConflictDocumentPair[]> {
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Run the full test suite**

```bash
npx jest
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add modules/KMAudit.ts
git commit -m "refactor: tighten types — Anomaly.state → AnomalyState, add ConflictDocumentPair"
```