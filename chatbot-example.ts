import {KaiStudioCredentials, KaiStudioInstance} from './index';

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

let credentials = new Credentials('xxxx', 'xxxxx', 'xxxxxx');

let kaiStudio = new KaiStudioInstance(credentials);
let chatbotInstance = kaiStudio.chatbot()

chatbotInstance.getFullConversation("8rFIl5QBHpUjDu2V1wi8").then(response => {
    console.log(response)
})

chatbotInstance.conversation("", "Tell me some information about git command").then(response => {
    console.log(response)
})
