import axios from 'axios';
import { KaiInstanceApi } from '../index';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  mockedAxios.create.mockReturnValue({ request: jest.fn() } as any);
  jest.clearAllMocks();
});

describe('KaiInstanceApi constructor', () => {
  it('throws if neither instanceId nor host is provided', () => {
    expect(() => new KaiInstanceApi({})).toThrow(
      'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
    );
  });

  it('throws if only apiKey is provided (no instanceId or host)', () => {
    expect(() => new KaiInstanceApi({ apiKey: 'key-only' })).toThrow(
      'KaiInstanceApi requires either instanceId (SaaS mode) or host (Premise mode)'
    );
  });

  it('constructs successfully with instanceId alone', () => {
    expect(() => new KaiInstanceApi({ instanceId: 'inst-abc' })).not.toThrow();
  });

  it('constructs successfully with instanceId and apiKey (SaaS mode)', () => {
    expect(() => new KaiInstanceApi({ instanceId: 'inst-abc', apiKey: 'key-xyz' })).not.toThrow();
  });

  it('constructs successfully with host alone (Premise mode)', () => {
    expect(() => new KaiInstanceApi({ host: 'https://my-server.example.com/' })).not.toThrow();
  });
});