import axios from "axios";

/**
 * Represents conflict information.
 */
export interface ConflictInformation {
    id: string;
    state: string;
    subject: string;
    creation_date: string;
    docsRef: Document[];
    documents: InvolvedInformation[];
}

/**
 * Represents duplicate information.
 */
export interface DuplicateInformation {
    id: string;
    state: string;
    subject: string;
    creation_date: string;
    docsRef: Document[];
    documents: InvolvedInformation[];
}

/**
 * Represents missing subject information.
 */
export interface MissingSubject {
    id: number;
    information_needed: string;
    questions: string[];
    subject: string;
}

/**
 * Represents a document.
 */
export interface Document {
    id: string;
    name: string;
    url: string;
}

/**
 * Represents involved information in a document.
 */
export interface InvolvedInformation {
    docId: string;
    information_involved: string;
}

/**
 * Represents a task containing conflicts and duplicates.
 */
export interface Task {
    conflicts: string[];
    duplicates: string[];
}

/**
 * Manages auditing functionalities, including conflicts, duplicates, and missing subjects.
 */
export class KMAudit {
    private readonly headers: object;
    private readonly baseUrl: string;

    /**
     * Creates an instance of KMAudit.
     *
     * @param {object} headers - The HTTP headers to include in requests.
     * @param {string} baseUrl - The base URL for the API.
     */
    constructor(headers: object, baseUrl: string) {
        this.headers = headers;
        this.baseUrl = baseUrl;
    }

    /**
     * Retrieves conflict information.
     *
     * @param {number} limit - Number of results to return.
     * @param {number} offset - Number of results to skip before starting to collect the result set.
     * @param {string} query - Query string
     * @returns {Promise<ConflictInformation[]>} A list of conflict information.
     */
    public async getConflictInformation(limit: number, offset: number, query: string = ''): Promise<ConflictInformation[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit,
                    query: query
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Retrieves duplicated information.
     *
     * @param {number} limit - Number of results to return.
     * @param {number} offset - Number of results to skip before starting to collect the result set.
     * @returns {Promise<DuplicateInformation[]>} A list of duplicated information.
     */
    public async getDuplicatedInformation(limit: number, offset: number): Promise<DuplicateInformation[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Marks a conflict as managed.
     *
     * @param {number} id - ID of the conflict to set as managed.
     * @returns {Promise<any>} Response from the server.
     */
    public async setConflictManaged(id: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information/set-managed`,
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

    /**
     * Marks a duplicate as managed.
     *
     * @param {number} id - ID of the duplicate to set as managed.
     * @returns {Promise<any>} Response from the server.
     */
    public async setDuplicatedInformationManaged(id: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information/set-managed`,
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

    /**
     * Retrieves a list of documents containing conflicts or duplicated information.
     *
     * @param {number} limit - Number of results to return.
     * @param {number} offset - Number of results to skip before starting to collect the result set.
     * @returns {Promise<Document[]>} A list of documents to manage.
     */
    public async getDocumentsToManageList(limit: number, offset: number): Promise<Document[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/documents-to-manage`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Retrieves a list of missing subjects.
     *
     * @param {number} limit - Number of results to return.
     * @param {number} offset - Number of results to skip before starting to collect the result set.
     * @returns {Promise<MissingSubject[]>} A list of missing subjects.
     */
    public async getMissingSubjectList(limit: number, offset: number): Promise<MissingSubject[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/missing-subjects`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Counts the number of missing subjects.
     *
     * @returns {Promise<number>} The total count of missing subjects.
     */
    public async countMissingSubjects(): Promise<number | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-missing-subjects`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Counts the number of duplicated information entries.
     *
     * @returns {Promise<number>} The total count of duplicated information.
     */
    public async countDuplicatedInformation(): Promise<number | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-duplicated-information`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Counts the number of conflict information entries.
     *
     * @returns {Promise<number>} The total count of conflict information.
     */
    public async countConflictInformation(): Promise<number | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-information`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Retrieves anomalies (conflicts and duplicates) for a document.
     *
     * @param {string} docId - The ID of the document to get anomalies for.
     * @returns {Promise<Document[]>} A list of anomalies for the document.
     */
    public async getAnomaliesForDoc(docId: string): Promise<Document[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-anomalies-for-document`,
                method: 'POST',
                headers: this.headers,
                data: {
                    docId: docId
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Sets the state of a conflict information entry.
     *
     * @param {string} id - The ID of the conflict information.
     * @param {string} state - The state to set (e.g., "managed" or "ignored").
     * @returns {Promise<any>} Response from the server.
     */
    public async conflictInformationSetState(id: string, state: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information/set-state`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id,
                    state: state
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Sets the state of a duplicated information entry.
     *
     * @param {string} id - The ID of the duplicated information.
     * @param {string} state - The state to set (e.g., "managed" or "ignored").
     * @returns {Promise<any>} Response from the server.
     */
    public async duplicatedInformationSetState(id: string, state: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information/set-state`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id,
                    state: state
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
