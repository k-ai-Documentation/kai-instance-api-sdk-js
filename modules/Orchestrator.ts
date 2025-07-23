import axios from "axios";

/**
 * Client for interacting with the Orchestrator API
 */
export class Orchestrator {
    private readonly baseUrl: string;
    private readonly headers: object;

    /**
     * Initialize the Orchestrator client.
     * @param headers HTTP headers required for API authentication.
     * @param baseUrl The base URL of the audit API.
     */
    constructor(headers: object, baseUrl: string) {
        this.baseUrl = baseUrl;
        this.headers = headers;
    }

    /**
     * Launch partial indexation
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/orchestrator#post-differential-indexation
     */
    public async launchPartialIndexation(): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/differential-indexation`,
                method: 'POST',
                headers: this.headers,
                data: {}
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Reindex a document
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/orchestrator#post-reindex-document
     */
    public async reindexDocument(document_id: string): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/reindex-document`,
                method: 'POST',
                headers: this.headers,
                data: { id: document_id }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Retry index error parsing documents
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/orchestrator#post-retry-documents-parsing-error
     */
    public async retryIndexErrorParsingDocuments(): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/retry-documents-parsing-error`,
                method: 'POST',
                headers: this.headers,
                data: {}
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count registered background tasks
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/orchestrator#post-count-back-tasks
     */
    public async countRegisteredBackgroundTasks(): Promise<Record<string, number>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/count-back-tasks`,
                method: 'POST',
                headers: this.headers,
                data: {}
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count registered background tasks for a document
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/orchestrator#post-count-tasks-for-doc
     */
    public async countRegisteredBackgroundTasksForDoc(document_id: string): Promise<Record<string, number>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/count-tasks-for-doc`,
                method: 'POST',
                headers: this.headers,
                data: { id: document_id }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }
}