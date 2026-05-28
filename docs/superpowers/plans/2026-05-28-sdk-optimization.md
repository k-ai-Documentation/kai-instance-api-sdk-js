# SDK Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden kai-instance-api-sdk-js for public release: solid architecture via BaseModule + HttpClient, automatic exponential backoff retry, zero internal env variable leaks, and a clean README.

**Architecture:** A new `HttpClient` class wraps axios and owns all retry logic. An abstract `BaseModule` class holds an `HttpClient` instance and exposes a single `protected post<T>()` method. All four existing modules extend `BaseModule`, eliminating per-module constructor boilerplate and axios imports.

**Tech Stack:** TypeScript 5, axios ^1.6.0, Jest + ts-jest (added in Task 1)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `modules/HttpClient.ts` | Axios wrapper with exponential backoff retry |
| Create | `modules/BaseModule.ts` | Abstract base class exposing `post<T>()` |
| Create | `tests/HttpClient.test.ts` | Unit tests for retry behavior |
| Modify | `modules/KMAudit.ts` | Extend BaseModule, remove axios/constructor boilerplate |
| Modify | `modules/SemanticGraph.ts` | Same |
| Modify | `modules/Orchestrator.ts` | Same |
| Modify | `modules/Document.ts` | Same |
| Modify | `index.ts` | Add `RetryOptions` export, second constructor param, remove VITE leak |
| Modify | `package.json` | Add jest/ts-jest devDependencies, fix test script |
| Modify | `README.md` | Fix broken examples, remove internal env var names |

---

## Task 1: Set up Jest + ts-jest

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`

- [ ] **Step 1: Install test dependencies**

```bash
cd /path/to/kai-instance-api-sdk-js
npm install --save-dev jest ts-jest @types/jest
```

Expected: packages installed, no errors.

- [ ] **Step 2: Create jest.config.js**

Create `jest.config.js` at the project root:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
};
```

- [ ] **Step 3: Create tests directory**

```bash
mkdir -p tests
```

- [ ] **Step 4: Update package.json test script**

Open `package.json`. Replace:
```json
"test": "echo \"Error: no test specified\" && exit 1"
```
With:
```json
"test": "jest"
```

The full `scripts` block should look like:
```json
"scripts": {
  "test": "jest"
}
```

- [ ] **Step 5: Verify Jest is wired up**

Create a placeholder test at `tests/setup.test.ts`:

```typescript
describe('setup', () => {
  it('jest is configured', () => {
    expect(true).toBe(true);
  });
});
```

Run:
```bash
npx jest
```

Expected output (last lines):
```
PASS tests/setup.test.ts
Tests:       1 passed, 1 total
```

- [ ] **Step 6: Delete placeholder test**

```bash
rm tests/setup.test.ts
```

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json jest.config.js
git commit -m "chore: set up Jest + ts-jest for unit tests"
```

---

## Task 2: Create HttpClient with retry logic (TDD)

**Files:**
- Create: `modules/HttpClient.ts`
- Create: `tests/HttpClient.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/HttpClient.test.ts`:

```typescript
import axios from 'axios';
import { HttpClient } from '../modules/HttpClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(postFn: jest.Mock) {
  return { post: postFn } as any;
}

