import { BaseModule } from './BaseModule';

export enum AnomalyState {
  MANAGED = 'managed',
  IGNORED = 'ignored',
  DETECTED = 'detected',
  REDETECTED = 'redetected',
  DISAPPEARED = 'disappeared'
}

export interface AnomalyInformationDocument {
  doc_id: string;
  information_involved: string;
}

export interface Anomaly {
  id: string;
  subject: string;
  state: string;
  documents: AnomalyInformationDocument[];
  explanation: string;
}

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

export class KMAudit extends BaseModule {
  async updateConflictState(id: string, state: AnomalyState): Promise<boolean> {
    return this.post('api/audit/conflict-information/set-state', { id, state });
  }

  async countConflicts(): Promise<number> {
    return this.post('api/audit/count-conflict-information', {});
  }

  async listConflicts(limit: number = 200, offset: number = 0, query?: string, document_name?: string, state?: AnomalyState): Promise<Anomaly[]> {
    return this.post('api/audit/conflict-information', { limit, offset, query, document_name, state });
  }

  async countAnomaliesPerDocument(limit: number = 20, offset: number = 0, document_ids?: string[]): Promise<Record<string, Record<string, number>>> {
    return this.post('api/audit/document-ids-to-manage', { limit, offset, document_ids });
  }

  async getAnomaliesForDocument(document_id: string): Promise<DocumentAnomalies> {
    return this.post('api/audit/get-anomalies-for-document', { id: document_id });
  }

  async countConflictsForPeriod(begin_date: string, end_date: string, state?: string): Promise<Record<string, Record<string, number>>> {
    return this.post('api/audit/count-conflict-by-date', { begin_date, end_date, state });
  }

  async countConflictsByState(state: string): Promise<number> {
    return (await this.post<number>('api/audit/count-conflicts-by-state', { state })) ?? 0;
  }

  async getConflictDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string, state?: string, sortOrder?: string): Promise<any[]> {
    return this.post('api/audit/get-conflict-document-pair', { limit, offset, document_name, state, order: sortOrder });
  }

  async getConflictsByDocumentPair(document_ids: string[], limit: number = 200, offset: number = 0, state: string = ''): Promise<Anomaly[]> {
    return this.post('api/audit/get-conflicts-by-document-id-pair', { document_ids, limit, offset, state });
  }

  async countConflictsPerSubject(document_ids?: string[]): Promise<AnomalyTypeNumber[]> {
    const raw: any[] = await this.post('api/audit/count-conflict-by-subject', { document_ids });
    return raw.map(item => ({
      subject: item.subject,
      count: parseInt(item.count),
      count_detected: parseInt(item.count_detected),
      count_managed: parseInt(item.count_managed),
      count_ignored: parseInt(item.count_ignored),
      count_redetected: parseInt(item.count_redetected),
      count_disappeared: parseInt(item.count_disappeared),
    }));
  }

  async getConflictsBySubject(subject?: string, offset: number = 0, limit: number = 50): Promise<Anomaly[]> {
    return this.post('api/audit/get-conflict-information-by-subject', { subject, offset, limit });
  }

  async checkIfDocumentIsAudited(document_id: string): Promise<boolean> {
    return this.post('api/audit/document-is-analyzed', { id: document_id });
  }

  async countConflictsByDocumentId(document_ids: string[], state?: AnomalyState): Promise<number> {
    const raw: string = await this.post('api/audit/count-conflict-by-document-ids', { document_ids, state });
    return parseInt(raw);
  }
}
