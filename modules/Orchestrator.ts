import { BaseModule } from './BaseModule';
import { RetryOptions } from './HttpClient';

export class Orchestrator extends BaseModule {
  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    super(headers, baseUrl, retryOptions);
  }

  async launchPartialIndexation(): Promise<boolean> {
    return this.post('api/orchestrator/differential-indexation', {});
  }

  async reindexDocument(document_id: string): Promise<boolean> {
    return this.post('api/orchestrator/reindex-document', { id: document_id });
  }

  async retryIndexErrorParsingDocuments(): Promise<boolean> {
    return this.post('api/orchestrator/retry-documents-parsing-error', {});
  }

  async countRegisteredBackgroundTasks(): Promise<Record<string, number>> {
    return this.post('api/orchestrator/count-back-tasks', {});
  }

  async countRegisteredBackgroundTasksForDoc(document_id: string): Promise<Record<string, number>> {
    return this.post('api/orchestrator/count-tasks-for-doc', { id: document_id });
  }
}
