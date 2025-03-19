import axios from 'axios';

/**
 * The Core class provides methods for interacting with the Core API.
 */
export class Core {
    private readonly headers: object;
    private readonly baseUrl: string;

    /**
     * Creates an instance of the Core class.
     *
     * @param {object} headers - The HTTP headers to include in requests.
     * @param {string} baseUrl - The base URL of the API.
     */
    constructor(headers: object, baseUrl: string) {
        this.headers = headers;
        this.baseUrl = baseUrl;
    }

    /**
     * Retrieves the number of documents that have been analyzed.
     *
     * @returns {Promise<number>} The count of analyzed documents.
     */
    public async countDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-documents`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Retrieves the number of detected documents.
     *
     * @returns {Promise<number>} The count of detected documents.
     */
    public async countDetectedDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-detected-documents`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Retrieves the number of documents that are indexable.
     *
     * @returns {Promise<number>} The count of indexable documents.
     */
    public async countIndexableDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-indexable-documents`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Retrieves the number of documents that have been indexed.
     *
     * @returns {Promise<number>} The count of indexed documents.
     */
    public async countIndexedDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-indexed-documents`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Counts the number of in progress indexation documents.
     *
     * @returns {Promise<any>} The number of in progress indexation documents or null if the request fails.
     */
        public async countInProgressIndexationDocuments(): Promise<any> {
            try {
                const request = await axios({
                    url: `${this.baseUrl}api/orchestrator/stats/count-inprogress-indexation-documents`,
                    method: 'POST',
                    headers: this.headers,
                });
                return request.data.response;
            } catch (e) {
                return null;
            }
        }

    /**
     * Downloads a file by its document ID.
     *
     * @param {string} fileId - The ID of the document to download.
     * @returns {Promise<any>} The downloaded file data or null if the request fails.
     */
    public async downloadFile(fileId: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/files/download`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: fileId,
                },
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }

    /**
     * Indexes only new, updated, or removed documents.
     *
     * @returns {Promise<any>} The response from the indexing request or null if the request fails.
     */
    public async indexNewOrUpdatedDocument(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/differential-indexation`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }

    /**
     * Retrieves a list of all available scenarios along with their API signatures.
     *
     * @returns {Promise<any>} A list of scenarios or null if the request fails.
     */
    public async getAllScenarios(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/scenarios`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }

    /**
     * Lists all documents with pagination.
     *
     * @param {number} limit - The number of documents to return.
     * @param {number} offset - The number of documents to skip before collecting results.
     * @returns {Promise<any>} A list of documents or null if the request fails.
     */
    public async listDocs(limit: number, offset: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/list-docs`,
                method: 'POST',
                headers: this.headers,
                data: {
                    limit: limit,
                    offset: offset,
                },
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }

    /**
     * Retrieves the timestamp of the last indexation's start time.
     *
     * @returns {Promise<any>} The start time of the last indexation or null if the request fails.
     */
    public async lastIndexationBeginTime(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/last-indexation`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }

    /**
     * Retrieves the timestamp of the last indexation's end time.
     *
     * @returns {Promise<any>} The end time of the last indexation or null if the request fails.
     */
    public async lastIndexationEndTime(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/last-finished-indexation`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }

    /**
     * Lists indexed documents with pagination.
     *
     * @param {number} limit - The number of documents to return.
     * @param {number} offset - The number of documents to skip before collecting results.
     * @returns {Promise<any>} A list of indexed documents or null if the request fails.
     */
    public async listIndexedDocuments(limit: number, offset: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/list-indexed-documents`,
                method: 'POST',
                headers: this.headers,
                data: {
                    limit: limit,
                    offset: offset,
                },
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }

    /**
     * Check if instance has job in progress
     *
     * @returns {Promise<boolean>} A list of indexed documents or null if the request fails.
     */
    public async checkPendingIndexation(): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/check-pending-indexation`,
                method: 'POST',
                headers: this.headers
            });
            return request.data.response;
        } catch (e) {
            return null;
        }
    }
}
