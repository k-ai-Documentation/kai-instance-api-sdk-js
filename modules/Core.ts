import axios from "axios";

export class Core {

    private readonly headers: object;
    private readonly baseUrl: string;

    constructor(headers: object, baseUrl: string) {
        this.headers = headers
        this.baseUrl = baseUrl
    }

    public async countDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-documents`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            return 0
        }
    }

    public async countDetectedDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-detected-documents`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            return 0
        }
    }

    public async countIndexableDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-indexable-documents`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            return 0
        }
    }

    public async countIndexedDocuments(): Promise<number> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/stats/count-indexed-documents`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            return 0
        }
    }

    public async downloadFile(fileId: string): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/files/download`,
                method: 'POST',
                headers: this.headers,
                data: {
                    id: fileId
                }
            })
            return request.data.response
        } catch (e) {
            return null
        }
    }

    public async indexNewOrUpdatedDocument(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/differential-indexation`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            return null
        }
    }

    public async getAllScenarios(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/scenarios`,
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            return null
        }
    }

    public async listDocs(limit: number, offset: number): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}api/orchestrator/list-docs`,
                method: 'POST',
                headers: this.headers,
                data: {
                    limit: limit,
                    offset: offset
                }
            })
            return request.data.response
        } catch (e) {
            return null
        }
    }
}
