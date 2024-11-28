import axios from "axios";

export interface DocumentResult {
    id: string,
    name: string,
    url: string
}

export interface SearchLog {
    id: number,
    query: string,
    answer_text: string,
    user_id: string
}

export interface SearchResult {
    query: string,
    answer: string,
    reason: string,
    confidentRate: number,
    gotAnswer: boolean,
    documents: DocumentResult[],
    followingQuestions: string[]
}

export interface IdentifySpecificDocument {
    isFinal: boolean,
    question: string
}

export class Search {

    private readonly headers: object;
    private readonly baseUrl: string;

    constructor(headers: object, baseUrl: string) {
        this.headers = headers
        this.baseUrl = baseUrl
    }

    public async query(query: string, user: string, impersonate: string, multiDocuments: boolean, needFollowingQuestions: boolean): Promise<SearchResult> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/query`,
                method: 'POST',
                headers: this.headers,
                data: {
                    query,
                    user,
                    impersonate,
                    multiDocuments,
                    needFollowingQuestions
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getDocSignature(docId: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/doc`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: docId
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getDocsIds(docsIds: string[]): Promise<string[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/docs`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'docsIds': docsIds
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async countDoneRequests(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-search`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async countAnsweredDoneRequests(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-answered-search`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async listQuestionsAsked(offset: number = 0, limit: number = 20): Promise<SearchLog[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/list-search`,
                method: 'POST',
                headers: this.headers,
                data: {offset, limit}
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async identifySpecificDocument(conversation: any): Promise<IdentifySpecificDocument> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/identify-specific-document`,
                method: 'POST',
                headers: this.headers,
                data: {"conversation": conversation}
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getVersion(): Promise<string> {
        try {
            const request = await axios({
                url: `${this.baseUrl}version`,
                method: 'GET',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
