import axios from 'axios';
import { HttpClient } from '../modules/HttpClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

function makeAxiosError(status?: number) {
  return {
    isAxiosError: true,
    response: status !== undefined ? { status } : undefined,
    message: status !== undefined ? `Request failed with status ${status}` : 'Network Error',
  };
}

describe('HttpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── success path ──────────────────────────────────────────────────────────

  it('returns response.data.response on success', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: 'ok' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    const result = await client.post('api/test', {});

    expect(result).toBe('ok');
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'POST', url: 'api/test', data: {} })
    );
  });

  // ── retry behaviour ───────────────────────────────────────────────────────

  it('retries on 502/503/504 and eventually throws', async () => {
    const error = makeAxiosError(503);
    const mockRequest = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 2, retryDelay: 10 });

    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockRequest).toHaveBeenCalledTimes(3);
  });

  it('does not retry on 500 (server bug, not transient)', async () => {
    const error = makeAxiosError(500);
    const mockRequest = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 3, retryDelay: 10 });

    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('does not retry on 4xx', async () => {
    const error = makeAxiosError(404);
    const mockRequest = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 3, retryDelay: 10 });

    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('retries on network error (no response) and recovers', async () => {
    const networkError = makeAxiosError();
    const mockRequest = jest.fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({ data: { response: 'recovered' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 2, retryDelay: 10 });
    const result = await client.post('api/test', {});

    expect(result).toBe('recovered');
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('uses exponential backoff between retries', async () => {
    const delays: number[] = [];
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: any, ms?: number) => {
      delays.push(ms ?? 0);
      fn();
      return 0 as any;
    });

    const error = makeAxiosError(503);
    const mockRequest = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 3, retryDelay: 1000 });
    await expect(client.post('api/test', {})).rejects.toEqual(error);

    expect(delays).toEqual([1000, 2000, 4000]);
    jest.restoreAllMocks();
  });

  it('uses default maxRetries=3 and retryDelay=1000 when not specified', async () => {
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => { fn(); return 0 as any; });

    const error = makeAxiosError(503);
    const mockRequest = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    await expect(client.post('api/test', {})).rejects.toEqual(error);

    expect(mockRequest).toHaveBeenCalledTimes(4);
    jest.restoreAllMocks();
  });

  it('does not retry when maxRetries is 0', async () => {
    const error = makeAxiosError(503);
    const mockRequest = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 0, retryDelay: 10 });
    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  // ── HTTP verbs ────────────────────────────────────────────────────────────

  it('GET sends data as query params', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: 'ok' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    const result = await client.get('api/test', { search: 'foo' });

    expect(result).toBe('ok');
    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: 'api/test', params: { search: 'foo' } })
    );
  });

  it('GET with no data sends no params', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: 'ok' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    await client.get('api/test');

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'GET', url: 'api/test' })
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.not.objectContaining({ params: expect.anything() })
    );
  });

  it('PUT sends data as request body', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    await client.put('api/test', { name: 'updated' });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PUT', url: 'api/test', data: { name: 'updated' } })
    );
  });

  it('PATCH sends data as request body', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    await client.patch('api/test', { field: 'value' });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'PATCH', url: 'api/test', data: { field: 'value' } })
    );
  });

  it('DELETE sends data as request body', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    await client.delete('api/test', { id: '123' });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', url: 'api/test', data: { id: '123' } })
    );
  });

  it('DELETE with no data sends no body', async () => {
    const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/');
    await client.delete('api/test');

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({ method: 'DELETE', url: 'api/test' })
    );
    expect(mockRequest).toHaveBeenCalledWith(
      expect.not.objectContaining({ data: expect.anything() })
    );
  });

  it('new verbs retry on 502/503/504 the same as POST', async () => {
    const error = makeAxiosError(503);
    const mockRequest = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 1, retryDelay: 10 });

    await expect(client.get('api/test')).rejects.toEqual(error);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  // ── timeout ───────────────────────────────────────────────────────────────

  it('passes custom timeout to axios.create', () => {
    mockedAxios.create.mockReturnValue(makeMockInstance(jest.fn()));
    new HttpClient({}, 'https://api.example.com/', { timeout: 5000 });
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 5000 })
    );
  });

  it('uses default timeout of 30000ms when not specified', () => {
    mockedAxios.create.mockReturnValue(makeMockInstance(jest.fn()));
    new HttpClient({}, 'https://api.example.com/');
    expect(mockedAxios.create).toHaveBeenCalledWith(
      expect.objectContaining({ timeout: 30000 })
    );
  });
});
