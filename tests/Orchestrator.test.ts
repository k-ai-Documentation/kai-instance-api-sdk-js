import axios from 'axios';
import { Orchestrator } from '../modules/Orchestrator';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('Orchestrator', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('launchPartialIndexation', () => {
    it('posts to the correct endpoint and returns the response', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const orch = new Orchestrator({}, 'https://api.example.com/');
      const result = await orch.launchPartialIndexation();

      expect(result).toBe(true);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/orchestrator/differential-indexation',
        })
      );
    });
  });

  describe('countRegisteredBackgroundTasks', () => {
    it('posts to the correct endpoint and returns task count map', async () => {
      const counts = { indexation: 3, extraction: 1 };
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: counts } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const orch = new Orchestrator({}, 'https://api.example.com/');
      const result = await orch.countRegisteredBackgroundTasks();

      expect(result).toEqual(counts);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/orchestrator/count-back-tasks',
        })
      );
    });
  });

  describe('reindexDocument', () => {
    it('sends document id in payload', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: true } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const orch = new Orchestrator({}, 'https://api.example.com/');
      await orch.reindexDocument('doc-abc');

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/orchestrator/reindex-document',
          data: { id: 'doc-abc' },
        })
      );
    });
  });
});