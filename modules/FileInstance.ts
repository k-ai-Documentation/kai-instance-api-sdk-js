import axios from "axios";

/**
 * Represents the signature of a file in Kai Studio.
 */
export interface KaiStudioFileSignature {
    /** The name of the file. */
    name: string;
    /** Metadata associated with the file. */
    metadata: string;
    /** The last modified timestamp of the file. */
    lastModified: string;
    /** The size of the file in bytes. */
    size: number;
}

/**
 * Represents the response after attempting to upload a file.
 */
export interface KaiStudioFileUploadResponse {
    /** Indicates whether the upload was successful. */
    result: boolean;
    /** The reason for failure, if the upload was not successful. */
    reason: string;
}

/**
 * Handles file-related operations such as listing, downloading, uploading, and deleting files.
 */
export class FileInstance {
    private readonly headers: object;

    /**
     * Creates an instance of FileInstance.
     * 
     * @param {object} headers - The HTTP headers to include in requests.
     */
    constructor(headers: object) {
        this.headers = headers;
    }

    /**
     * Retrieves a list of available files in Kai Studio.
     * 
     * @returns {Promise<KaiStudioFileSignature[]>} A list of file signatures.
     * @throws {Error} Throws an error if the request fails.
     */
    public async listFiles(): Promise<KaiStudioFileSignature[]> {
        try {
            const request = await axios({
                url: 'https://fma.kai-studio.ai/list-files',
                method: 'POST',
                headers: this.headers
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Downloads a file by its name.
     * 
     * @param {string} fileName - The name of the file to download.
     * @returns {Promise<KaiStudioFileSignature[]>} The downloaded file data.
     * @throws {Error} Throws an error if the request fails.
     */
    public async downloadFile(fileName: string): Promise<KaiStudioFileSignature[]> {
        try {
            const request = await axios({
                url: 'https://fma.kai-studio.ai/download-file',
                method: 'POST',
                headers: this.headers,
                data: {
                    fileName: fileName
                }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Uploads one or more files to Kai Studio.
     * 
     * @param {File[]} files - The list of files to upload.
     * @returns {Promise<KaiStudioFileUploadResponse[]>} The response indicating success or failure for each file.
     * @throws {Error} Throws an error if the request fails.
     */
    public async uploadFiles(files: File[]): Promise<KaiStudioFileUploadResponse[]> {
        if (files.length === 0) {
            return [];
        }
        try {
            const formData = new FormData();
            for (let i = 0; i < files.length; i++) {
                formData.append(`files`, files[i]);
            }
            const request = await axios.post('https://fma.kai-studio.ai/upload-file', formData, {
                headers: {
                    ...this.headers,
                    "Content-Type": "multipart/form-data; charset=utf-8",
                }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }

    /**
     * Deletes a file by its name.
     * 
     * @param {string} fileName - The name of the file to delete.
     * @returns {Promise<boolean>} `true` if the file was successfully deleted, otherwise `false`.
     * @throws {Error} Throws an error if the request fails.
     */
    public async removeFile(fileName: string): Promise<boolean> {
        try {
            const request = await axios({
                url: 'https://fma.kai-studio.ai/delete-file',
                method: 'POST',
                headers: this.headers,
                data: {
                    file: fileName
                }
            });
            return request.data.response;
        } catch (e) {
            throw e;
        }
    }
}