import axios from "axios";

export class Chatbot {
    private readonly headers: object;
    private readonly baseUrl: string;

    constructor(headers: object, baseUrl: string) {
        this.headers = headers
        this.baseUrl = baseUrl
    }

    public async getFullConversation(id: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/chatbot/get-conversation`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async conversation(id: string = "", user_message: string, multi_documents: boolean, user_id: string = ""): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/chatbot/message`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id,
                    user_message: user_message,
                    multi_documents: multi_documents,
                    user_id: user_id,
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