describe('HttpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns response.data.response on success', async () => {
    const mockPost = jest.fn().mockResolvedValueOnce({ data: { response: 'ok' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/');
    const result = await client.post('api/test', {});

    expect(result).toBe('ok');
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith('api/test', {});
  });

  it('retries on 5xx and eventually throws', async () => {
    const error = { response: { status: 500 } };
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 2, retryDelay: 10 });

    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockPost).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('does not retry on 4xx', async () => {
    const error = { response: { status: 404 } };
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 3, retryDelay: 10 });

    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('retries on network error (no response) and recovers', async () => {
    const networkError = { response: undefined, message: 'Network Error' };
    const mockPost = jest.fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({ data: { response: 'recovered' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 2, retryDelay: 10 });
    const result = await client.post('api/test', {});

    expect(result).toBe('recovered');
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('uses exponential backoff between retries', async () => {
    const delays: number[] = [];
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: any, ms?: number) => {
      delays.push(ms ?? 0);
      fn();
      return 0 as any;
    });

    const error = { response: { status: 503 } };
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 3, retryDelay: 1000 });
    await expect(client.post('api/test', {})).rejects.toEqual(error);

    expect(delays).toEqual([1000, 2000, 4000]); // 1000*2^0, 1000*2^1, 1000*2^2
    jest.restoreAllMocks();
  });

  it('uses default maxRetries=3 and retryDelay=1000 when not specified', async () => {
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => { fn(); return 0 as any; });

    const error = { response: { status: 500 } };
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/');
    await expect(client.post('api/test', {})).rejects.toEqual(error);

    expect(mockPost).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    jest.restoreAllMocks();
  });
});
```

- [ ] **Step 2: Run tests — verify they all fail**

```bash
npx jest tests/HttpClient.test.ts
```

Expected: FAIL — `Cannot find module '../modules/HttpClient'`

- [ ] **Step 3: Create HttpClient implementation**

Create `modules/HttpClient.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private readonly instance: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    this.maxRetries = retryOptions?.maxRetries ?? 3;
    this.retryDelay = retryOptions?.retryDelay ?? 1000;
    this.instance = axios.create({ baseURL: baseUrl, headers });
  }

  async post<T>(endpoint: string, data: object = {}): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.instance.post(endpoint, data);
        return response.data.response as T;
      } catch (err: any) {
        const isServerError = !err.response || err.response.status >= 500;
        if (!isServerError || attempt === this.maxRetries) {
          throw err;
        }
        await this.sleep(this.retryDelay * Math.pow(2, attempt));
      }
    }
    // unreachable — loop always throws or returns
    throw new Error('Unexpected end of retry loop');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

- [ ] **Step 4: Run tests — verify they all pass**

```bash
npx jest tests/HttpClient.test.ts
```

Expected output (last lines):
```
PASS tests/HttpClient.test.ts
Tests:       6 passed, 6 total
```

- [ ] **Step 5: Commit**

```bash
git add modules/HttpClient.ts tests/HttpClient.test.ts
git commit -m "feat: add HttpClient with exponential backoff retry"
```

---

## Task 3: Create BaseModule abstract class

**Files:**
- Create: `modules/BaseModule.ts`

- [ ] **Step 1: Create BaseModule**

Create `modules/BaseModule.ts`:

```typescript
import { HttpClient, RetryOptions } from './HttpClient';

export abstract class BaseModule {
  private readonly http: HttpClient;

  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    this.http = new HttpClient(headers, baseUrl, retryOptions);
  }

  protected post<T>(endpoint: string, data: object = {}): Promise<T> {
    return this.http.post<T>(endpoint, data);
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add modules/BaseModule.ts
git commit -m "feat: add BaseModule abstract class"
```

---

## Task 4: Migrate KMAudit to extend BaseModule

**Files:**
- Modify: `modules/KMAudit.ts`

- [ ] **Step 1: Replace KMAudit.ts with the migrated version**

Open `modules/KMAudit.ts` and replace the entire file content with:

