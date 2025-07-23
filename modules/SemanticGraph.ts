
import axios from "axios";

/**
 * A class to interact with a semantic graph API, providing methods to retrieve nodes,
 * linked nodes, nodes by label, and detect approximate nodes.
 */

export interface PartialDocument {
    id: string;
    content: string[];
}

export interface IdentifiedNode {
    id: string;
    node1: string;
    node2: string;
    edge: string;
    documents: PartialDocument[] | string[];
}

export interface SemanticNodeExtraproperties {
    documents: string[];
    chunks: string[];
    count: number;
}

export interface SemanticNode {
    id: string;
    node1: string;
    node2: string;
    edge: string;
    extraproperties: SemanticNodeExtraproperties;
}

export class SemanticGraph {
    /**
     * Initializes the SemanticGraph client.
     * @param headers HTTP headers to include in requests.
     * @param baseUrl The base URL for the API.
     */
    private readonly baseUrl: string;
    private readonly headers: object;

    constructor(headers: object, baseUrl: string) {
        this.baseUrl = baseUrl;
        this.headers = headers;
    }

    /**
     * Retrieve a list of nodes from the semantic graph.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/semantic-graph#post-nodes
     */
    public async getNodes(limit: number = 20, offset: number = 0): Promise<SemanticNode[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/nodes`,
                method: 'POST',
                headers: this.headers,
                data: {
                    limit: limit || 20,
                    offset: offset || 0
                }
            });
            return request.data.response as SemanticNode[];
        } catch (err) {
            throw err;
        }
    }

    /**
     * Retrieve nodes by their label.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/semantic-graph#post-nodes-by-label
     */
    public async getNodeByLabel(label: string): Promise<SemanticNode[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/nodes-by-label`,
                method: 'POST',
                headers: this.headers,
                data: { label }
            });
            return request.data.response as SemanticNode[];
        } catch (err) {
            throw err;
        }
    }

    /**
     * Identify nodes related to a query.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/semantic-graph#post-identify-nodes
     */
    public async identifyNodes(query: string, needDocumentsContent: boolean = false): Promise<IdentifiedNode[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/identify-nodes`,
                method: 'POST',
                headers: this.headers,
                data: {
                    query,
                    need_documents_content: needDocumentsContent
                }
            });
            return request.data.response as IdentifiedNode[];
        } catch (err) {
            throw err;
        }
    }

    /**
     * Retrieve nodes linked to a given node by ID.
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/semantic-graph#post-linked-nodes-by-id
     */
    public async linkedNodesById(id: string): Promise<SemanticNode[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/semantic-graph/linked-nodes-by-id`,
                method: 'POST',
                headers: this.headers,
                data: { id }
            });
            return request.data.response as SemanticNode[];
        } catch (err) {
            throw err;
        }
    }
}
