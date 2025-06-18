import axios from "axios";

/**
 * Class to manage API instances, providing functionality for health checks,
 * key management, deployment, and knowledge base (KB) operations.
 */
export class ManageInstance {
    private readonly headers: object;
    private readonly baseUrl: string;

    /**
     * Initializes the ManageInstance class.
     * 
     * @param {object} headers - HTTP headers to include in API requests.
     */
    constructor(headers: object) {
        this.headers = headers;
        this.baseUrl = "https://api.kai-studio.ai";
    }

    /**
     * Retrieves the global health status of the API.
     * 
     * @returns {Promise<any>} API response containing health status details.
     */
    public async getGlobalHealth(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}/global-health`,
                method: 'POST',
                headers: this.headers
            });
            return request.data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Checks if the API is alive.
     * 
     * @returns {Promise<any>} API response indicating if the service is running.
     */
    public async isApiAlive(): Promise<any> {
        try {
            const request = await axios({
                url: `${this.baseUrl}/health`,
                method: 'POST',
                headers: this.headers
            });
            return request.data;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Generates a new API key.
     * 
     * @returns {Promise<boolean>} True if the key is successfully generated.
     */
    public async generateNewApiKey(): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/generate-new-apikey',
                method: 'POST',
                headers: this.headers
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates the instance name.
     * 
     * @param {string} name - New name for the instance.
     * @returns {Promise<boolean>} True if the name update is successful.
     */
    public async updateName(name: string): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/update-name',
                method: 'POST',
                headers: this.headers,
                data: { name }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deploys the instance.
     * 
     * @returns {Promise<boolean>} True if deployment is successful.
     */
    public async deploy(): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/deploy',
                method: 'POST',
                headers: this.headers
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes the instance.
     * 
     * @returns {Promise<boolean>} True if deletion is successful.
     */
    public async delete(): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/delete',
                method: 'POST',
                headers: this.headers
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Adds a new knowledge base (KB) entry.
     * 
     * @param {string} type - Type of knowledge base entry.
     * @param {any} options - Additional options for the KB entry.
     * @param {any} searchGoal - Search goal associated with the KB entry.
     * @returns {Promise<boolean>} True if KB addition is successful.
     */
    public async addKb(type: string, options: any, searchGoal: any): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/add-kb',
                method: 'POST',
                headers: this.headers,
                data: { type, options, searchGoal }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Sets the playground configuration.
     * 
     * @param {string[]} typeList - List of KB types to configure for the playground.
     * @returns {Promise<boolean>} True if configuration is successful.
     */
    public async setPlayground(typeList: string[]): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/set-playground',
                method: 'POST',
                headers: this.headers,
                data: { typeList }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Updates an existing knowledge base (KB) entry.
     * 
     * @param {string} id - ID of the KB entry to update.
     * @param {any} options - Updated options for the KB entry.
     * @param {any} searchGoal - Updated search goal for the KB entry.
     * @returns {Promise<boolean>} True if KB update is successful.
     */
    public async updateKb(id: string, options: any, searchGoal: any): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/update-kb',
                method: 'POST',
                headers: this.headers,
                data: { id, options, searchGoal }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Removes a knowledge base (KB) entry.
     * 
     * @param {string} id - ID of the KB entry to remove.
     * @returns {Promise<boolean>} True if KB removal is successful.
     */
    public async removeKb(id: string): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://ima.kai-studio.ai/remove-kb',
                method: 'POST',
                headers: this.headers,
                data: { id }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Get the current version of the API.
     * @returns A promise resolving to the current version of the API.
     */
    public async getVersion(): Promise<string> {
        try {
            const request = await axios({
                url: `${this.baseUrl}version`,
                method: 'GET',
                headers: this.headers
            })
            return request.data.response
        } catch (e) {
            throw e
        }
    }
}
