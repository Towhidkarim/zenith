/**
 * Central agent / RAG config.
 *
 * Change collection names, embedding size, and model ids here —
 * adapters (`qdrant-client`, `embed`, `gemini`) read from this file.
 * Env still supplies secrets (API keys, Qdrant URL).
 */

export type CorpusConfig = {
	/** Logical name for logs / multi-corpus routing later. */
	id: string;
	/** Qdrant collection name. */
	collection: string;
	/** Vector size must match how the collection was indexed. */
	embeddingDimensions: number;
	/** Embedding model used at index + query time. */
	embeddingModel: string;
	/** Source kind tag on Passage / citations. */
	kind: 'act_section' | 'case' | 'commentary';
};

export type AgentConfig = {
	/** Default chat / structured model for router, judge, answer. */
	geminiChatModel: string;
	/**
	 * Active corpus for v1 retrieval.
	 * Add more entries under `corpora` when case law / commentary land.
	 */
	defaultCorpusId: string;
	corpora: Record<string, CorpusConfig>;
	/** Max hits merged into the working set (see plan.ts caps too). */
	retrievalTopK: number;
};

export const agentConfig: AgentConfig = {
	geminiChatModel: 'gemini-3.5-flash-lite',
	defaultCorpusId: 'bd_laws',
	retrievalTopK: 6,
	corpora: {
		bd_laws: {
			id: 'bd_laws',
			collection: 'bd_laws_v1',
			embeddingDimensions: 768,
			embeddingModel: 'gemini-embedding-2',
			kind: 'act_section',
		},
		// Later:
		// bd_cases: { id: 'bd_cases', collection: 'bd_cases_v1', ... }
	},
};

export function getDefaultCorpus(): CorpusConfig {
	const corpus = agentConfig.corpora[agentConfig.defaultCorpusId];
	if (!corpus) {
		throw new Error(
			`agentConfig.defaultCorpusId="${agentConfig.defaultCorpusId}" not found in corpora`,
		);
	}
	return corpus;
}

/** Resolve corpus by id, or fall back to default. */
export function getCorpus(id?: string): CorpusConfig {
	if (id && agentConfig.corpora[id]) return agentConfig.corpora[id];
	return getDefaultCorpus();
}
