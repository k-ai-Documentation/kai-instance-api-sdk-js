import axios from "axios";

/**
 * AnomalyState
 * State for anomaly information
 */
export enum AnomalyState {
    MANAGED = 'managed',
    IGNORED = 'ignored',
    DETECTED = 'detected'
}

/**
 * AnomalyInformationDocument
 * Information involved in a document anomaly
 */
export interface AnomalyInformationDocument {
    doc_id: string;
    information_involved: string;
}

/**
 * Anomaly
 * Structure for anomaly (conflict/duplicate)
 */
export interface Anomaly {
    id: string;
    subject: string;
    state: string;
    documents: AnomalyInformationDocument[];
    explanation: string;
}

/**
 * DocumentAnomalies
 * Structure for document anomalies (conflicts and duplicates)
 */
export interface DocumentAnomalies {
    conflicts: Anomaly[];
    duplicated: Anomaly[];
}

/**
 * Client for interacting with the audit API to manage conflicts, duplicates, and anomalies in documents.
 */
export class KMAudit {
    private readonly baseUrl: string;
    private readonly headers: object;

    /**
     * Initialize the KMAudit client.
     * @param headers HTTP headers required for API authentication.
     * @param baseUrl The base URL of the audit API.
     */
    constructor(headers: object, baseUrl: string) {
        this.baseUrl = baseUrl;
        this.headers = headers;
    }

    /**
     * Set conflict state
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-conflict-information-set-state
     */
    public async updateConflictState(id: string, state: AnomalyState): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information/set-state`,
                method: 'POST',
                headers: this.headers,
                data: { id, state }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Set duplicate state
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-duplicated-information-set-state
     */
    public async updateDuplicateState(id: string, state: AnomalyState): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information/set-state`,
                method: 'POST',
                headers: this.headers,
                data: { id, state }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count conflicts
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-conflict-information
     */
    public async countConflicts(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-information`,
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
     * Count duplicates
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-duplicated-information
     */
    public async countDuplicates(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-duplicated-information`,
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
     * List conflicts
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-conflict-information
     */
    public async listConflicts(limit: number = 200, offset: number = 0, query?: string, document_name?: string, state?: AnomalyState): Promise<Anomaly[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information`,
                method: 'POST',
                headers: this.headers,
                data: { limit, offset, query, document_name, state }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * List duplicates
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-duplicated-information
     */
    public async listDuplicates(limit: number = 200, offset: number = 0, query?: string, document_name?: string, state?: AnomalyState): Promise<Anomaly[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information`,
                method: 'POST',
                headers: this.headers,
                data: { limit, offset, query, document_name, state }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count anomalies per document
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-document-ids-to-manage
     */
    public async countAnomaliesPerDocument(): Promise<Record<string, Record<string, number>>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/document-ids-to-manage`,
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
     * Get anomalies for a document
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-document-ids-to-manage
     */
    public async getAnomaliesForDocument(document_id: string): Promise<DocumentAnomalies> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-anomalies-for-document`,
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
     * Count conflicts for period
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-conflict-by-date
     */
    public async countConflictsForPeriod(begin_date: string, end_date: string, state?: string): Promise<Record<string, Record<string, number>>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-by-date`,
                method: 'POST',
                headers: this.headers,
                data: { begin_date, end_date, state }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count duplicates for period
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-duplicate-by-date
     */
    public async countDuplicatesForPeriod(begin_date: string, end_date: string, state?: string): Promise<Record<string, Record<string, number>>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-duplicate-by-date`,
                method: 'POST',
                headers: this.headers,
                data: { begin_date, end_date, state }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get conflict document pairs
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-conflict-document-pair
     */
    public async getConflictDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string): Promise<any[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflict-document-pair`,
                method: 'POST',
                headers: this.headers,
                data: { limit, offset, document_name }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get duplicate document pairs
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-duplicate-document-pair
     */
    public async getDuplicateDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string): Promise<any[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-duplicate-document-pair`,
                method: 'POST',
                headers: this.headers,
                data: { limit, offset, document_name }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get conflicts by document pair
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-conflicts-by-document-id-pair
     */
    public async getConflictsByDocumentPair(document_ids: string[], limit: number = 200, offset: number = 0): Promise<Anomaly[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflicts-by-document-id-pair`,
                method: 'POST',
                headers: this.headers,
                data: { document_ids, limit, offset }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get duplicates by document pair
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-duplicates-by-document-id-pair
     */
    public async getDuplicatesByDocumentPair(document_ids: string[], limit: number = 200, offset: number = 0): Promise<Anomaly[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-duplicates-by-document-id-pair`,
                method: 'POST',
                headers: this.headers,
                data: { document_ids, limit, offset }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * List missing information
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-list-missing-information
     */
    public async listMissingInformation(limit: number = 200, offset: number = 0): Promise<any[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/list-missing-information`,
                method: 'POST',
                headers: this.headers,
                data: { limit, offset }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Delete missing information
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-delete-missing-information
     */
    public async deleteMissingInformation(id: string): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/delete-missing-information`,
                method: 'POST',
                headers: this.headers,
                data: { id }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count missing information
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-missing-information
     */
    public async countMissingInformation(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-missing-information`,
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
     * Count conflicts per subject
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-conflict-by-subject
     */
    public async countConflictsPerSubject(): Promise<Record<string, number>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-by-subject`,
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
     * Count duplicates per subject
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-duplicate-by-subject
     */
    public async countDuplicatesPerSubject(): Promise<Record<string, number>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-duplicate-by-subject`,
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
     * Get conflicts by subject
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-conflict-information-by-subject
     */
    public async getConflictsBySubject(subject?: string, offset: number = 0, limit: number = 50): Promise<Anomaly[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflict-information-by-subject`,
                method: 'POST',
                headers: this.headers,
                data: { subject, offset, limit }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get duplicates by subject
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-duplicate-information-by-subject
     */
    public async getDuplicatesBySubject(subject?: string, offset: number = 0, limit: number = 50): Promise<Anomaly[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-duplicate-information-by-subject`,
                method: 'POST',
                headers: this.headers,
                data: { subject, offset, limit }
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Check if document is audited
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-document-is-analyzed
     */
    public async checkIfDocumentIsAudited(document_id: string): Promise<boolean> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/document-is-analyzed`,
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
