import { HttpClient, RetryOptions } from './HttpClient';

export abstract class BaseModule {
  private readonly http: HttpClient;

  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    this.http = new HttpClient(headers, baseUrl, retryOptions);
  }

  protected post<T>(endpoint: string, data: object = {}): Promise<T> {
    return this.http.post<T>(endpoint, data);
  }
}