```typescript
import { BaseModule } from './BaseModule';
import { RetryOptions } from './HttpClient';

export enum AnomalyState {
  MANAGED = 'managed',
  IGNORED = 'ignored',
  DETECTED = 'detected',
  REDETECTED = 'redetected',
  DISAPPEARED = 'disappeared'
}

export interface AnomalyInformationDocument {
  doc_id: string;
  information_involved: string;
}

export interface Anomaly {
  id: string;
  subject: string;
  state: string;
  documents: AnomalyInformationDocument[];
  explanation: string;
}

export interface DocumentAnomalies {
  conflicts: Anomaly[];
}

export interface AnomalyTypeNumber {
  subject: string;
  count: number;
  count_detected: number;
  count_managed: number;
  count_ignored: number;
  count_redetected: number;
  count_disappeared: number;
}

export class KMAudit extends BaseModule {
  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    super(headers, baseUrl, retryOptions);
  }

  async updateConflictState(id: string, state: AnomalyState): Promise<boolean> {
    return this.post('api/audit/conflict-information/set-state', { id, state });
  }

  async countConflicts(): Promise<number> {
    return this.post('api/audit/count-conflict-information', {});
  }

  async listConflicts(limit: number = 200, offset: number = 0, query?: string, document_name?: string, state?: AnomalyState): Promise<Anomaly[]> {
    return this.post('api/audit/conflict-information', { limit, offset, query, document_name, state });
  }

  async countAnomaliesPerDocument(limit: number = 20, offset: number = 0, document_ids?: string[]): Promise<Record<string, Record<string, number>>> {
    return this.post('api/audit/document-ids-to-manage', { limit, offset, document_ids });
  }

  async getAnomaliesForDocument(document_id: string): Promise<DocumentAnomalies> {
    return this.post('api/audit/get-anomalies-for-document', { id: document_id });
  }

  async countConflictsForPeriod(begin_date: string, end_date: string, state?: string): Promise<Record<string, Record<string, number>>> {
    return this.post('api/audit/count-conflict-by-date', { begin_date, end_date, state });
  }

  async countConflictsByState(state: string): Promise<number> {
    return this.post('api/audit/count-conflicts-by-state', { state });
  }

  async getConflictDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string, state?: string, sortOrder?: string): Promise<any[]> {
    return this.post('api/audit/get-conflict-document-pair', { limit, offset, document_name, state, order: sortOrder });
  }

  async getConflictsByDocumentPair(document_ids: string[], limit: number = 200, offset: number = 0, state: string = ''): Promise<Anomaly[]> {
    return this.post('api/audit/get-conflicts-by-document-id-pair', { document_ids, limit, offset, state });
  }

  async countConflictsPerSubject(document_ids?: string[]): Promise<AnomalyTypeNumber[]> {
    const raw: any[] = await this.post('api/audit/count-conflict-by-subject', { document_ids });
    return raw.map(item => ({
      subject: item.subject,
      count: parseInt(item.count),
      count_detected: parseInt(item.count_detected),
      count_managed: parseInt(item.count_managed),
      count_ignored: parseInt(item.count_ignored),
      count_redetected: parseInt(item.count_redetected),
      count_disappeared: parseInt(item.count_disappeared),
    }));
  }

  async getConflictsBySubject(subject?: string, offset: number = 0, limit: number = 50): Promise<Anomaly[]> {
    return this.post('api/audit/get-conflict-information-by-subject', { subject, offset, limit });
  }

  async checkIfDocumentIsAudited(document_id: string): Promise<boolean> {
    return this.post('api/audit/document-is-analyzed', { id: document_id });
  }

  async countConflictsByDocumentId(document_ids: string[], state?: AnomalyState): Promise<number> {
    const raw: string = await this.post('api/audit/count-conflict-by-document-ids', { document_ids, state });
    return parseInt(raw);
  }
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Run all tests**

```bash
npx jest
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add modules/KMAudit.ts
git commit -m "refactor: migrate KMAudit to extend BaseModule"
```

---

## Task 5: Migrate SemanticGraph to extend BaseModule

**Files:**
- Modify: `modules/SemanticGraph.ts`

- [ ] **Step 1: Replace SemanticGraph.ts with the migrated version**

Open `modules/SemanticGraph.ts` and replace the entire file content with:

```typescript
import { BaseModule } from './BaseModule';
import { RetryOptions } from './HttpClient';

export interface PartialDocument {
  id: string;
  content: string[];
}

export interface IdentifiedNode {
  id: string;
  node1: string;
  node2: string;
  edge: string;
  documents: PartialDocument[] | string[];
}

export interface SemanticNodeExtraproperties {
  documents: string[];
  chunks: string[];
  count: number;
}

export interface SemanticNode {
  id: string;
  node_1: string;
  node_2: string;
  edge: string;
  extraproperties: SemanticNodeExtraproperties;
}

export class SemanticGraph extends BaseModule {
  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    super(headers, baseUrl, retryOptions);
  }

  async getNodes(limit: number = 20, offset: number = 0): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/nodes', { limit: limit || 20, offset: offset || 0 });
  }

  async getNodeByLabel(label: string): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/nodes-by-label', { label });
  }

  async identifyNodes(query: string, needDocumentsContent: boolean = false): Promise<IdentifiedNode[]> {
    return this.post('api/semantic-graph/identify-nodes', { query, need_documents_content: needDocumentsContent });
  }

  async linkedNodesById(id: string): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/linked-nodes-by-id', { id });
  }
}
```

- [ ] **Step 2: Type-check and run tests**

```bash
npx tsc --noEmit && npx jest
```

Expected: no type errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add modules/SemanticGraph.ts
git commit -m "refactor: migrate SemanticGraph to extend BaseModule"
```

