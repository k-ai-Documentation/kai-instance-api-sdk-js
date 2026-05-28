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
