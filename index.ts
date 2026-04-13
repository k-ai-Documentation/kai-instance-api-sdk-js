import {KMAudit} from "./modules/KMAudit";
import {SemanticGraph} from "./modules/SemanticGraph";
import {Orchestrator} from "./modules/Orchestrator";
import {Document} from "./modules/Document";

export interface KaiStudioCredentials {
    instanceId?: any,
    apiKey?: any,
    host?: any,
    Authorization?: string,
    apiHost?: string,
}

export enum State {
    INITIAL_SAVED = 'INITIAL_SAVED',
    UPDATED = "UPDATED",
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

    constructor(credentials: KaiStudioCredentials) {
        this.credentials = credentials;

        const headers = this.buildHeaders(credentials);
        const baseUrl = this.resolveBaseUrl(credentials);

        this._auditInstance = new KMAudit(headers, baseUrl);
        this._semanticGraph = new SemanticGraph(headers, baseUrl);
        this._orchestrator = new Orchestrator(headers, baseUrl);
        this._document = new Document(headers, baseUrl);
    }

    private buildHeaders(credentials: KaiStudioCredentials): Record<string, string> {
        const headers: Record<string, string> = {};

        if (credentials.instanceId && credentials.apiKey) {
            headers["instance-id"] = credentials.instanceId;
            headers["api-key"] = credentials.apiKey;

            if (credentials.Authorization) {
                headers["Authorization"] = credentials.Authorization;
            }
        }

        if (credentials.host) {
            if (credentials.apiKey) headers["api-key"] = credentials.apiKey;
            if (credentials.instanceId) headers["instance-id"] = credentials.instanceId;
        }

        if (credentials.apiHost) {
            headers["api-host"] = credentials.apiHost;
        }

        return headers;
    }

    private resolveBaseUrl(credentials: KaiStudioCredentials): string {
        if (credentials.host) {
            return credentials.host;
        }

        if (typeof import.meta !== "undefined" && import.meta.env.VITE_APP_API_URL) {
            return import.meta.env.VITE_APP_API_URL;
        }

        return "https://api.kai-studio.ai/";
    }

    public getCredentials(): KaiStudioCredentials {
        return this.credentials
    }

    public auditInstance(): KMAudit {
        return this._auditInstance
    }

    public semanticGraph(): SemanticGraph {
        return this._semanticGraph
    }

    public orchestrator(): Orchestrator {
        return this._orchestrator
    }

    public document(): Document {
        return this._document
    }
}

