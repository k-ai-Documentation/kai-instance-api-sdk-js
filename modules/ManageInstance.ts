import axios from "axios";

export class ManageInstance {

    private readonly headers: object;
    private readonly baseUrl: string;

    constructor(headers: object) {
        this.headers = headers
        this.baseUrl = "https://api.kai-studio.ai"
    }

    public async getGlobalHealth(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}/global-health`,
                method: 'GET',
                headers: this.headers
            })
            return request.data
        } catch (e) {
            throw e
        }
    }

    public async isApiAlive(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}/health`,
                method: 'GET',
                headers: this.headers
            })
            return request.data
        } catch (e) {
            throw e
        }
    }

    public async generateNewApiKey(): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/generate-new-apikey',
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async updateName(name: string): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/update-name',
                method: 'POST',
                headers: this.headers,
                data: {
                    name
                }
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async deploy(): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/deploy',
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async delete(): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/delete',
                method: 'POST',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async addKb(type: string, options: any, searchGoal: any): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/add-kb',
                method: 'POST',
                headers: this.headers,
                data: {type, options, searchGoal}
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async setPlayground(typeList: string[]): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/set-playground',
                method: 'POST',
                headers: this.headers,
                data: {typeList}
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async updateKb(id: string, options: any, searchGoal: any): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/update-kb',
                method: 'POST',
                headers: this.headers,
                data: {id, options, searchGoal}
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }

    public async removeKb(id: string): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/remove-kb',
                method: 'POST',
                headers: this.headers,
                data: {id}
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
