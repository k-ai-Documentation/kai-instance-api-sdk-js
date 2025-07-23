// import {FileInstance} from "./modules/FileInstance";
import {ManageInstance} from "./modules/ManageInstance";
import {Search} from "./modules/Search";
import {KMAudit} from "./modules/KMAudit";
import {SemanticGraph} from "./modules/SemanticGraph";
// import {Core} from "./modules/Core";
import {Chatbot} from "./modules/Chatbot";
import { Orchestrator } from "./modules/Orchestrator";
import { Document } from "./modules/Document";

export interface KaiStudioCredentials {
    instanceId?: any,
    apiKey?: any,
    host?: any
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

export class KaiStudio {

    private readonly credentials: KaiStudioCredentials;
    private readonly _search: Search;
    // private readonly _fileInstance: FileInstance;
    private readonly _manageInstance: ManageInstance;
    private readonly _auditInstance: KMAudit;
    private readonly _semanticGraph: SemanticGraph;
    // private readonly _core: Core;
    private readonly _chatbot: Chatbot;
    private readonly _orchestrator: Orchestrator;
    private readonly _document: Document;

    constructor(credentials: KaiStudioCredentials) {
        this.credentials = credentials
        let headers = {}, baseUrl = ''

        if (this.credentials.instanceId && this.credentials.apiKey) {
            headers = {
                'instance-id': this.credentials.instanceId,
                'api-key': this.credentials.apiKey
            }

            baseUrl = `https://api.kai-studio.ai/`
        }

        if (this.credentials.host) {
            baseUrl = this.credentials.host
            if (this.credentials.apiKey) {
                headers = {
                    'api-key': this.credentials.apiKey
                }
            }
        }


        this._search = new Search(headers, baseUrl)
        this._auditInstance = new KMAudit(headers, baseUrl)
        this._semanticGraph = new SemanticGraph(headers, baseUrl)
        this._manageInstance = new ManageInstance(headers)
        // this._fileInstance = new FileInstance(headers)
        // this._core = new Core(headers, baseUrl)
        this._chatbot = new Chatbot(headers, baseUrl)
        this._orchestrator = new Orchestrator(headers, baseUrl)
        this._document = new Document(headers, baseUrl)
    }

    public getCredentials(): KaiStudioCredentials {
        return this.credentials
    }

    public search(): Search {
        return this._search
    }

    // public fileInstance(): FileInstance {
    //     return this._fileInstance
    // }

    public manageInstance(): ManageInstance {
        return this._manageInstance
    }

    public auditInstance(): KMAudit {
        return this._auditInstance
    }

    public semanticGraph(): SemanticGraph {
        return this._semanticGraph
    }

    // public core(): Core {
    //     return this._core
    // }

    public chatbot(): Chatbot {
        return this._chatbot
    }

    public orchestrator(): Orchestrator {
        return this._orchestrator
    }

    public document(): Document {
        return this._document
    }
}

