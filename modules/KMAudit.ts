import axios from 'axios';

/**
 * AnomalyState
 * State for anomaly information
 */
export enum AnomalyState {
    MANAGED = 'managed',
    IGNORED = 'ignored',
    DETECTED = 'detected',
    REDETECTED = 'redetected',
    DISAPPEARED = 'disappeared'
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
 * Structure for anomaly (conflict)
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
 * Structure for document anomalies
 */
export interface DocumentAnomalies {
    conflicts: Anomaly[];
}

export interface AnomalyTypeNumber {
    subject: string;
    count: number;
    count_detected: number;
    count_managed: number;
    count_ignored: number;
    count_redetected: number;
    count_disappeared: number;
}

/**
 * Client for interacting with the audit API to manage conflicts and anomalies in documents.
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
                data: {id, state},
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
                data: {},
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
                data: {limit, offset, query, document_name, state},
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
    public async countAnomaliesPerDocument(limit: number = 20, offset: number = 0, document_ids?: string[]): Promise<Record<string, Record<string, number>>> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/document-ids-to-manage`,
                method: 'POST',
                headers: this.headers,
                data: {limit, offset, document_ids},
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get anomalies for a document
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-anomalies-for-document
     */
    public async getAnomaliesForDocument(document_id: string): Promise<DocumentAnomalies> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-anomalies-for-document`,
                method: 'POST',
                headers: this.headers,
                data: {id: document_id},
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
                data: {begin_date, end_date, state},
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count conflicts by given state
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-count-conflicts-by-state
     */
    public async countConflictsByState(state: string): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflicts-by-state`,
                method: 'POST',
                headers: this.headers,
                data: {state},
            });
            return request.data.response ?? 0;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get conflict document pairs
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/audit#post-get-conflict-document-pair
     */
    public async getConflictDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string, state?: string, sortOrder?: string): Promise<any[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflict-document-pair`,
                method: 'POST',
                headers: this.headers,
                data: {limit, offset, document_name, state, order: sortOrder}
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
    public async getConflictsByDocumentPair(document_ids: string[], limit: number = 200, offset: number = 0, state: string = ''): Promise<Anomaly[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/get-conflicts-by-document-id-pair`,
                method: 'POST',
                headers: this.headers,
                data: {document_ids, limit, offset, state},
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
    public async countConflictsPerSubject(document_ids?: string[]): Promise<AnomalyTypeNumber[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-by-subject`,
                method: 'POST',
                headers: this.headers,
                data: {document_ids},
            });
            return request.data.response.map((item: any) => ({
                subject: item.subject,
                count: parseInt(item.count),
                count_detected: parseInt(item.count_detected),
                count_managed: parseInt(item.count_managed),
                count_ignored: parseInt(item.count_ignored),
                count_redetected: parseInt(item.count_redetected),
                count_disappeared: parseInt(item.count_disappeared),
            }));
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
                data: {subject, offset, limit},
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
                data: {id: document_id},
            });
            return request.data.response;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count conflicts by list of document ids
     */
    public async countConflictsByDocumentId(document_ids: string[], state?: AnomalyState): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/count-conflict-by-document-ids`,
                method: 'POST',
                headers: this.headers,
                data: {document_ids, state},
            });
            return parseInt(request.data.response);
        } catch (err) {
            throw err;
        }
    }
}
