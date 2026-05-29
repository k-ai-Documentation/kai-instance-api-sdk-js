import axios from 'axios';
import { SemanticGraph } from '../modules/SemanticGraph';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('SemanticGraph', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getNodes', () => {
    it('posts to the correct endpoint with limit and offset', async () => {
      const nodes = [
        {
          id: 'n-1',
          node_1: 'ConceptA',
          node_2: 'ConceptB',
          edge: 'relates_to',
          extraproperties: { documents: [], chunks: [], count: 0 },
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: nodes } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const graph = new SemanticGraph({}, 'https://api.example.com/');
      const result = await graph.getNodes(5, 10);

      expect(result).toEqual(nodes);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/semantic-graph/nodes',
          data: { limit: 5, offset: 10 },
        })
      );
    });
  });

  describe('identifyNodes', () => {
    it('maps needDocumentsContent to need_documents_content in the payload', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const graph = new SemanticGraph({}, 'https://api.example.com/');
      await graph.identifyNodes('search query', true);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/semantic-graph/identify-nodes',
          data: { query: 'search query', need_documents_content: true },
        })
      );
    });

    it('defaults needDocumentsContent to false', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const graph = new SemanticGraph({}, 'https://api.example.com/');
      await graph.identifyNodes('query only');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { query: 'query only', need_documents_content: false },
        })
      );
    });
  });
});