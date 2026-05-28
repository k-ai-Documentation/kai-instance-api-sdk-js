import axios from 'axios';
import { HttpClient } from '../modules/HttpClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(postFn: jest.Mock) {
  return { post: postFn } as any;
}

function makeAxiosError(status: number | undefined, message: string = 'Error') {
  const err = new Error(message) as any;
  err.isAxiosError = true;
  if (status !== undefined) {
    err.response = { status };
  }
  return err;
}

describe('HttpClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock isAxiosError to recognize our test error objects
    (mockedAxios.isAxiosError as any) = jest.fn((err: any) => {
      return err && err.isAxiosError === true;
    });
  });

  it('returns response.data.response on success', async () => {
    const mockPost = jest.fn().mockResolvedValueOnce({ data: { response: 'ok' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/');
    const result = await client.post('api/test', {});

    expect(result).toBe('ok');
    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenCalledWith('api/test', {});
  });

  it('retries on 5xx and eventually throws', async () => {
    const error = makeAxiosError(500);
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 2, retryDelay: 10 });

    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockPost).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('does not retry on 4xx', async () => {
    const error = makeAxiosError(404);
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 3, retryDelay: 10 });

    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });

  it('retries on network error (no response) and recovers', async () => {
    const networkError = makeAxiosError(undefined, 'Network Error');
    const mockPost = jest.fn()
      .mockRejectedValueOnce(networkError)
      .mockResolvedValueOnce({ data: { response: 'recovered' } });
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 2, retryDelay: 10 });
    const result = await client.post('api/test', {});

    expect(result).toBe('recovered');
    expect(mockPost).toHaveBeenCalledTimes(2);
  });

  it('uses exponential backoff between retries', async () => {
    const delays: number[] = [];
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: any, ms?: number) => {
      delays.push(ms ?? 0);
      fn();
      return 0 as any;
    });

    const error = makeAxiosError(503);
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 3, retryDelay: 1000 });
    await expect(client.post('api/test', {})).rejects.toEqual(error);

    expect(delays).toEqual([1000, 2000, 4000]); // 1000*2^0, 1000*2^1, 1000*2^2
    jest.restoreAllMocks();
  });

  it('uses default maxRetries=3 and retryDelay=1000 when not specified', async () => {
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: any) => { fn(); return 0 as any; });

    const error = makeAxiosError(500);
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/');
    await expect(client.post('api/test', {})).rejects.toEqual(error);

    expect(mockPost).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
    jest.restoreAllMocks();
  });

  it('does not retry when maxRetries is 0', async () => {
    const error = makeAxiosError(500);
    const mockPost = jest.fn().mockRejectedValue(error);
    mockedAxios.create.mockReturnValue(makeMockInstance(mockPost));

    const client = new HttpClient({}, 'https://api.example.com/', { maxRetries: 0, retryDelay: 10 });
    await expect(client.post('api/test', {})).rejects.toEqual(error);
    expect(mockPost).toHaveBeenCalledTimes(1);
  });
});
