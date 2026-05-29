import { BaseModule } from './BaseModule';

/** Indexation triggers and background task monitoring module. Access via `api.orchestrator()`. */
export class Orchestrator extends BaseModule {
  /**
   * Triggers a differential (partial) indexation run, processing only documents
   * that have changed since the last indexation.
   *
   * @returns `true` if the indexation was successfully triggered.
   */
  async launchPartialIndexation(): Promise<boolean> {
    return this.post('api/orchestrator/differential-indexation', {});
  }

  /**
   * Triggers re-indexation of a single document.
   * Use this to force a specific document to be reprocessed without running a full indexation.
   *
   * @param document_id - The ID of the document to reindex.
   * @returns `true` if the reindex was successfully triggered.
   */
  async reindexDocument(document_id: string): Promise<boolean> {
    return this.post('api/orchestrator/reindex-document', { id: document_id });
  }

  /**
   * Retries indexation for all documents currently in `PARSING_ERROR` state.
   *
   * @returns `true` if the retry was successfully triggered.
   */
  async retryIndexErrorParsingDocuments(): Promise<boolean> {
    return this.post('api/orchestrator/retry-documents-parsing-error', {});
  }

  /**
   * Returns the count of all currently registered background tasks, grouped by type.
   *
   * @returns A map of task type → count (e.g. `{ indexation: 3, extraction: 1 }`).
   */
  async countRegisteredBackgroundTasks(): Promise<Record<string, number>> {
    return this.post('api/orchestrator/count-back-tasks', {});
  }

  /**
   * Returns the count of background tasks registered for a specific document, grouped by type.
   *
   * @param document_id - The document ID to query tasks for.
   * @returns A map of task type → count for that document.
   */
  async countRegisteredBackgroundTasksForDoc(document_id: string): Promise<Record<string, number>> {
    return this.post('api/orchestrator/count-tasks-for-doc', { id: document_id });
  }
}
