import axios from "axios";

/**
 * Class representing a Semantic Graph API client.
 */
export class SemanticGraph {

    private readonly headers: object;
    private readonly baseUrl: string;

    /**
     * Create a SemanticGraph instance.
     * @param {object} headers - The headers for API requests.
     * @param {string} baseUrl - The base URL for the API.
     */
    constructor(headers: object, baseUrl: string) {
        this.headers = headers;
        this.baseUrl = baseUrl;
    }

    /**
     * Retrieve a list of nodes from the semantic graph.
     * @param {number} limit - The maximum number of nodes to retrieve. Maximum is 50.
     * @param {number} offset - The number of nodes to skip before collecting results.
     * @returns {Promise<any>} - A promise that resolves with the nodes data.
     */
    public async getNodes(limit: number, offset: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/nodes`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'limit': limit,
                    'offset': offset
                }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Retrieve nodes linked to a given node.
     * @param {number} id - The ID of the node.
     * @returns {Promise<any>} - A promise that resolves with the linked nodes data.
     */
    public async getLinkedNodes(id: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/linked-nodes`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'id': id
                }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Retrieve nodes by their label.
     * @param {string} label - The label of the nodes.
     * @returns {Promise<any>} - A promise that resolves with the nodes matching the label.
     */
    public async getNodeByLabel(label: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/nodes-by-label`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'label': label
                }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Identify approximate nodes related to a query.
     * @param {string} query - The query to find approximate nodes.
     * @returns {Promise<any>} - A promise that resolves with the detected nodes.
     */
    public async detectApproximalNodes(query: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/identify-nodes`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'query': query
                }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }
}
