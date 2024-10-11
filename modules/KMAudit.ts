import axios from "axios";

export interface ConflictInformation {
    id: string,
    state: string,
    subject: string,
    creation_date: string,
    docsRef: Document[],
    documents: InvolvedInformation[]
}

export interface DuplicateInformation {
    id: string,
    state: string,
    subject: string,
    creation_date: string,
    docsRef: Document[],
    documents: InvolvedInformation[]
}

export interface MissingSubject {
    id: number,
    information_needed: string,
    questions: string[],
    subject: string
}

export interface Document {
    id: string,
    name: string,
    url: string
}

export interface InvolvedInformation {
    docId: string,
    information_involved: string
}

export interface Task {
    conflicts: string[],
    duplicates: string[]
}


export class KMAudit {

    private readonly headers: object;
    private readonly baseUrl: string;

    constructor(headers: object, baseUrl: string) {
        this.headers = headers
        this.baseUrl = baseUrl
    }

    public async getConflictInformation(limit: number, offset: number): Promise<ConflictInformation[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getDuplicatedInformation(limit: number, offset: number): Promise<DuplicateInformation[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async setConflictManaged(id: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/conflict-information/set-managed`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async setDuplicatedInformationManaged(id: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/duplicated-information/set-managed`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getDocumentsToManageList(limit: number, offset: number): Promise<Document[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/documents-to-manage`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getMissingSubjectList(limit: number, offset: number): Promise<MissingSubject[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/missing-subjects`,
                method: 'POST',
                headers: this.headers,
                data: {
                    offset: offset,
                    limit: limit
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async getAllTasksLinkedToDocument(id: string): Promise<Task[] | any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/audit/document/tasks`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: id
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
