import { KaiStudio, KaiStudioCredentials } from './index';

export class Credentials implements KaiStudioCredentials {
    public organizationId: string;
    public instanceId: string;
    public apiKey: string;

    constructor(organizationId: string, instanceId: string, apiKey: string) {
        this.organizationId = organizationId;
        this.instanceId = instanceId;
        this.apiKey = apiKey;
    }
}

let credentials = new Credentials('organization id', 'instance id', 'api key');

let kaiStudio = new KaiStudio(credentials);
let core = kaiStudio.core();
let manageInstance = kaiStudio.manageInstance();
let search = kaiStudio.search();
let auditInstance = kaiStudio.auditInstance();
let semanticGraph = kaiStudio.semanticGraph();

core.countDocuments().then((response) => {
    console.log('COUNT DOCUMENTS:');
    console.log(response);
});

core.countDetectedDocuments().then((response) => {
    console.log('COUNT DETECTED DOCUMENTS:');
    console.log(response);
})

core.countIndexableDocuments().then((response) => {
    console.log('COUNT INDEXABLE DOCUMENTS:');
    console.log(response);
})

core.countIndexedDocuments().then((response) => {
    console.log('COUNT INDEXED DOCUMENTS:');
    console.log(response);
})

core.downloadFile('Azure Blob Storage::{{blob storage id}}::Contacter FranceTV.docx').then((response) => {
    console.log('DOWNLOAD FILE:');
    console.log(response);
});

core.indexNewOrUpdatedDocument('').then((response) => {
    console.log('INDEX NEW OR UPDATED DOCUMENT:');
    console.log(response);
});

core.getAllScenarios().then((response) => {
    console.log('GET ALL SCENARIOS:');
    console.log(response);
});

core.getLogs('yourTypeLog', 0, 20).then((response) => {
    console.log('GET LOGS:');
    console.log(response);
});

core.reinitAll().then((response) => {
    console.log('REINIT ALL:');
    console.log(response);
});

auditInstance.getConflictInformation(20, 0).then((response) => {
    console.log('GET CONFLICT INFORMATION:');
    console.log(response);
});

auditInstance.getDuplicatedInformation(20, 0).then((response) => {
    console.log('GET DUPLICATED INFORMATION:');
    console.log(response);
});

auditInstance.setConflictManaged(1).then((response) => {
    console.log('SET CONFLICT MANAGED:');
    console.log(response);
})

auditInstance.setDuplicatedInformationManaged(1).then((response) => {
    console.log('SET DUPLICATED INFORMATION MANAGED:');
    console.log(response);
})

auditInstance.getDocumentsToManageList(20, 0).then((response) => {
    console.log('GET DOCUMENTS TO MANAGE LIST:');
    console.log(response);
});

auditInstance.getMissingSubjectList(20, 0).then((response) => {
    console.log('GET MISSING SUBJECT LIST:');
    console.log(response);
})

auditInstance.getAllTasksLinkedToDocument('documentId').then((response) => {
    console.log('GET ALL TASKS LINKED TO DOCUMENT:');
    console.log(response);
})

manageInstance.getGlobalHealth().then((response) => {
    console.log('GET GLOBAL HEALTH:');
    console.log(response);
});

manageInstance.isApiAlive().then((response) => {
    console.log('IS API ALIVE:');
    console.log(response);
});

manageInstance.getVersion().then((response) => {
    console.log('GET VERSION:');
    console.log(response);
});

search.query('what is the history of France TV?', 'userid', '', false, false).then((response) => {
    console.log('SEARCH QUERY:');
    console.log(response);
});

search.getDocSignature('Azure Blob Storage::{{blob storage id}}::Contacter FranceTV.docx').then((response) => {
    console.log('GET DOC SIGNATURE:');
    console.log(response);
});

search.getDocsIds(['Sharepoint::01TE4EPWFLWDMCRPKFM5GZRFYGWEEBX6G2', 'Sharepoint::01TE4EPWEJF5AGPGX7V5FYMYUDPFNFG325']).then((response) => {
    console.log('GET DOCS BY IDS:');
    console.log(response);
});

search.countDoneRequests().then((response) => {
    console.log('COUNT REQUESTS:');
    console.log(response);
});

search.countAnsweredDoneRequests().then((response) => {
    console.log('COUNT ANSWERED REQUESTS:');
    console.log(response);
});

search.listQuestionsAsked(20, 0).then((response) => {
    console.log('LIST QUESTIONS ASKED:');
    console.log(response);
});

search.identifySpecificDocument([{from:"user", message: "user message"}, {from:"assistant", message: "assistant message"}]).then((response) => {
    console.log('IDENTIFY SPECIFIC DOCUMENT:');
    console.log(response);
})

semanticGraph.getNodes(20, 0).then((response) => {
    console.log('GET NODES:');
    console.log(response);
});

semanticGraph.getLinkedNodes(297).then((response) => {
    console.log('GET LINKED NODES:');
    console.log(response);
});

semanticGraph.getNodeByLabel("Git command").then((response) => {
    console.log('GET NODE BY LABEL:');
    console.log(response);
});

semanticGraph.detectApproximalNodes("Git command").then((response) => {
    console.log('DETECT APPROXIMAL NODES:');
    console.log(response);
})
