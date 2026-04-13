import {KaiStudioInstance, KaiStudioCredentials} from './index';

export class Credentials implements KaiStudioCredentials {
    public instanceId: string;
    public apiKey: string;

    constructor(instanceId: string, apiKey: string) {
        this.instanceId = instanceId;
        this.apiKey = apiKey;
    }
}

let credentials = new Credentials('', '');

let kaiStudio = new KaiStudioInstance(credentials);
let auditInstance = kaiStudio.auditInstance();
let semanticGraph = kaiStudio.semanticGraph();
let document = kaiStudio.document();
let orchestrator = kaiStudio.orchestrator();

// document
document.listDocuments(0, 20, 'INDEXED').then((response) => {
    console.log(response);
})