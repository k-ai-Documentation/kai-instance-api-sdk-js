# sdk-js

## Introduction

SDK js/ts enables developers to efficiently manage files, instance, perform searches, handle thematic content, and
conduct audits. This toolkit is designed to streamline the integration of complex functionalities into js/ts-based
projects.

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
import {KaiStudio} from "sdk-js"

// for saas user
const kaiSearch = new KaiStudio({
    organizationId: process.env.VUE_APP_ORGANIZATION_ID,
    instanceId: process.env.VUE_APP_INSTANCE_ID,
    apiKey: process.env.VUE_APP_API_KEY
})
// for premise user
const kaiSearch = new KaiStudio({host: process.env.VUE_APP_HOST, apiKey: process.env.VUE_APP_HOST})

// send your search request
const request = await kaiSearch.search().query("YOUR QUESTION HERE", "");
console.log(request)
```

## Usage Guide

There are two type of versions: SaaS version and Premise version.

SaaS version means you are using the service provided by Kai with cloud service. In this case, you will need 3 keys (
organizationId, instanceId, apiKey) to initialize kaiStudio. Please refer to the following code in [index.ts](index.ts):

```js
if (this.credentials.organizationId && this.credentials.instanceId && this.credentials.apiKey) {
    headers = {
        'api-key': this.credentials.apiKey
    }

    baseUrl = `https://${this.credentials.organizationId}.kai-studio.ai/${this.credentials.instanceId}/`
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

There are 5 modules in the SDK:

| [Core](#core) | [Audit](#audit) | [ManageInstance](#manageinstance) | [SemanticGraph](#semanticgraph) | [Search](#search) |
[Chatbot](#chatbot) |

### Core

[Core.ts](modules/Core.ts) provides methods for querying the status of documents.

- `countDocuments`: Get number of documents analyzed
- `countDetectedDocuments`: Get number of detected documents
- `countIndexableDocuments`: Get number of indexable documents
- `countIndexedDocuments`: Get number of indexed documents
- `countInProgressIndexationDocuments`: Get number of in-progress indexation documents
- `countDocumentsByState`: Get number of documents by state  
  > state: (optional) state of the document you want to get back, if not set, returns all docs
- `listDocs`: List documents with state and pagination  
  > limit: number of content to return  
  > offset: number of content to skip before starting to collect the result set  
  > state: (optional) state of the document
- `downloadFile`: Download file  
  > fileId: document id
- `indexNewOrUpdatedDocument`: Index only new/updated/removed documents
- `listIndexedDocuments`: List indexed documents  
  > limit: number of content to return  
  > offset: number of content to skip before starting to collect the result set
- `lastIndexationBeginTime`: Get last indexation begin time
- `lastIndexationEndTime`: Get last indexation end time
- `checkPendingJob`: Get information about instance background jobs in progress
- `getDocumentById`: Get document by id
  > docId: document id

For example:

```js
let core = kaiStudio.core()
core.countDocuments().then(response => {
    console.log("COUNT DOCUMENTS:")
    console.log(response)
})
```

---

### Audit

[KMAudit.ts](modules/KMAudit.ts) provides methods for auditing files.

- `getConflictInformation`: Get conflict information  
  > limit, offset, query, state
- `getDuplicatedInformation`: Get duplicated information  
  > limit, offset, query, state
- `getDocumentsToManageList`: List documents containing conflicts or duplicates  
  > limit, offset
- `getDocumentIdsToManageList`: List document IDs containing conflicts or duplicates
- `getMissingSubjectList`: List missing subjects  
  > limit, offset
- `countMissingSubjects`: Count missing subjects
- `countDuplicatedInformation`: Count duplicated information
- `countConflictInformation`: Count conflict information
- `getAnomaliesForDoc`: Get anomalies (conflicts and duplicates) for a document  
  > docId
- `conflictInformationSetState`: Set the state for a conflict information  
  > id, state
- `duplicatedInformationSetState`: Set the state for a duplicated information  
  > id, state
- `countConflictByDate`: Count conflicts within a date range  
  > beginDate, endDate, state
- `countDuplicateByDate`: Count duplicates within a date range  
  > beginDate, endDate, state
- `getConflictInformationBySubject`: Get conflict information by subject  
  > subject, limit, offset
- `countConflictInformationBySubject`: Count conflicts grouped by subject
- `getDuplicateInformationBySubject`: Get duplicate information by subject  
  > subject, limit, offset
- `countDuplicatedInformationBySubject`: Count duplicates grouped by subject
- `getDuplicateInformationByDocuments`: Get duplicates by document IDs  
  > docIds
- `getConflictInformationByDocuments`: Get conflicts by document IDs  
  > docIds
- `getDuplicateInformationDocumentPair`: Get duplicate document pairs  
  > limit, offset, documentName
- `getConflictInformationDocumentPair`: Get conflict document pairs  
  > limit, offset, documentName

For example:

```js
let auditInstance = kaiStudio.auditInstance()
auditInstance.getConflictInformation(10, 0).then(response => {
    console.log("CONFLICT INFORMATION:")
    console.log(response)
})
```

---

### ManageInstance

[ManageInstance.ts](modules/ManageInstance.ts) provides methods for managing instances.

- `getGlobalHealth`: Get global health
- `isApiAlive`: Check if API is alive
- `generateNewApiKey`: Generate a new API key
- `updateName`: Update the instance name  
  > name: new name for the instance
- `deploy`: Deploy an instance
- `delete`: Delete an instance
- `addKb`: Add a knowledge base to the instance  
  > type: type of knowledge base  
  > options: configuration options  
  > searchGoal: search goal associated with the KB
- `setPlayground`: Set playground types for the instance  
  > typeList: array of playground types
- `updateKb`: Update a knowledge base  
  > id: ID of the knowledge base  
  > options: updated configuration options  
  > searchGoal: updated search goal
- `removeKb`: Remove a knowledge base from the instance  
  > id: ID of the knowledge base
- `getVersion`: Get API version

For example:

```js
let manageInstance = kaiStudio.manageInstance()
manageInstance.getGlobalHealth().then(response => {
    console.log("GET GLOBAL HEALTH:")
    console.log(response)
})
```

---

### Search

[Search.ts](modules/Search.ts) provides methods for searching.

- `query`: Make a search on the semantic index  
  > query: query to search on the semantic index  
  > user: (optional) user identifier  
  > impersonate: name a profile to imitate the style of answer (e.g., "Knowledge manager")  
  > multiDocuments: true to search across multiple documents  
  > needFollowingQuestions: true to get follow-up questions
- `countDoneRequests`: Count number of calls on search (`/query`) endpoint
- `countAnsweredDoneRequests`: Count number of calls on search (`/query`) endpoint where KAI found an answer
- `listQuestionsAsked`: Get requests made to the API  
  > offset: number of content to skip before starting to collect the result set  
  > limit: number of content to return
- `identifySpecificDocument`: Identify a concise question following the user needs and documents from knowledge base  
  > conversation: array of conversation messages, each with `{ from: 'user' | 'assistant', message: string }`
- `countSearchNumberByDate`: Count search requests within a date range  
  > beginDate: start date (e.g., "2025-01-23")  
  > endDate: end date (e.g., "2025-01-29")
- `countAnsweredSearchByDate`: Count answered search requests within a date range  
  > beginDate: start date  
  > endDate: end date

For example:

```js
let search = kaiStudio.search()
search.query("what is the history of France TV?", "userid", "", false, true).then(response => {
    console.log("SEARCH QUERY:")
    console.log(response)
})
```

---

### SemanticGraph

[SemanticGraph.ts](modules/SemanticGraph.ts) provides methods for managing semantic graphs.

- `getNodes`: List all generated semantic nodes  
  > limit: limit of elements returned  
  > offset: begin listing with this offset
- `getLinkedNodes`: Get all linked nodes of one selected node  
  > id: id of the reference node
- `getNodeByLabel`: Get all nodes involved by the label tag  
  > label: label tag
- `detectApproximalNodes`: Identify nodes that can be used to define the semantic context of the query  
  > query: query searched  
  > need_documents_content: whether response needs document content

For example:

```js
let semantic = kaiStudio.semanticGraph()
semantic.getNodes(10, 0).then(response => {
    console.log("GET NODES:")
    console.log(response)
})
```

---

### Chatbot

[Chatbot.ts](modules/Chatbot.ts) provides methods for chatting.

- `getFullConversation`: List all conversations of a given id  
  > id: id of conversation
- `conversation`: Send a user message and get a chatbot response  
  > id: (string) conversation id, for first message no id needed  
  > user_message: (string) user's last message  
  > multi_documents: (boolean) search with multiple documents  
  > user_id: (string, optional) user id to identify the user question in logs

For example:

```js
let chatbot = kaiStudio.chatbot()
chatbot.getFullConversation("abcdedfg").then(response => {
    console.log("FULL CONVERSATION: ")
    console.log(response)
})
```

---

#### state-document 
We have 7 states for a document:

```ts
'TYPE_ERROR', // document type is not supported
'INITIAL_SAVED', // initial save
"UPDATED", // document is updated (without the content) par rapport à l'API
'ON_CONTENT_EXTRACT', // document content is currently is working on fileparser
'CONTENT_EXTRACTED', // document content is fetch from fileparser and chunks is saved
'ON_INDEXATION', // document is in indexation progress
'INDEXED' // document is fully indexed
```

<u>**For more examples, you can check the [example.ts](example.ts) file.**</u>

## Contributing

bxu@k-ai.ai

rmei@k-ai.ai

sngo@k-ai.ai

