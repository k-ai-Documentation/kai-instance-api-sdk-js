import axios from 'axios';
import {State} from '../index';

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
            const allDoc = new Promise<number>((resolve, reject) => {
                axios({
                    url: `${this.baseUrl}api/core/count-documents-by-state`,
                    method: 'POST',
                    headers: this.headers,
                    data: {
                        'state': ''
                    }
                }).then((response) => {
                    resolve(Number(response.data.response));
                }).catch((error) => {
                    reject(error);
                });
            })
            const errorType = new Promise<number>((resolve, reject) => {
                axios({
                    url: `${this.baseUrl}api/core/count-documents-by-state`,
                    method: 'POST',
                    headers: this.headers,
                    data: {
                        'state': 'PARSING_ERROR'
                    }
                }).then((response) => {
                    resolve(Number(response.data.response));
                }).catch((error) => {
                    reject(error);
                });
            })
            return Promise.all([allDoc, errorType]).then((result) => {
                return result[0] - result[1];
            })
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
                url: `${this.baseUrl}api/core/count-documents-by-state`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'state': ''
                }
            });
            return request.data.response;
        } catch (e) {
            return 0;
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
     * Retrieves the number of documents that are indexable.
     *
     * @returns {Promise<number>} The count of indexable documents.
     */
    public async countIndexableDocuments(): Promise<number> {
        try {
            const initialSave = new Promise<number>((resolve, reject) => {
                axios({
                    url: `${this.baseUrl}api/core/count-documents-by-state`,
                    method: 'POST',
                    headers: this.headers,
                    data: {
                        'state': 'INITIAL_SAVED'
                    }
                }).then((response) => {
                    resolve(Number(response.data.response));
                }).catch((error) => {
                    reject(error);
                });
            })
            const updated = new Promise<number>((resolve, reject) => {
                axios({
                    url: `${this.baseUrl}api/core/count-documents-by-state`,
                    method: 'POST',
                    headers: this.headers,
                    data: {
                        'state': 'UPDATED'
                    }
                }).then((response) => {
                    resolve(Number(response.data.response));
                }).catch((error) => {
                    reject(error);
                });
            })
            return Promise.all([initialSave, updated]).then((result) => {
                return result[0] + result[1];
            })
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
                url: `${this.baseUrl}api/core/count-documents-by-state`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'state': 'INDEXED'
                }
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
            const onContentExtract = new Promise<number>((resolve, reject) => {
                axios({
                    url: `${this.baseUrl}api/core/count-documents-by-state`,
                    method: 'POST',
                    headers: this.headers,
                    data: {
                        'state': 'ON_CONTENT_EXTRACT'
                    }
                }).then((response) => {
                    resolve(Number(response.data.response));
                }).catch((error) => {
                    reject(error);
                })
            })
            const contentExtracted = new Promise<number>((resolve, reject) => {
                axios({
                    url: `${this.baseUrl}api/core/count-documents-by-state`,
                    method: 'POST',
                    headers: this.headers,
                    data: {
                        'state': 'CONTENT_EXTRACTED'
                    }
                }).then((response) => {
                    resolve(Number(response.data.response));
                }).catch((error) => {
                    reject(error);
                })
            })
            const onIndexation = new Promise<number>((resolve, reject) => {
                axios({
                    url: `${this.baseUrl}api/core/count-documents-by-state`,
                    method: 'POST',
                    headers: this.headers,
                    data: {
                        'state': 'ON_INDEXATION'
                    }
                }).then((response) => {
                    resolve(Number(response.data.response));
                }).catch((error) => {
                    reject(error);
                });
            })
            return Promise.all([onContentExtract, contentExtracted, onIndexation]).then((result) => {
                return result[0] + result[1] + result[2];
            })
        } catch (e) {
            return null;
        }
    }

    /**
     *
     * @param {keyof typeof State} state - (OPTIONAL) The state of the documents to count. If state is not provided, the method counts all documents.
     * @returns {Promise<number>} The number of documents in the specified state or 0 if the request fails.
     */
    public async countDocumentsByState(state?: keyof typeof State): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/core/count-documents-by-state`,
                method: 'POST',
                headers: this.headers,
                data: {
                    'state': state
                }
            });
            return request.data.response;
        } catch (e) {
            return 0;
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
     * Lists documents with pagination and state.
     *
     * @param {number} limit - The number of documents to return.
     * @param {number} offset - The number of documents to skip before collecting results.
     * @param {keyof typeof State} state - (OPTIONAL) The state of the documents to retrieve. If state is not provided, the method retrieves all documents.
     * @returns {Promise<any>} A list of documents or null if the request fails.
     */
    public async listDocs(limit: number, offset: number, state?: keyof typeof State): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/list-docs`,
                method: 'POST',
                headers: this.headers,
                data: {
                    limit: limit,
                    offset: offset,
                    state: state,
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
     * Check if instance has job in progress and its status
     *
     * @returns {Promise<any>} description of pending job. Available values :
     "Indexation in progress" , "Partial indexation in progress" , "Recovery indexation in progress" : An indexation of new or updated documents is pending.
     "Loading Audit" : "Audit of the indexed documents is pending.
     */
    public async checkPendingJob(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/check-pending-job`,
                method: 'POST',
                headers: this.headers,
            });
            return request.data.response;
        } catch (e) {
            return false;
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
                url: `${this.baseUrl}api/orchestrator/doc`,
                method: 'POST',
                headers: this.headers,
                data: {id: docId}
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
    public async getDocsIds(docsIds: string[], limit: number = 10): Promise<string[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/docs`,
                method: 'POST',
                headers: this.headers,
                data: {docsIds}
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    public async getDocumentById(docId: string): Promise<string[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/get-document-by-id`,
                method: 'POST',
                headers: this.headers,
                data: {id: docId}
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }
}
