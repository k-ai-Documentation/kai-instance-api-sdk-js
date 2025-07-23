import axios from "axios";

/**
 * Represents a document returned in search results.
 */
export interface DocumentResult {
    id: string;
    name: string;
    url: string;
    rate?: number;
}

/**
 * Represents a search log entry.
 */
export interface SearchLog {
    id: string;
    answer_text: string;
    query: string;
    user_id: string;
    date: string;
}

/**
 * Represents a message in a conversation.
 */
export interface ConversationMessage {
    from_: 'user' | 'assistant';
    message: string;
}

/**
 * Represents a document signature.
 */
export interface DocumentSignature {
    id: string;
    name: string;
    url: string;
}

/**
 * Represents the result of a search query.
 */
export interface SearchResult {
    query: string;
    answer: string;
    reason: string;
    confidentRate: number;
    gotAnswer: boolean;
    documents: DocumentSignature[];
}

/**
 * Provides search-related functionalities via API requests.
 */
export class Search {
    private readonly baseUrl: string;
    private readonly headers: object;

    /**
     * Initializes the Search instance.
     * @param headers Authentication headers.
     * @param baseUrl Base URL for the API.
     */
    constructor(headers: object, baseUrl: string) {
        this.baseUrl = baseUrl;
        this.headers = headers;
    }

    /**
     * Query the search API.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/search#post-query
     */
    public async query(query: string, user?: string): Promise<SearchResult> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/query`,
                method: 'POST',
                headers: this.headers,
                data: { query, user }
            });
            return request.data.response as SearchResult;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count the total number of search queries made.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/search#post-stats-count-search
     */
    public async countDoneRequests(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-search`,
                method: 'POST',
                headers: this.headers
            });
            return request.data.response as number;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count the number of search queries that resulted in an answer.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/search#post-stats-count-answered-search
     */
    public async countAnsweredDoneRequests(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-answered-search`,
                method: 'POST',
                headers: this.headers
            });
            return request.data.response as number;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Retrieve a list of search queries made to the API.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/search#post-stats-list-search
     */
    public async getRequestsToApi(limit: number, offset: number): Promise<SearchLog[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/list-search`,
                method: 'POST',
                headers: this.headers,
                data: { limit, offset }
            });
            return request.data.response as SearchLog[];
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count the number of search queries made by date.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/search#post-stats-count-search-by-date
     */
    public async countSearchByDate(beginDate: string, endDate: string): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-search-by-date`,
                method: 'POST',
                headers: this.headers,
                data: { begin_date: beginDate, end_date: endDate }
            });
            return request.data.response as number;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count the number of answered search queries by date.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/search#post-stats-count-answered-search-by-date
     */
    public async countAnsweredSearchByDate(beginDate: string, endDate: string): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/search/stats/count-answered-search-by-date`,
                method: 'POST',
                headers: this.headers,
                data: { begin_date: beginDate, end_date: endDate }
            });
            return request.data.response as number;
        } catch (err) {
            throw err;
        }
    }
}
