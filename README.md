# sdk-js

## Introduction

SDK js/ts enables developers to efficiently perform searches, handle thematic content, and conduct audits. This toolkit is designed to streamline the integration of complex functionalities into js/ts-based projects.

## Installation

To integrate the SDK into your project, include the SDK files in your project directory. Then, use the following require
statements in your project root directory:

```bash
npm install file:path/to/sdk-js --save
```

## Quick start

Here's a simple example to get you started with the SDK. This example demonstrates how to instantiate a new search and
perform basic operations:

```js
import {KaiStudioInstance} from "sdk-js"

// for saas KaiStudioInstance
const kaiSearch = new KaiStudio({
    instanceId: process.env.VUE_APP_INSTANCE_ID,
    apiKey: process.env.VUE_APP_API_KEY
})
// for premise user
const kaiSearch = new KaiStudioInstance({host: process.env.VUE_APP_HOST, apiKey: process.env.VUE_APP_HOST})

// send your search request
const request = await kaiSearch.search().query("YOUR QUESTION HERE", "");
console.log(request)
```

## Usage Guide

There are two type of versions: SaaS version and Premise version.

SaaS version means you are using the service provided by Kai with cloud service. In this case, you will need 2 keys (instanceId, apiKey) to initialize kaiStudio. Please refer to the following code in [index.ts](index.ts):

```js
if (this.credentials.instanceId && this.credentials.apiKey) {
    headers = {
        'instance-id': this.credentials.instanceId,
        'api-key': this.credentials.apiKey
    }

    baseUrl = `https://app.kai-studio.ai/`
}
```

Premise version means you are using the service in your local server in your enterprise. In this case, you will need
host and api key (optional) to initialize kaiStudio. Please refer to the following code in [index.ts](index.ts):

```js
if (this.credentials.host) {
    baseUrl = this.credentials.host
    if (this.credentials.apiKey) {
        headers = {
            'api-key': this.credentials.apiKey
        }
    }
}
```

---

There are 4 modules in the SDK:

| [Document](#document) | [Audit](#audit) | [Orchestrator](#orchestrator) | [SemanticGraph](#semanticgraph) |

### Document

[Document.ts](modules/Document.ts) provides methods for managing documents.

- `listDocuments`: list all documents
  > offset: number of results to skip (default 0)
  > limit: maximum number of results to return (default 20)
  > state: optional document state filter

- `getDocumentDetail`: get a document by its ID
  > id: ID of the document to retrieve

- `countDocuments`: count the total number of documents
  > state: optional document state filter

- `downloadFile`: download a document file by its ID
  > documentId: ID of the document to download

- `docsByIds`: get document information for multiple document IDs
  > ids: array of document IDs to retrieve
  > offset: number of results to skip (default 0)
  > limit: maximum number of results to return (default 20)

Example:

```typescript
const document = kaiStudioInstance.document();

// List documents
const docs = await document.listDocuments(0, 20, 'INDEXED');
console.log(`Found ${docs.length} documents`);
```

---

### Audit

[KMAudit.ts](modules/KMAudit.ts) provides methods for auditing and managing conflict anomalies in documents.

- `listConflicts`: Get conflict information  
  > limit: maximum number of results to return (default 200)
  > offset: number of results to skip (default 0)
  > query: optional search query
  > document_name: optional document name to filter
  > state: optional state filter (AnomalyState)

- `countConflicts`: Count conflict information

- `countAnomaliesPerDocument`: List documents with counts of conflicts  
  > limit: maximum number of results to return (default 20)
  > offset: number of results to skip (default 0)

- `getAnomaliesForDocument`: Get anomalies for a document  
  > document_id: ID of the document to analyze

- `updateConflictState`: Set the state for conflict information  
  > id: ID of the conflict information
  > state: state to set (AnomalyState)

- `countConflictsForPeriod`: Count conflicts within a date range  
  > begin_date: start date for the period
  > end_date: end date for the period
  > state: optional state filter

- `countConflictsByState`: Count conflicts by state  
  > state: state to filter by

- `getConflictsBySubject`: Get conflict information by subject  
  > subject: optional subject name to filter by
  > offset: number of results to skip (default 0)
  > limit: maximum number of results to return (default 50)

- `countConflictsPerSubject`: Count conflicts grouped by subject  
  > document_ids: optional array of document IDs to filter

- `getConflictsByDocumentPair`: Get conflicts between specific documents  
  > document_ids: array of document IDs to analyze
  > limit: maximum number of results to return (default 200)
  > offset: number of results to skip (default 0)
  > state: optional state filter

- `getConflictDocumentPairs`: Get conflict document pairs  
  > limit: maximum number of results to return (default 200)
  > offset: number of results to skip (default 0)
  > document_name: optional document name to filter

- `countConflictsByDocumentId`: Count conflicts for a list of document IDs  
  > document_ids: array of document IDs
  > state: optional state filter

- `checkIfDocumentIsAudited`: Check if a document has been analyzed  
  > document_id: ID of the document to check

For example:

```js

const audit = kaiStudioInstance.auditInstance();

// List conflicts
audit.listConflicts(10, 0).then(conflicts => {
    console.log("CONFLICTS FOUND:", conflicts.length);
    console.log(conflicts);
});
```

---

### SemanticGraph

[SemanticGraph.ts](modules/SemanticGraph.ts) provides methods for managing semantic graphs.

- `getNodes`: List all generated semantic nodes  
  > limit: limit of elements returned  
  > offset: begin listing with this offset
- `linkedNodesById`: Get all linked nodes of one selected node  
  > id: id of the reference node
- `getNodeByLabel`: Get all nodes involved by the label tag  
  > label: label tag
- `identifyNodes`: Identify nodes that can be used to define the semantic context of the query  
  > query: query searched  
  > need_documents_content: whether response needs document content

For example:

```js
let semantic = KaiStudioInstance.semanticGraph()
semantic.getNodes(10, 0).then(response => {
    console.log("GET NODES:")
    console.log(response)
})
```

---

#### state-document 
We have 7 states for a document:

```ts
'PARSING_ERROR', // document type is not supported
'INITIAL_SAVED', // initial save
"UPDATED", // document is updated (without the content) par rapport à l'API
'ON_CONTENT_EXTRACT', // document content is currently is working on fileparser
'CONTENT_EXTRACTED', // document content is fetch from fileparser and chunks is saved
'ON_INDEXATION', // document is in indexation progress
'INDEXED' // document is fully indexed
```

## Contributing

bxu@k-ai.ai

rmei@k-ai.ai

sngo@k-ai.ai

