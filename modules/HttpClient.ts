import axios, { AxiosInstance, isAxiosError } from 'axios';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
}

export class HttpClient {
  private readonly instance: AxiosInstance;
  private readonly maxRetries: number;
  private readonly retryDelay: number;

  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    this.maxRetries = retryOptions?.maxRetries ?? 3;
    this.retryDelay = retryOptions?.retryDelay ?? 1000;
    this.instance = axios.create({ baseURL: baseUrl, headers });
  }

  async post<T>(endpoint: string, data: object = {}): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await this.instance.post(endpoint, data);
        return response.data.response as T;
      } catch (err: unknown) {
        const isAxErr = isAxiosError(err);
        const shouldRetry = isAxErr
          ? err.response === undefined || err.response.status >= 500
          : false;
        if (!shouldRetry || attempt === this.maxRetries) {
          throw err;
        }
        await this.sleep(this.retryDelay * Math.pow(2, attempt));
      }
    }
    // unreachable — loop always throws or returns
    throw new Error('Unexpected end of retry loop');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