---

## Task 6: Migrate Orchestrator to extend BaseModule

**Files:**
- Modify: `modules/Orchestrator.ts`

- [ ] **Step 1: Replace Orchestrator.ts with the migrated version**

Open `modules/Orchestrator.ts` and replace the entire file content with:

```typescript
import { BaseModule } from './BaseModule';
import { RetryOptions } from './HttpClient';

export class Orchestrator extends BaseModule {
  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    super(headers, baseUrl, retryOptions);
  }

  async launchPartialIndexation(): Promise<boolean> {
    return this.post('api/orchestrator/differential-indexation', {});
  }

  async reindexDocument(document_id: string): Promise<boolean> {
    return this.post('api/orchestrator/reindex-document', { id: document_id });
  }

  async retryIndexErrorParsingDocuments(): Promise<boolean> {
    return this.post('api/orchestrator/retry-documents-parsing-error', {});
  }

  async countRegisteredBackgroundTasks(): Promise<Record<string, number>> {
    return this.post('api/orchestrator/count-back-tasks', {});
  }

  async countRegisteredBackgroundTasksForDoc(document_id: string): Promise<Record<string, number>> {
    return this.post('api/orchestrator/count-tasks-for-doc', { id: document_id });
  }
}
```

- [ ] **Step 2: Type-check and run tests**

```bash
npx tsc --noEmit && npx jest
```

Expected: no type errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add modules/Orchestrator.ts
git commit -m "refactor: migrate Orchestrator to extend BaseModule"
```

---

## Task 7: Migrate Document to extend BaseModule

**Files:**
- Modify: `modules/Document.ts`

- [ ] **Step 1: Replace Document.ts with the migrated version**

Open `modules/Document.ts` and replace the entire file content with:

```typescript
import { BaseModule } from './BaseModule';
import { RetryOptions } from './HttpClient';

export interface DocumentSignatureExtraproperties {
  audit_done: boolean;
  kb_signature: Record<string, string>;
  kai_internal_state: string;
  kai_internal_count_chunks: number;
  [key: string]: any;
}

export interface DocumentSignature {
  id: string;
  name: string;
  url?: string;
  extraproperties: DocumentSignatureExtraproperties;
  [key: string]: any;
}

export class Document extends BaseModule {
  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    super(headers, baseUrl, retryOptions);
  }

  async listDocuments(offset: number = 0, limit: number = 20, state?: string): Promise<DocumentSignature[]> {
    return this.post('api/document/list-docs', { offset, limit, state });
  }

  async getDocumentDetail(id: string): Promise<DocumentSignature | null> {
    return this.post('api/document/doc', { id });
  }

  async countDocuments(state?: string, documentIds?: string[]): Promise<number> {
    const payload: Record<string, any> = {};
    if (state !== undefined) payload.state = state;
    if (documentIds) payload.document_ids = documentIds;
    return this.post('api/document/count-documents', payload);
  }

  async downloadFile(documentId: string): Promise<any> {
    return this.post('api/document/download', { id: documentId });
  }

  async docsByIds(ids: string[], offset: number = 0, limit: number = 20): Promise<DocumentSignature[]> {
    return this.post('api/document/docs-by-ids', { ids, offset, limit });
  }
}
```

**Note:** `downloadFile` previously used `responseType: 'arraybuffer'` directly on the axios call. This is now handled by the standard `post` method — the binary response will be returned as-is from `response.data.response`. If the backend returns the raw binary at `response.data` rather than `response.data.response`, you'll need a separate `download` method on `HttpClient` — but confirm with the API before adding it.

- [ ] **Step 2: Type-check and run tests**

```bash
npx tsc --noEmit && npx jest
```

Expected: no type errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add modules/Document.ts
git commit -m "refactor: migrate Document to extend BaseModule"
```

---

## Task 8: Update index.ts — add RetryOptions, remove env leak

**Files:**
- Modify: `index.ts`

- [ ] **Step 1: Replace index.ts with the cleaned-up version**

Open `index.ts` and replace the entire file content with:

