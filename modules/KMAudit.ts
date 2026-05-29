import { BaseModule } from './BaseModule';

/** Lifecycle state of a conflict anomaly. */
export enum AnomalyState {
  MANAGED = 'managed',
  IGNORED = 'ignored',
  DETECTED = 'detected',
  REDETECTED = 'redetected',
  DISAPPEARED = 'disappeared',
}

/** A document fragment involved in a conflict anomaly. */
export interface AnomalyInformationDocument {
  /** ID of the document containing conflicting information. */
  doc_id: string;
  /** Description of the conflicting content within the document. */
  information_involved: string;
}

/** A conflict anomaly between two or more documents. */
export interface Anomaly {
  /** Unique anomaly identifier. */
  id: string;
  /** Subject or topic of the conflict. */
  subject: string;
  /** Current state of the anomaly. */
  state: AnomalyState;
  /** Documents involved in the conflict. */
  documents: AnomalyInformationDocument[];
  /** Human-readable explanation of the conflict. */
  explanation: string;
}

/** All anomalies associated with a single document. */
export interface DocumentAnomalies {
  conflicts: Anomaly[];
}

/** Conflict counts broken down by state for a given subject. */
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
 * A document pair that shares at least one conflict anomaly.
 * @remarks Field names should be verified against actual API responses before use.
 */
export interface ConflictDocumentPair {
  // IMPORTANT: Verify these field names against actual API response before shipping
  document_ids: string[];
  conflict_count: number;
  state: string;
}

/** Conflict anomaly management module. Access via `api.auditInstance()`. */
export class KMAudit extends BaseModule {
  /**
   * Updates the state of a conflict anomaly (e.g. mark as managed or ignored).
   *
   * @param id - The anomaly ID to update.
   * @param state - The new {@link AnomalyState} to assign.
   * @returns `true` if the update succeeded.
   */
  async updateConflictState(id: string, state: AnomalyState): Promise<boolean> {
    return this.post('api/audit/conflict-information/set-state', { id, state });
  }

  /**
   * Returns the total number of conflict anomalies across all documents.
   *
   * @returns Total conflict count.
   */
  async countConflicts(): Promise<number> {
    return this.post('api/audit/count-conflict-information', {});
  }

  /**
   * Returns a paginated list of conflict anomalies with optional filters.
   *
   * @param limit - Maximum number of conflicts to return. Defaults to `200`.
   * @param offset - Number of conflicts to skip. Defaults to `0`.
   * @param query - Optional text search query to filter conflicts.
   * @param document_name - Optional document name filter.
   * @param state - Optional {@link AnomalyState} filter.
   * @returns Array of matching {@link Anomaly} objects.
   */
  async listConflicts(limit: number = 200, offset: number = 0, query?: string, document_name?: string, state?: AnomalyState): Promise<Anomaly[]> {
    return this.post('api/audit/conflict-information', { limit, offset, query, document_name, state });
  }

  /**
   * Returns conflict counts grouped by document ID.
   *
   * @param limit - Maximum number of documents to return. Defaults to `20`.
   * @param offset - Number of documents to skip. Defaults to `0`.
   * @param document_ids - Optional array of document IDs to restrict results to.
   * @returns A map of document ID → state → count.
   */
  async countAnomaliesPerDocument(limit: number = 20, offset: number = 0, document_ids?: string[]): Promise<Record<string, Record<string, number>>> {
    return this.post('api/audit/document-ids-to-manage', { limit, offset, document_ids });
  }

  /**
   * Returns all anomalies associated with a specific document.
   *
   * @param document_id - The document ID to query.
   * @returns A {@link DocumentAnomalies} object containing all conflicts for that document.
   */
  async getAnomaliesForDocument(document_id: string): Promise<DocumentAnomalies> {
    return this.post('api/audit/get-anomalies-for-document', { id: document_id });
  }

  /**
   * Returns conflict counts grouped by date within a time period.
   *
   * @param begin_date - Start of the period (ISO date string, e.g. `'2026-01-01'`).
   * @param end_date - End of the period (ISO date string, e.g. `'2026-01-31'`).
   * @param state - Optional state filter.
   * @returns A map of date → state → count.
   */
  async countConflictsForPeriod(begin_date: string, end_date: string, state?: string): Promise<Record<string, Record<string, number>>> {
    return this.post('api/audit/count-conflict-by-date', { begin_date, end_date, state });
  }

