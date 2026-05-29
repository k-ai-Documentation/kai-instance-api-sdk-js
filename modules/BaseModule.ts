import { HttpClient, RetryOptions } from './HttpClient';

export abstract class BaseModule {
  private readonly http: HttpClient;

  constructor(headers: Record<string, string>, baseUrl: string, retryOptions?: RetryOptions) {
    this.http = new HttpClient(headers, baseUrl, retryOptions);
  }

  protected get<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.get<T>(endpoint, data);
  }

  protected post<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.post<T>(endpoint, data);
  }

  protected put<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.put<T>(endpoint, data);
  }

  protected patch<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.patch<T>(endpoint, data);
  }

  protected delete<T>(endpoint: string, data?: object): Promise<T> {
    return this.http.delete<T>(endpoint, data);
  }

  protected download(endpoint: string, data?: object): Promise<Buffer> {
    return this.http.download(endpoint, data);
  }
}
