import axios, { AxiosInstance } from 'axios';

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

  get<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('GET', endpoint, data);
  }

  post<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('POST', endpoint, data);
  }

  put<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('PUT', endpoint, data);
  }

  patch<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('PATCH', endpoint, data);
  }

  delete<T>(endpoint: string, data?: object): Promise<T> {
    return this.execute<T>('DELETE', endpoint, data);
  }

  private async execute<T>(method: string, endpoint: string, data?: object): Promise<T> {
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const config: Record<string, unknown> = { method, url: endpoint };
        if (data !== undefined) {
          if (method === 'GET') {
            config.params = data;
          } else {
            config.data = data;
          }
        }
        const response = await this.instance.request(config);
        return response.data.response as T;
      } catch (err: unknown) {
        const isAxErr = (err as any)?.isAxiosError === true;
        const shouldRetry = isAxErr
          ? (err as any).response === undefined || (err as any).response.status >= 500
          : false;
        if (!shouldRetry || attempt === this.maxRetries) {
          throw err;
        }
        await this.sleep(this.retryDelay * Math.pow(2, attempt));
      }
    }
    throw new Error('Unexpected end of retry loop');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
