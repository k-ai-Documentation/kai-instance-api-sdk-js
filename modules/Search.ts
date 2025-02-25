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

/**
 * This class is used to make search queries.
 */
export class Search {
    private readonly headers: object;
    private readonly baseUrl: string;

    /**
     * Create Search instance.
     * @param headers - The headers for API requests.
     * @param baseUrl - The base URL for the API.
     */
    constructor(headers: object, baseUrl: string) {
        this.headers = headers;
        this.baseUrl = baseUrl;
    }

    /**
     * Make a simple search with user query.
     * @param {string} query - Query to search.
     * @param {string} user - (Optional) User identifier to log for this query.
     * @param {string} impersonate - Name a profile to imitate the style of answer. By defaut it's "Knowledge manager" if you don't specify it.
     * @param {boolean} multiDocuments - True if you want to search across multiple documents, false if you want to retrieve an answer from a single document.
     * @param {boolean} needFollowingQuestions - True if you want the API to propose multiple next questions, else false.
     * @returns A promise resolving to the search result.
     */
    public async query(query: string, user: string, impersonate: string, multiDocuments: boolean, needFollowingQuestions: boolean): Promise<SearchResult> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/query`,
                method: 'POST',
                headers: this.headers,
                data: { query, user, impersonate, multiDocuments, needFollowingQuestions }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Retrieve the signature of a document.
     * @param {string[]} docId - ID of the document to get the signature.
     * @returns A promise resolving to the document signature.
     */
    public async getDocSignature(docId: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/doc`,
                method: 'POST',
                headers: this.headers,
                data: { id: docId }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Retrieve the signatures of multiple identified documents.
     * @param {string[]} docsIds - An array containing all document IDs.
     * @returns A promise resolving to an array of document signatures.
     */
    public async getDocsIds(docsIds: string[]): Promise<string[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/docs`,
                method: 'POST',
                headers: this.headers,
                data: { docsIds }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Count the total number of search queries made.
     * @returns A promise resolving to the total count of search queries.
     */
    public async countDoneRequests(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-search`,
                method: 'POST',
                headers: this.headers
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Count the number of search queries that resulted in an answer.
     * @returns A promise resolving to the count of answered search queries.
     */
    public async countAnsweredDoneRequests(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-answered-search`,
                method: 'POST',
                headers: this.headers
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Retrieve a list of search queries made to the API.
     * @param {number} offset - Number of entries to skip before collecting the result set.
     * @param {number} limit - Number of entries to return.
     * @returns A promise resolving to an array of search logs.
     */
    public async listQuestionsAsked(offset: number = 0, limit: number = 20): Promise<SearchLog[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/list-search`,
                method: 'POST',
                headers: this.headers,
                data: { offset, limit }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Identify a concise question following the user's needs and knowledge base documents.
     * @param conversation - An array representing a conversation between the user and the assistant.
     * Each row follows the structure: { from: 'user' | 'assistant', message: string }.
     * @returns A promise resolving to the identified specific document question.
     */
    public async identifySpecificDocument(conversation: any): Promise<IdentifySpecificDocument> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/identify-specific-document`,
                method: 'POST',
                headers: this.headers,
                data: { conversation }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Get the current version of the API.
     * @returns A promise resolving to the current version of the API.
     */
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

    /**
     * Count the number of search queries made by date.
     * @param {string} beginDate - The start date for the search count.
     * @param {string} endDate - The end date for the search count.
     * @returns A promise resolving to an object containing the count of search queries by date.
     */
    public async countSearchNumberByDate(beginDate: string, endDate: string) :Promise<{ [key: string]: number }>{
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/count-search-by-date`,
                method: 'POST',
                headers: this.headers,
                data: {
                    "beginDate": beginDate,
                    "endDate": endDate
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
