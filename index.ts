import { KMAudit } from './modules/KMAudit';
import { SemanticGraph } from './modules/SemanticGraph';
import { Orchestrator } from './modules/Orchestrator';
import { Document } from './modules/Document';
import { RetryOptions } from './modules/HttpClient';

export { RetryOptions } from './modules/HttpClient';

export interface KaiStudioCredentials {
  instanceId?: string;
  apiKey?: string;
  host?: string;
  Authorization?: string;
  apiHost?: string;
}

export enum State {
  INITIAL_SAVED = 'INITIAL_SAVED',
  UPDATED = 'UPDATED',
  ON_CONTENT_EXTRACT = 'ON_CONTENT_EXTRACT',
  CONTENT_EXTRACTED = 'CONTENT_EXTRACTED',
  ON_INDEXATION = 'ON_INDEXATION',
  INDEXED = 'INDEXED',
  PARSING_ERROR = 'PARSING_ERROR'
}

export class KaiInstanceApi {
  private credentials: KaiStudioCredentials;
  private _auditInstance: KMAudit;
  private _semanticGraph: SemanticGraph;
  private _orchestrator: Orchestrator;
  private _document: Document;

  constructor(credentials: KaiStudioCredentials, retryOptions?: RetryOptions) {
    if (!credentials.instanceId && !credentials.host) {
      throw new Error(
        'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
      );
    }

    this.credentials = credentials;

    const headers = this.buildHeaders(credentials);
    const baseUrl = this.resolveBaseUrl(credentials);

    this._auditInstance = new KMAudit(headers, baseUrl, retryOptions);
    this._semanticGraph = new SemanticGraph(headers, baseUrl, retryOptions);
    this._orchestrator = new Orchestrator(headers, baseUrl, retryOptions);
    this._document = new Document(headers, baseUrl, retryOptions);
  }

  private buildHeaders(credentials: KaiStudioCredentials): Record<string, string> {
    const headers: Record<string, string> = {};

    // Each credential is sent independently — callers provide only what they have
    if (credentials.instanceId) headers['instance-id'] = credentials.instanceId;
    if (credentials.apiKey) headers['api-key'] = credentials.apiKey;
    if (credentials.Authorization) headers['Authorization'] = credentials.Authorization;
    if (credentials.apiHost) headers['api-host'] = credentials.apiHost;

    return headers;
  }

  private resolveBaseUrl(credentials: KaiStudioCredentials): string {
    if (credentials.host) return credentials.host;
    return 'https://api.kai-studio.ai/';
  }

  public getCredentials(): KaiStudioCredentials {
    return this.credentials;
  }

  public auditInstance(): KMAudit {
    return this._auditInstance;
  }

  public semanticGraph(): SemanticGraph {
    return this._semanticGraph;
  }

  public orchestrator(): Orchestrator {
    return this._orchestrator;
  }

  public document(): Document {
    return this._document;
  }
}
