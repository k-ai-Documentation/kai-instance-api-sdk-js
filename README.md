# sdk-js

## Introduction
SDK js/ts enables developers to efficiently manage files, instance, perform searches, handle thematic content, and conduct audits. This toolkit is designed to streamline the integration of complex functionalities into js/ts-based projects.

## Installation
To integrate the SDK into your project, include the SDK files in your project directory. Then, use the following require statements in your project root directory:

```bash
npm install file:path/to/sdk-js --save
```

## Quick start
Here's a simple example to get you started with the SDK. This example demonstrates how to instantiate a new search and perform basic operations:
```js
import { KaiStudio } from "sdk-js"

// for saas user
const kaiSearch = new KaiStudio({ organizationId: process.env.VUE_APP_ORGANIZATION_ID, instanceId: process.env.VUE_APP_INSTANCE_ID, apiKey: process.env.VUE_APP_API_KEY })
// for premise user
const kaiSearch = new KaiStudio({ host: process.env.VUE_APP_HOST , apiKey: process.env.VUE_APP_HOST })

// send your search request
const request = await kaiSearch.search().query("YOUR QUESTION HERE", "");
console.log(request)
```

## Usage Guide
There are two type of versions: SaaS version and Premise version.

SaaS version means you are using the service provided by Kai with cloud service. In this case, you will need 3 keys (organizationId, instanceId, apiKey) to initialize kaiStudio. Please refer to the following code in [index.ts](index.ts):
```js
if (this.credentials.organizationId && this.credentials.instanceId && this.credentials.apiKey) {
    headers = {
        'api-key': this.credentials.apiKey
    }

    baseUrl = `https://${this.credentials.organizationId}.kai-studio.ai/${this.credentials.instanceId}/`
}
```

Premise version means you are using the service in your local server in your enterprise. In this case, you will need host and api key (optional) to initialize kaiStudio. Please refer to the following code in [index.ts](index.ts):
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

### Core
[Core.ts](modules/Core.ts) provides methods for quering the status of documents.
- countDocuments : get number of documents analyzed
- countDetectedDocuments : get number of detected documents
- countIndexableDocuments : get number of indexable document
- countIndexedDocuments : get number of indexed documents
- downloadFile : download file
    >id: document id
- indexNewOrUpdatedDocument : index only new/updated/removed documents
- getAllScenarios : List all available scenarios with theirs API signatures
- getLogs : Get KAI Semantic layer logs
    
    log types: LLM error 500, LLM error 503, LLM Limitation rate, Application information, Excel parser error, Ppt Parser error, Word Parser error, Image Parser error, PDF Parser Error, Markdown Parser Error, Html Parser Error
    >type: `type of log you want (like'Application information'), dont add if you want to get back all logs`
    
    >skip: 'pagination skip elements'

    >take: 'pagination take elements'
- reinitAll : Hard reset of KAI Semantic layer and reindex all datas, it can take a lot of time depending on the size of databases connected to KAI

For example:
```js
let core = kaiStudio.core()
core.countDocuments().then(response => {
    console.log("COUNT DOCUMENTS:")
    console.log(response)
})
```

### Audit
[KMAudit.ts](modules/KMAudit.ts) provides methods for auditing files.
- getConflictInformation : get back conflict information
    >limit: 'number of content to return'

    >offset: 'number of content to skip before starting to collect the result set'
- getDuplicatedInformation : get back duplicated information
    >limit: 'number of content to return',

    >offset: 'number of content to skip before starting to collect the result set'

- setConflictManaged : set the state to managed for a conflict information
    >id: 'id of the conflict information to set managed'

- setDuplicatedInformationManaged : set the state to managed for a duplicated information
    >id: 'id of the duplicated information to set managed'

- getDocumentsToManageList : list of all documents who contain conflict or duplicated information
    >limit: "number of content to skip before starting to collect the result set (default 20)"

    >offset: "number of content to return (default 0)"

- getMissingSubjectList : List all missing subjects following user queries
    >limit: "number of content to skip before starting to collect the result set (default 20)"

    >offset: "number of content to return (default 0)"

- getAllTasksLinkedToDocument : Get back all tasks linked to a document
    >id: "Id of the document"

For example:
```js
let auditInstance = kaiStudio.auditInstance()
auditInstance.getConflictInformation(10,0).then(response => {
    console.log("CONFLICT INFORMATION:")
    console.log(response)
})
```
### ManageInstance
[ManageInstance.ts](modules/ManageInstance.ts) provides methods for managing instance.
- getGlobalHealth : get global health
- isApiAlive : check if api is alive
- getVersion : get version

For example:
```js
let manageInstance = kaiStudio.manageInstance()
manageInstance.getGlobalHealth().then(response => {
    console.log("GET GLOBAL HEALTH:")
    console.log(response)
})
```

### Search
[Search.ts](modules/Search.ts) provides methods for searching.
- query : Make a search on the semantic index
    >query: 'query to search on the semantic index'

    >user: '(optional) user identifier to log for this query'

    >impersonate: 'name a profile to imitate the style of answer. eg: Knowledge manager or Sales man'

    >multiDocuments: 'true if you want to search across multiple documents, false if you want to retrieve an answer following only one document'
    
    >needFollowingQuestions: 'true if you want to the API purpose multiple next questions, else false'

- getDocSignature : get back a document signature
    >id: 'id of the document to get signature'

- getDocsIds : get back identified documents signature
    >docsIds: 'all docs ids'

- countDoneRequests : count number of call on search (/query) endpoint
- countAnsweredDoneRequests : count number of call on search (/query) endpoint where KAI find an answer
- listQuestionsAsked : get back requests made to the API
    >limit: 'number of content to return'
                    
    >offset: 'number of content to skip before starting to collect the result set'
- identifySpecificDocument : identify a concise question following the user needs and documents from knowledge base
    >conversation:`an array on a conversation of the user and the assistant, each row of the array follow the structure { from: 'user' | 'assistant', message: string }`

```js
let search = kaiStudio.search()
search.query("what is the history of France TV?", "userid", "", false, true).then(response => {
    console.log("SEARCH QUERY:")
    console.log(response)
})
```

### SemanticGraph
[SemanticGraph.ts](modules/SemanticGraph.ts) provides methods for managing semantic graph.
- getNodes : list all generated semantic nodes
    >limit: 'limit of elements returned'
    >offset: 'begin listing with this offset'
- getLinkedNodes : get all linked nodes of one selected node
    >id: 'Id of the reference node'
- getNodeByLabel : Get all nodes who is involved by the label tag
    >label: 'Label tag'
- detectApproximalNodes : Identify nodes who can be used to defined the semaantic context of the query
    >query: 'query searched'

For example:
```js
let semantic = kaiStudio.semanticGraph()
semantic.getNodes(10,0).then(response => {
    console.log("GET NODES:")
    console.log(response)
})
```


<u>**For more examples, you can check the [example.ts](example.ts) file.**</u>

## Contributing
bxu@k-ai.ai

rmei@k-ai.ai

sngo@k-ai.ai

