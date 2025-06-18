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
     * @param state
     * @returns {Promise<ConflictInformation[]>} A list of conflict information.
     */
    public async getConflictInformation(limit: number, offset: number, query: string = '', state: string = ""): Promise<ConflictInformation[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit,
                    query: query,
                    state: state
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
     * @param {string} query - Query string
     * @param state
     * @returns {Promise<DuplicateInformation[]>} A list of duplicated information.
     */
    public async getDuplicatedInformation(limit: number, offset: number, query: string = '', state: string = ""): Promise<DuplicateInformation[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit,
                    query: query,
                    state: state
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
     * Retrieves a list of documents containing conflicts or duplicated information.
     *
     * @returns {Promise<Document[]>} A list of documents to manage.
     */
    public async getDocumentIdsToManageList(): Promise<Document[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/document-ids-to-manage`,
                method: 'POST',
                headers: this.headers
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

    /**
     * Count conflict by date
     *
     * @param {string} beginDate - begin date to query.
     * @param {string} endDate - end date to query.
     * @param {string} state - optional, the state to calculate, DETECTED / MANAGED / IGNORED / REDETECTED / DISAPPEARED
     * @returns {Promise<any>} Response from the server.
     */
    public async countConflictByDate(beginDate: string, endDate: string, state: string = ""): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-by-date`,
                method: 'POST',
                headers: this.headers,
                data: {
                    beginDate: beginDate,
                    endDate: endDate,
                    state: state
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * Count duplicate by date
     *
     * @param {string} beginDate - begin date to query.
     * @param {string} endDate - end date to query.
     * @param {string} state - optional, the state to calculate, DETECTED / MANAGED / IGNORED / REDETECTED / DISAPPEARED
     * @returns {Promise<any>} Response from the server.
     */
    public async countDuplicateByDate(beginDate: string, endDate: string, state: string = ""): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-duplicate-by-date`,
                method: 'POST',
                headers: this.headers,
                data: {
                    beginDate: beginDate,
                    endDate: endDate,
                    state: state
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * count conflicts via a given subject content
     *
     * @param {string} subject - subject to query.
     * @param limit
     * @param offset
     * @returns {Promise<any>} Response from the server.
     */

    public async getConflictInformationBySubject(subject: string, limit: number = 20, offset: number = 0): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflict-information-by-subject`,
                method: 'POST',
                headers: this.headers,
                data: {
                    subject: subject,
                    limit: limit,
                    offset: offset
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * count conflicts of top 10 subjects
     *
     * @returns {Promise<any>} Response from the server.
     */
    public async countConflictInformationBySubject(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-information-by-subject`,
                method: 'POST',
                headers: this.headers,
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * list duplicates via a given subject content
     *
     * @param {string} subject - subject to query.
     * @param limit
     * @param offset
     * @returns {Promise<any>} Response from the server.
     */

    public async getDuplicateInformationBySubject(subject: string, limit: number = 20, offset: number = 0): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-duplicate-information-by-subject`,
                method: 'POST',
                headers: this.headers,
                data: {
                    subject: subject,
                    limit: limit,
                    offset: offset
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * count duplicates of top 10 subjects
     *
     * @returns {Promise<any>} Response from the server.
     */
    public async countDuplicatedInformationBySubject(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-duplicated-information-by-subject`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    /**
     * get duplicates by docIds
     *
     * @param {string[]} docIds - docIds to query.
     * @returns {Promise<any>} Response from the server.
     */

    public async getDuplicateInformationByDocuments(docIds: string[]): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-duplicate-information-list-by-ids`,
                method: 'POST',
                headers: this.headers,
                data: {
                    docIds: docIds
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }


    /**
     * get conflicts by docIds
     *
     * @param {string[]} docIds - docIds to query.
     * @returns {Promise<any>} Response from the server.
     */

    public async getConflictInformationByDocuments(docIds: string[]): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflict-information-list-by-ids`,
                method: 'POST',
                headers: this.headers,
                data: {
                    docIds: docIds
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getDuplicateInformationDocumentPair(limit: number = 20, offset: number = 0, documentName: string = ""): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-duplicate-information-document-pair`,
                method: 'POST',
                headers: this.headers,
                data: {
                    limit: limit,
                    offset: offset,
                    documentName: documentName
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getConflictInformationDocumentPair(limit: number = 20, offset: number = 0, documentName: string = ""): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflict-information-document-pair`,
                method: 'POST',
                headers: this.headers,
                data: {
                    limit: limit,
                    offset: offset,
                    documentName: documentName
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
