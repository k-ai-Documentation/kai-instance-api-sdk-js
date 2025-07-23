import axios from "axios";


interface ConversationMessage {
    from: "user" | "assistant";
    content: string;
    action: "SEARCH" | "QUALIFY_QUESTION";
    datas?: any;
}

interface ChatbotMessage {
    id: string;
    message: string;
}

/**
 * This class provides methods to interact with the Chatbot API.
 */
export class Chatbot {
    private readonly headers: object;
    private readonly baseUrl: string;

    /**
     * Creates a new instance of the Chatbot class.
     * @param headers - The headers for API requests.
     * @param baseUrl - The base URL for the API.
     */
    constructor(headers: object, baseUrl: string) {
        this.headers = headers
        this.baseUrl = baseUrl
    }

    /**
     * Retrieves the full conversation by its ID.
     *
     * This function sends a POST request to fetch the complete conversation
     * associated with the given ID. The response includes the conversation details with user and assistance.
     *
     * @param {string} id - The unique identifier of the conversation.
     * @returns {Promise<ConversationMessage[]>} A promise resolving to the conversation data.
     * @throws {Error} Throws an error if the request fails.
     */
    public async getFullConversation(id: string): Promise<ConversationMessage[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/chatbot/get-conversation`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id
                }
            })
            return request.data.response as ConversationMessage[]
        } catch (e) {
            throw e
        }
    }

    /**
     * 
     * @param {string} id The unique identifier of the conversation.
     * @param {string} user_message User message to be sent to the assistant.
     * @returns {Promise<ChatbotMessage>} A promise resolving to the conversation data.
     * @throws {Error} Throws an error if the request fails.
     */
    public async conversation(id: string = "", user_message: string): Promise<ChatbotMessage> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/chatbot/message`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id,
                    user_message: user_message
                }
            })
            return request.data.response as ChatbotMessage
        } catch (e) {
            throw e
        }
    }
}
