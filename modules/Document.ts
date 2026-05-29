import { BaseModule } from './BaseModule';

export interface DocumentSignatureExtraproperties {
  audit_done: boolean;
  kb_signature: Record<string, string>;
  kai_internal_state: string;
  kai_internal_count_chunks: number;
}

/** Metadata describing a document stored in Kai Studio. */
export interface DocumentSignature {
  /** Unique document identifier. */
  id: string;
  /** Display name of the document. */
  name: string;
  /** Optional source URL of the document. */
  url?: string;
  /** Internal metadata set by Kai Studio during processing. */
  extraproperties: DocumentSignatureExtraproperties;
}

/** Document management module. Access via `api.document()`. */
export class Document extends BaseModule {
  /**
   * Returns a paginated list of documents, optionally filtered by processing state.
   *
   * @param offset - Number of documents to skip. Defaults to `0`.
   * @param limit - Maximum number of documents to return. Defaults to `20`.
   * @param state - Optional state filter (e.g. `'INDEXED'`, `'PARSING_ERROR'`). See the `State` enum in `index.ts`.
   * @returns Array of matching {@link DocumentSignature} objects.
   */
  async listDocuments(offset: number = 0, limit: number = 20, state?: string): Promise<DocumentSignature[]> {
    return this.post('api/document/list-docs', { offset, limit, state });
  }

  /**
   * Fetches the full metadata for a single document.
   *
   * @param id - The document ID to look up.
   * @returns The {@link DocumentSignature} if found, or `null`.
   */
  async getDocumentDetail(id: string): Promise<DocumentSignature | null> {
    return this.post('api/document/doc', { id });
  }

  /**
   * Returns the total number of documents, optionally filtered by state and/or a set of IDs.
   *
   * @param state - Optional state filter (e.g. `'INDEXED'`).
   * @param documentIds - Optional array of document IDs to restrict the count to.
   * @returns The document count.
   */
  async countDocuments(state?: string, documentIds?: string[]): Promise<number> {
    const payload: Record<string, unknown> = {};
    if (state !== undefined) payload.state = state;
    if (documentIds) payload.document_ids = documentIds;
    return this.post('api/document/count-documents', payload);
  }

  /**
   * Downloads the raw binary content of a document.
   *
   * Uses `responseType: 'arraybuffer'` and returns the raw `Buffer` directly —
   * the standard `response.data.response` envelope is not applied here.
   *
   * @param documentId - The ID of the document to download.
   * @returns A `Buffer` containing the raw file bytes.
   */
  async downloadFile(documentId: string): Promise<Buffer> {
    return this.download('api/document/download', { id: documentId });
  }

  /**
   * Fetches multiple documents by their IDs in a single request.
   *
   * @param ids - Array of document IDs to retrieve.
   * @param offset - Number of results to skip. Defaults to `0`.
   * @param limit - Maximum number of results to return. Defaults to `20`.
   * @returns Array of matching {@link DocumentSignature} objects.
   */
  async docsByIds(ids: string[], offset: number = 0, limit: number = 20): Promise<DocumentSignature[]> {
    return this.post('api/document/docs-by-ids', { ids, offset, limit });
  }
}
