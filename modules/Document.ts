import { BaseModule } from './BaseModule';

export interface DocumentSignatureExtraproperties {
  audit_done: boolean;
  kb_signature: Record<string, string>;
  kai_internal_state: string;
  kai_internal_count_chunks: number;
}

export interface DocumentSignature {
  id: string;
  name: string;
  url?: string;
  extraproperties: DocumentSignatureExtraproperties;
}

export class Document extends BaseModule {
  async listDocuments(offset: number = 0, limit: number = 20, state?: string): Promise<DocumentSignature[]> {
    return this.post('api/document/list-docs', { offset, limit, state });
  }

  async getDocumentDetail(id: string): Promise<DocumentSignature | null> {
    return this.post('api/document/doc', { id });
  }

  async countDocuments(state?: string, documentIds?: string[]): Promise<number> {
    const payload: Record<string, unknown> = {};
    if (state !== undefined) payload.state = state;
    if (documentIds) payload.document_ids = documentIds;
    return this.post('api/document/count-documents', payload);
  }

  async downloadFile(documentId: string): Promise<Buffer> {
    return this.download('api/document/download', { id: documentId });
  }

  async docsByIds(ids: string[], offset: number = 0, limit: number = 20): Promise<DocumentSignature[]> {
    return this.post('api/document/docs-by-ids', { ids, offset, limit });
  }
}
