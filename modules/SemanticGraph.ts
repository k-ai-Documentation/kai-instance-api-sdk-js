import { BaseModule } from './BaseModule';

/** A document fragment returned as part of a node identification result. */
export interface PartialDocument {
  /** Document identifier. */
  id: string;
  /** Relevant content excerpts from the document. */
  content: string[];
}

/** A knowledge graph node returned by `identifyNodes`. */
export interface IdentifiedNode {
  /** Unique node identifier. */
  id: string;
  /** First entity in the relationship. */
  node1: string;
  /** Second entity in the relationship. */
  node2: string;
  /** The relationship type connecting the two entities. */
  edge: string;
  /** Supporting documents — either full {@link PartialDocument} objects or document ID strings, depending on `needDocumentsContent`. */
  documents: PartialDocument[] | string[];
}

/** Extra metadata attached to a semantic node. */
export interface SemanticNodeExtraproperties {
  /** IDs of documents that reference this node. */
  documents: string[];
  /** IDs of content chunks that reference this node. */
  chunks: string[];
  /** Total reference count across all documents and chunks. */
  count: number;
}

/** A node in the Kai Studio knowledge graph, representing a relationship between two entities. */
export interface SemanticNode {
  /** Unique node identifier. */
  id: string;
  /** First entity in the relationship. */
  node_1: string;
  /** Second entity in the relationship. */
  node_2: string;
  /** The relationship type connecting the two entities. */
  edge: string;
  /** Additional metadata about document and chunk references. */
  extraproperties: SemanticNodeExtraproperties;
}

/** Knowledge graph node exploration module. Access via `api.semanticGraph()`. */
export class SemanticGraph extends BaseModule {
  /**
   * Returns a paginated list of semantic nodes from the knowledge graph.
   *
   * @param limit - Maximum number of nodes to return. Defaults to `20`.
   * @param offset - Number of nodes to skip. Defaults to `0`.
   * @returns Array of {@link SemanticNode} objects.
   */
  async getNodes(limit: number = 20, offset: number = 0): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/nodes', { limit, offset });
  }

  /**
   * Returns all nodes whose label matches the given string.
   *
   * @param label - The label string to search for (matched against `node_1`, `node_2`, or `edge`).
   * @returns Array of matching {@link SemanticNode} objects.
   */
  async getNodeByLabel(label: string): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/nodes-by-label', { label });
  }

  /**
   * Returns the knowledge graph nodes most relevant to a natural language query.
   *
   * @param query - The natural language query to match against the graph.
   * @param needDocumentsContent - If `true`, each node's `documents` field will contain full
   *   {@link PartialDocument} objects (with content excerpts) instead of bare document ID strings.
   *   Defaults to `false`.
   * @returns Array of {@link IdentifiedNode} objects ranked by relevance to the query.
   */
  async identifyNodes(query: string, needDocumentsContent: boolean = false): Promise<IdentifiedNode[]> {
    return this.post('api/semantic-graph/identify-nodes', { query, need_documents_content: needDocumentsContent });
  }

  /**
   * Returns all nodes directly linked to the given node in the knowledge graph.
   *
   * @param id - The node ID to find neighbours for.
   * @returns Array of {@link SemanticNode} objects that are directly connected to the given node.
   */
  async linkedNodesById(id: string): Promise<SemanticNode[]> {
    return this.post('api/semantic-graph/linked-nodes-by-id', { id });
  }
}
