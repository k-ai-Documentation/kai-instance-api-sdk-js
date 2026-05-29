import axios from 'axios';
import { Document } from '../modules/Document';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('Document', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('downloadFile', () => {
    it('uses arraybuffer responseType and returns response.data directly', async () => {
      const buffer = Buffer.from('binary content');
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: buffer });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const doc = new Document({}, 'https://api.example.com/');
      const result = await doc.downloadFile('doc-123');

      expect(result).toBe(buffer);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/document/download',
          responseType: 'arraybuffer',
          data: { id: 'doc-123' },
        })
      );
    });
  });
});