```typescript
import { KMAudit } from './modules/KMAudit';
import { SemanticGraph } from './modules/SemanticGraph';
import { Orchestrator } from './modules/Orchestrator';
import { Document } from './modules/Document';
import { RetryOptions } from './modules/HttpClient';

export { RetryOptions } from './modules/HttpClient';

export interface KaiStudioCredentials {
  instanceId?: string;
  apiKey?: string;
  host?: string;
  Authorization?: string;
  apiHost?: string;
}

export enum State {
  INITIAL_SAVED = 'INITIAL_SAVED',
  UPDATED = 'UPDATED',
  ON_CONTENT_EXTRACT = 'ON_CONTENT_EXTRACT',
  CONTENT_EXTRACTED = 'CONTENT_EXTRACTED',
  ON_INDEXATION = 'ON_INDEXATION',
  INDEXED = 'INDEXED',
  PARSING_ERROR = 'PARSING_ERROR'
}

export class KaiInstanceApi {
  private credentials: KaiStudioCredentials;
  private _auditInstance: KMAudit;
  private _semanticGraph: SemanticGraph;
  private _orchestrator: Orchestrator;
  private _document: Document;

  constructor(credentials: KaiStudioCredentials, retryOptions?: RetryOptions) {
    this.credentials = credentials;

    const headers = this.buildHeaders(credentials);
    const baseUrl = this.resolveBaseUrl(credentials);

    this._auditInstance = new KMAudit(headers, baseUrl, retryOptions);
    this._semanticGraph = new SemanticGraph(headers, baseUrl, retryOptions);
    this._orchestrator = new Orchestrator(headers, baseUrl, retryOptions);
    this._document = new Document(headers, baseUrl, retryOptions);
  }

  private buildHeaders(credentials: KaiStudioCredentials): Record<string, string> {
    const headers: Record<string, string> = {};

    if (credentials.instanceId) headers['instance-id'] = credentials.instanceId;
    if (credentials.apiKey) headers['api-key'] = credentials.apiKey;
    if (credentials.Authorization) headers['Authorization'] = credentials.Authorization;
    if (credentials.apiHost) headers['api-host'] = credentials.apiHost;

    return headers;
  }

  private resolveBaseUrl(credentials: KaiStudioCredentials): string {
    if (credentials.host) return credentials.host;
    return 'https://api.kai-studio.ai/';
  }

  public getCredentials(): KaiStudioCredentials {
    return this.credentials;
  }

  public auditInstance(): KMAudit {
    return this._auditInstance;
  }

  public semanticGraph(): SemanticGraph {
    return this._semanticGraph;
  }

  public orchestrator(): Orchestrator {
    return this._orchestrator;
  }

  public document(): Document {
    return this._document;
  }
}
```

Key changes from the original:
- `VITE_APP_API_URL` fallback removed from `resolveBaseUrl`
- `buildHeaders` simplified — no more duplicated conditionals
- `KaiStudioCredentials` fields typed as `string` instead of `any`
- `retryOptions?: RetryOptions` added as second constructor parameter
- `RetryOptions` re-exported for SDK consumers

- [ ] **Step 2: Type-check and run tests**

```bash
npx tsc --noEmit && npx jest
```

Expected: no type errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add index.ts
git commit -m "feat: add RetryOptions to KaiInstanceApi, remove VITE_APP_API_URL leak"
```

---

## Task 9: Update README.md

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace README.md with the corrected version**

Open `README.md` and replace the entire file content with:

```markdown
# kai-instance-api-sdk-js

TypeScript/JavaScript SDK for the Kai Studio API.

## Installation

```bash
npm install file:path/to/kai-instance-api-sdk-js --save
```

## Quick Start

```typescript
import { KaiInstanceApi } from 'kai-instance-api-sdk-js';

// SaaS (cloud-hosted)
const api = new KaiInstanceApi({
  instanceId: 'YOUR_INSTANCE_ID',
  apiKey: 'YOUR_API_KEY',
});

// Premise (self-hosted)
const api = new KaiInstanceApi({
  host: 'https://your-server.example.com/',
  apiKey: 'YOUR_API_KEY', // optional for premise
});
```

## Retry Configuration

By default the SDK retries failed requests up to 3 times with exponential backoff (1s → 2s → 4s). Retries apply to network errors and HTTP 5xx responses only.

Override the defaults via the optional second constructor argument:

```typescript
const api = new KaiInstanceApi(
  { instanceId: 'YOUR_INSTANCE_ID', apiKey: 'YOUR_API_KEY' },
  { maxRetries: 5, retryDelay: 500 }
);
```

