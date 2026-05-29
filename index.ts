import { KMAudit } from './modules/KMAudit';
import { SemanticGraph } from './modules/SemanticGraph';
import { Orchestrator } from './modules/Orchestrator';
import { Document } from './modules/Document';
import { RetryOptions } from './modules/HttpClient';

export { RetryOptions } from './modules/HttpClient';

/** Credentials for connecting to Kai Studio. All fields are optional — provide what your deployment requires. */
export interface KaiStudioCredentials {
  /** SaaS instance identifier. Sets the `instance-id` request header. Required for cloud-hosted deployments. */
  instanceId?: string;
  /** API key. Sets the `api-key` request header. */
  apiKey?: string;
  /** Base URL for self-hosted (Premise) deployments (e.g. `https://your-server.example.com/`). Overrides the default SaaS URL. */
  host?: string;
  /** Authorization header value (e.g. `Bearer <token>`). */
  Authorization?: string;
  /** Sets the `api-host` request header. */
  apiHost?: string;
}

/** Document processing lifecycle states. */
export enum State {
  /** Document type not supported or parsing failed. */
  PARSING_ERROR = 'PARSING_ERROR',
  /** Document saved, not yet processed. */
  INITIAL_SAVED = 'INITIAL_SAVED',
  /** Document metadata updated. */
  UPDATED = 'UPDATED',
  /** Content extraction in progress. */
  ON_CONTENT_EXTRACT = 'ON_CONTENT_EXTRACT',
  /** Content extracted and split into chunks. */
  CONTENT_EXTRACTED = 'CONTENT_EXTRACTED',
  /** Indexation in progress. */
  ON_INDEXATION = 'ON_INDEXATION',
  /** Fully indexed and ready for queries. */
  INDEXED = 'INDEXED',
}

/**
 * Main entry point for the Kai Studio SDK.
 *
 * Constructs all four module clients and exposes them via accessor methods.
 * Supports two deployment modes:
 * - **SaaS**: pass `instanceId` (and optionally `apiKey`). Base URL defaults to `https://api.kai-studio.ai/`.
 * - **Premise**: pass `host` to override the base URL.
 *
 * @example
 * // SaaS
 * const api = new KaiInstanceApi({ instanceId: 'YOUR_ID', apiKey: 'YOUR_KEY' });
 *
 * @example
 * // Premise
 * const api = new KaiInstanceApi({ host: 'https://your-server.example.com/' });
 *
 * @example
 * // With custom retry and timeout
 * const api = new KaiInstanceApi(
 *   { instanceId: 'YOUR_ID', apiKey: 'YOUR_KEY' },
 *   { maxRetries: 5, retryDelay: 500, timeout: 60000 }
 * );
 */
export class KaiInstanceApi {
  private credentials: KaiStudioCredentials;
  private _auditInstance: KMAudit;
  private _semanticGraph: SemanticGraph;
  private _orchestrator: Orchestrator;
  private _document: Document;

  /**
   * @param credentials - Connection credentials. See {@link KaiStudioCredentials}.
   * @param retryOptions - Optional retry and timeout configuration. See {@link RetryOptions}.
   */
  constructor(credentials: KaiStudioCredentials, retryOptions?: RetryOptions) {
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

  /** Returns the credentials that were passed at construction time. */
  public getCredentials(): KaiStudioCredentials {
    return this.credentials;
  }

  /** Returns the {@link KMAudit} module for conflict anomaly management. */
  public auditInstance(): KMAudit {
    return this._auditInstance;
  }

  /** Returns the {@link SemanticGraph} module for knowledge graph node exploration. */
  public semanticGraph(): SemanticGraph {
    return this._semanticGraph;
  }

  /** Returns the {@link Orchestrator} module for indexation triggers and background task monitoring. */
  public orchestrator(): Orchestrator {
    return this._orchestrator;
  }

  /** Returns the {@link Document} module for document listing, detail, and download. */
  public document(): Document {
    return this._document;
  }
}
