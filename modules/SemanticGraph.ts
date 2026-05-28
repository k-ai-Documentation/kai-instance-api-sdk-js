import { BaseModule } from './BaseModule';

export interface PartialDocument {
  id: string;
  content: string[];
}

export interface IdentifiedNode {
  id: string;
  node1: string;
  node2: string;
  edge: string;
  documents: PartialDocument[] | string[];
}

export interface SemanticNodeExtraproperties {
  documents: string[];
  chunks: string[];
  count: number;
}

export interface SemanticNode {
  id: string;
  node_1: string;
  node_2: string;
  edge: string;
  extraproperties: SemanticNodeExtraproperties;
}

export class SemanticGraph extends BaseModule {
  async getNodes(limit: number = 20, offset: number = 0): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/nodes', { limit, offset });
  }

  async getNodeByLabel(label: string): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/nodes-by-label', { label });
  }

  async identifyNodes(query: string, needDocumentsContent: boolean = false): Promise<IdentifiedNode[]> {
    return this.post('api/semantic-graph/identify-nodes', { query, need_documents_content: needDocumentsContent });
  }

  async linkedNodesById(id: string): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/linked-nodes-by-id', { id });
  }
}