## Modules

There are two deployment modes (SaaS and Premise) and four modules:

| Module | Accessor | Purpose |
|---|---|---|
| [Document](#document) | `.document()` | List, fetch, count, download documents |
| [Audit](#audit) | `.auditInstance()` | Manage conflict anomalies |
| [Orchestrator](#orchestrator) | `.orchestrator()` | Trigger indexation, monitor background tasks |
| [SemanticGraph](#semanticgraph) | `.semanticGraph()` | Explore knowledge graph nodes |

---

### Document

`modules/Document.ts` — methods for managing documents.

- `listDocuments(offset?, limit?, state?)` — list documents; optional state filter
- `getDocumentDetail(id)` — fetch one document by ID
- `countDocuments(state?, documentIds?)` — count documents; optional filters
- `downloadFile(documentId)` — download raw file content by ID
- `docsByIds(ids, offset?, limit?)` — fetch multiple documents by ID array

```typescript
const docs = await api.document().listDocuments(0, 20, 'INDEXED');
console.log(`Found ${docs.length} documents`);
```

---

### Audit

`modules/KMAudit.ts` — methods for auditing conflict anomalies in documents.

- `listConflicts(limit?, offset?, query?, document_name?, state?)` — list conflicts
- `countConflicts()` — total conflict count
- `updateConflictState(id, state)` — set state on a conflict (`AnomalyState` enum)
- `countAnomaliesPerDocument(limit?, offset?, document_ids?)` — conflicts per document
- `getAnomaliesForDocument(document_id)` — all anomalies for one document
- `countConflictsForPeriod(begin_date, end_date, state?)` — conflicts in a date range
- `countConflictsByState(state)` — count by state string
- `getConflictsBySubject(subject?, offset?, limit?)` — conflicts filtered by subject
- `countConflictsPerSubject(document_ids?)` — counts grouped by subject
- `getConflictsByDocumentPair(document_ids, limit?, offset?, state?)` — conflicts between two documents
- `getConflictDocumentPairs(limit?, offset?, document_name?, state?, sortOrder?)` — document pairs with conflicts
- `countConflictsByDocumentId(document_ids, state?)` — conflict count for given IDs
- `checkIfDocumentIsAudited(document_id)` — whether a document has been analyzed

```typescript
const conflicts = await api.auditInstance().listConflicts(10, 0);
console.log(`Conflicts found: ${conflicts.length}`);
```

---

### Orchestrator

`modules/Orchestrator.ts` — indexation triggers and background task monitoring.

- `launchPartialIndexation()` — trigger differential indexation
- `reindexDocument(document_id)` — reindex a specific document
- `retryIndexErrorParsingDocuments()` — retry all documents in PARSING_ERROR state
- `countRegisteredBackgroundTasks()` — count all background tasks
- `countRegisteredBackgroundTasksForDoc(document_id)` — tasks for a specific document

```typescript
await api.orchestrator().launchPartialIndexation();
```

---

### SemanticGraph

`modules/SemanticGraph.ts` — knowledge graph node exploration.

- `getNodes(limit?, offset?)` — list semantic nodes
- `getNodeByLabel(label)` — nodes matching a label
- `identifyNodes(query, needDocumentsContent?)` — nodes relevant to a query
- `linkedNodesById(id)` — nodes linked to a given node

```typescript
const nodes = await api.semanticGraph().getNodes(10, 0);
console.log(nodes);
```

---

### Document States

```typescript
import { State } from 'kai-instance-api-sdk-js';

// State values:
State.PARSING_ERROR       // unsupported document type
State.INITIAL_SAVED       // document saved, not yet processed
State.UPDATED             // document metadata updated
State.ON_CONTENT_EXTRACT  // content extraction in progress
State.CONTENT_EXTRACTED   // content extracted, chunks saved
State.ON_INDEXATION       // indexation in progress
State.INDEXED             // fully indexed, ready for queries
```

## Contributing

bxu@k-ai.ai · rmei@k-ai.ai · sngo@k-ai.ai
```

- [ ] **Step 2: Run type-check and tests one final time**

```bash
npx tsc --noEmit && npx jest
```

Expected: no errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: rewrite README — fix examples, remove internal env vars, add retry config docs"
```
```

Now let me do the self-review.