  /**
   * Returns the number of conflicts matching a specific state.
   *
   * @param state - The state string to filter by (e.g. `'detected'`).
   * @returns The conflict count for that state.
   */
  async countConflictsByState(state: string): Promise<number> {
    return (await this.post<number>('api/audit/count-conflicts-by-state', { state })) ?? 0;
  }

  /**
   * Returns document pairs that share conflict anomalies, with optional filters.
   *
   * @param limit - Maximum number of pairs to return. Defaults to `200`.
   * @param offset - Number of pairs to skip. Defaults to `0`.
   * @param document_name - Optional document name filter.
   * @param state - Optional state filter.
   * @param sortOrder - Optional sort order for the results.
   * @returns Array of {@link ConflictDocumentPair} objects.
   */
  async getConflictDocumentPairs(limit: number = 200, offset: number = 0, document_name?: string, state?: string, sortOrder?: string): Promise<ConflictDocumentPair[]> {
    return this.post('api/audit/get-conflict-document-pair', { limit, offset, document_name, state, order: sortOrder });
  }

  /**
   * Returns conflicts between a specific pair of documents.
   *
   * @param document_ids - Array of exactly two document IDs.
   * @param limit - Maximum number of conflicts to return. Defaults to `200`.
   * @param offset - Number of conflicts to skip. Defaults to `0`.
   * @param state - Optional state filter. Defaults to `''` (all states).
   * @returns Array of {@link Anomaly} objects shared between the two documents.
   */
  async getConflictsByDocumentPair(document_ids: string[], limit: number = 200, offset: number = 0, state: string = ''): Promise<Anomaly[]> {
    return this.post('api/audit/get-conflicts-by-document-id-pair', { document_ids, limit, offset, state });
  }

  /**
   * Returns conflict counts grouped by subject, broken down by state.
   * The API returns counts as strings; this method parses them to integers.
   *
   * @param document_ids - Optional array of document IDs to restrict results to.
   * @returns Array of {@link AnomalyTypeNumber} objects with integer counts per state.
   */
  async countConflictsPerSubject(document_ids?: string[]): Promise<AnomalyTypeNumber[]> {
    const raw: any[] = await this.post('api/audit/count-conflict-by-subject', { document_ids });
    return raw.map(item => ({
      subject: item.subject,
      count: parseInt(item.count, 10),
      count_detected: parseInt(item.count_detected, 10),
      count_managed: parseInt(item.count_managed, 10),
      count_ignored: parseInt(item.count_ignored, 10),
      count_redetected: parseInt(item.count_redetected, 10),
      count_disappeared: parseInt(item.count_disappeared, 10),
    }));
  }

  /**
   * Returns conflicts filtered by subject.
   *
   * @param subject - Optional subject string to filter by.
   * @param offset - Number of results to skip. Defaults to `0`.
   * @param limit - Maximum number of results to return. Defaults to `50`.
   * @returns Array of matching {@link Anomaly} objects.
   */
  async getConflictsBySubject(subject?: string, offset: number = 0, limit: number = 50): Promise<Anomaly[]> {
    return this.post('api/audit/get-conflict-information-by-subject', { subject, offset, limit });
  }

  /**
   * Returns whether a document has been analyzed for anomalies.
   *
   * @param document_id - The document ID to check.
   * @returns `true` if the document has been audited.
   */
  async checkIfDocumentIsAudited(document_id: string): Promise<boolean> {
    return this.post('api/audit/document-is-analyzed', { id: document_id });
  }

  /**
   * Returns the total number of conflicts involving the given documents.
   * The API returns the count as a string; this method parses it to an integer.
   *
   * @param document_ids - Array of document IDs to count conflicts for.
   * @param state - Optional {@link AnomalyState} filter.
   * @returns The conflict count as an integer.
   */
  async countConflictsByDocumentId(document_ids: string[], state?: AnomalyState): Promise<number> {
    const raw: string = await this.post('api/audit/count-conflict-by-document-ids', { document_ids, state });
    return parseInt(raw, 10);
  }
}
