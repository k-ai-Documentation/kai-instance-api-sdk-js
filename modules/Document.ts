import axios from "axios";

/**
 * DocumentSignatureExtraproperties
 * Extra properties for document signature
 */
export interface DocumentSignatureExtraproperties {
    audit_done: boolean;
    kb_signature: Record<string, string>;
    kai_internal_state: string;
    kai_internal_count_chunks: number;
    [key: string]: any;
}

/**
 * DocumentSignature
 * Document signature structure
 */
export interface DocumentSignature {
    id: string;
    name: string;
    url?: string;
    extraproperties: DocumentSignatureExtraproperties;
    [key: string]: any;
}

/**
 * Client for interacting with the documents API
 */
export class Document {
    private readonly baseUrl: string;
    private readonly headers: object;

    /**
     * Initialize the Document client.
     * @param headers HTTP headers required for API authentication.
     * @param baseUrl The base URL of the audit API.
     */
    constructor(headers: object, baseUrl: string) {
        this.baseUrl = baseUrl;
        this.headers = headers;
    }

    /**
     * List documents
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/documents#post-list-docs
     * @param offset Number of results to skip
     * @param limit Maximum number of results to return
     * @param state Optional document state filter
     * @returns Array of DocumentSignature
     */
    public async listDocuments(offset: number = 0, limit: number = 20, state?: string): Promise<DocumentSignature[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/document/list-docs`,
                method: 'POST',
                headers: this.headers,
                data: { offset, limit, state }
            });
            return request.data.response as DocumentSignature[];
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get document detail
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/documents#post-doc
     * @param id Document ID
     * @returns DocumentSignature
     */
    public async getDocumentDetail(id: string): Promise<DocumentSignature | null> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/document/doc`,
                method: 'POST',
                headers: this.headers,
                data: { id }
            });
            return request.data.response as DocumentSignature;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Count documents
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/documents#post-count-documents
     * @param state Optional document state filter
     * @returns Number of documents
     */
    public async countDocuments(state?: string): Promise<number> {
        try {
            const payload: any = {};
            if (state !== undefined) payload.state = state;
            const request = await axios({
                url: `${this.baseUrl}api/document/count-documents`,
                method: 'POST',
                headers: this.headers,
                data: payload
            });
            return request.data.response as number;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Download a document file by its ID
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/documents#post-download
     * @param documentId ID of the document to download
     * @returns Binary content of the document file
     */
    public async downloadFile(documentId: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/document/download`,
                method: 'POST',
                headers: this.headers,
                data: { id: documentId },
                responseType: 'arraybuffer'
            });
            return request.data;
        } catch (err) {
            throw err;
        }
    }

    /**
     * Get document information for multiple document IDs
     * documentation: https://k-ai.gitbook.io/knowledge-ai/api/api-presentation/documents#post-docs-by-ids
     * @param ids List of document IDs to retrieve
     * @param offset Number of results to skip
     * @param limit Maximum number of results to return
     * @returns Array of DocumentSignature
     */
    public async docsByIds(ids: string[], offset: number = 0, limit: number = 20): Promise<DocumentSignature[]> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/document/docs-by-ids`,
                method: 'POST',
                headers: this.headers,
                data: { ids, offset, limit }
            });
            return request.data.response as DocumentSignature[];
        } catch (err) {
            throw err;
        }
    }
}