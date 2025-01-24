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

let credentials = new Credentials('c977644b-8b4a-43ee-8901-a609ef3b9e19', '03fb090f-b2ac-444a-8356-6be9d9fe132a', 'TTLM0qFAT9FTXk/i6uvwh8IbU3jLw9/zMXvdSul2/E0=');

let kaiStudio = new KaiStudio(credentials);
let chatbotInstance = kaiStudio.chatbot()

chatbotInstance.getFullConversation("8rFIl5QBHpUjDu2V1wi8").then(response => {
    console.log(response)
})

chatbotInstance.conversation("", "Tell me some information about git command", false, "").then(response => {
    console.log(response)
})
