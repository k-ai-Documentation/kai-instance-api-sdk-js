import axios from 'axios';
import { KMAudit, AnomalyState } from '../modules/KMAudit';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

function makeMockInstance(requestFn: jest.Mock) {
  return { request: requestFn } as any;
}

describe('KMAudit', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('listConflicts', () => {
    it('posts to the correct endpoint with all parameters', async () => {
      const mockConflicts = [
        {
          id: 'c-1',
          subject: 'Contradiction',
          state: AnomalyState.DETECTED,
          documents: [],
          explanation: 'doc A and doc B conflict',
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: mockConflicts } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      const result = await audit.listConflicts(10, 5, 'myquery', 'report.pdf', AnomalyState.DETECTED);

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/audit/conflict-information',
          data: {
            limit: 10,
            offset: 5,
            query: 'myquery',
            document_name: 'report.pdf',
            state: AnomalyState.DETECTED,
          },
        })
      );
      expect(result).toEqual(mockConflicts);
    });

    it('uses defaults when called with no arguments', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: [] } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      await audit.listConflicts();

      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ limit: 200, offset: 0 }),
        })
      );
    });
  });

  describe('countConflictsPerSubject', () => {
    it('maps string counts to integers using parseInt', async () => {
      const raw = [
        {
          subject: 'Topic A',
          count: '5',
          count_detected: '2',
          count_managed: '1',
          count_ignored: '0',
          count_redetected: '1',
          count_disappeared: '1',
        },
      ];
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: raw } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      const result = await audit.countConflictsPerSubject();

      expect(result).toEqual([
        {
          subject: 'Topic A',
          count: 5,
          count_detected: 2,
          count_managed: 1,
          count_ignored: 0,
          count_redetected: 1,
          count_disappeared: 1,
        },
      ]);
    });
  });

  describe('countConflictsByDocumentId', () => {
    it('parses the string response to an integer', async () => {
      const mockRequest = jest.fn().mockResolvedValueOnce({ data: { response: '42' } });
      mockedAxios.create.mockReturnValue(makeMockInstance(mockRequest));

      const audit = new KMAudit({}, 'https://api.example.com/');
      const result = await audit.countConflictsByDocumentId(['doc-1', 'doc-2'], AnomalyState.DETECTED);

      expect(result).toBe(42);
      expect(mockRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          url: 'api/audit/count-conflict-by-document-ids',
          data: { document_ids: ['doc-1', 'doc-2'], state: AnomalyState.DETECTED },
        })
      );
    });
  });
});