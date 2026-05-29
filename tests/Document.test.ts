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

  describe('listDocuments', () => {
    it('posts to the correct endpoint with offset, limit, and state', async () => {
      const mockDocs = [
        {
          id: 'doc-1',
          name: 'report.pdf',
          extraproperties: {
            audit_done: true,
            kb_signature: {},
            kai_internal_state: 'INDEXED',
            kai_internal_count_chunks: 12,
          },
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: mockDocs } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const doc = new Document({}, 'https://api.example.com/');
      const result = await doc.listDocuments(0, 10, 'INDEXED');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/document/list-docs',
          data: { offset: 0, limit: 10, state: 'INDEXED' },
        })
      );
      expect(result).toEqual(mockDocs);
    });
  });

  describe('docsByIds', () => {
    it('posts document IDs with offset and limit', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const doc = new Document({}, 'https://api.example.com/');
      await doc.docsByIds(['id-1', 'id-2'], 5, 20);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/document/docs-by-ids',
          data: { ids: ['id-1', 'id-2'], offset: 5, limit: 20 },
        })
      );
    });
  });
});