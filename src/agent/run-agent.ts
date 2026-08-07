import {
	MAX_QUERIES_PER_ROUND,
	MAX_RETRIEVAL_ROUNDS,
	MAX_WORKING_SET,
	RetrievalPlanSchema,
	SufficiencyDecisionSchema,
	TOP_K_PER_QUERY,
	type Passage,
	type RetrievalPlan,
	type SufficiencyDecision,
} from '#/agent/plan';
import { logAndFormatError } from '#/agent/lib/errors';
import { throwIfAborted, withStep } from '#/agent/lib/step';
import {
	ANSWER_SYSTEM,
	JUDGE_SYSTEM,
	ROUTE_SYSTEM,
	answerPrompt,
	judgePrompt,
	routePrompt,
} from '#/agent/prompts/legal';
import {
	passageToSourceEvent,
	passagesForPrompt,
	mergePassages,
} from '#/agent/retrieval/map-passage';
import type { AgentEvent, AgentInput } from '#/agent/types';

function lastUserText(input: AgentInput): string {
	return (
		[...input.messages]
			.reverse()
			.find((m) => m.role === 'user')
			?.text.trim() || 'your request'
	);
}

function historySnippet(input: AgentInput): string | undefined {
	const prior = input.messages.slice(0, -1).slice(-6)
	if (prior.length === 0) return undefined
	return prior
		.map((m) => {
			const cap = m.role === 'assistant' ? 2500 : 400
			const text =
				m.text.length > cap ? `${m.text.slice(0, cap)}…` : m.text
			return `${m.role}: ${text}`
		})
		.join('\n\n')
}

/**
 * Bounded legal RAG loop:
 * route → (plan → retrieve → judge)* → synthesize
 * Emits Grok-style step events for every phase.
 */
export async function* runAgent(input: AgentInput): AsyncGenerator<AgentEvent> {
	const { deps, signal } = input;
	const userText = lastUserText(input)
	const history = historySnippet(input)

	try {
		let plan!: RetrievalPlan

		yield* withStep('Analyzing your question', signal, async () => {})

		yield* withStep(
			'Checking feasibility of lookups',
			signal,
			async function* () {
				const routed = await deps.llm.generateObject({
					system: ROUTE_SYSTEM,
					prompt: routePrompt(userText, history),
					schema: RetrievalPlanSchema,
					signal,
				})
				plan = routed
				const reasoningId = crypto.randomUUID()
				yield {
					type: 'reasoning',
					id: reasoningId,
					delta: `${routed.reason}\n`,
				}
			},
		)

		throwIfAborted(signal);

		let workingSet: Passage[] = [];
		let decision: SufficiencyDecision = {
			enough: true,
			confidence: 'medium',
			gaps: [],
		};
		let skippedRetrieval = false;

		if (!plan.needsRetrieval) {
			skippedRetrieval = true
			yield* withStep(
				'Synthesizing from conversation context',
				signal,
				async () => {},
			)

			if (plan.intent === 'unclear' && plan.followUpsForUser?.length) {
				decision = {
					enough: true,
					confidence: 'medium',
					gaps: plan.followUpsForUser,
				}
			} else {
				decision = {
					enough: true,
					confidence: 'medium',
					gaps: [],
				}
			}
		} else {
			let queries = plan.queries.slice(0, MAX_QUERIES_PER_ROUND);
			if (queries.length === 0) {
				queries = [
					{
						text: userText.slice(0, 400),
						purpose: 'Fallback primary query',
					},
				];
			}

			for (let round = 1; round <= MAX_RETRIEVAL_ROUNDS; round++) {
				throwIfAborted(signal);

				const planLabel =
					round === 1 ? 'Planning search queries' : 'Planning another search';

				yield* withStep(planLabel, signal, async function* () {
					const detailId = crypto.randomUUID();
					yield {
						type: 'step',
						id: detailId,
						label: `Prepared ${queries.length} search${queries.length === 1 ? '' : 'es'}`,
						status: 'active',
					};
					yield {
						type: 'step',
						id: detailId,
						label: `Prepared ${queries.length} search${queries.length === 1 ? '' : 'es'}`,
						status: 'done',
					};
					const reasoningId = crypto.randomUUID();
					yield {
						type: 'reasoning',
						id: reasoningId,
						delta: queries.map((q) => `• ${q.text}`).join('\n') + '\n',
					};
				});

				yield* withStep(
					`Searching acts & sections (round ${round})`,
					signal,
					async function* () {
						const hits = await deps.retrieval.search({
							queries,
							topK: TOP_K_PER_QUERY,
							sourceKinds: plan.sourceKinds ?? ['act_section'],
							signal,
						});
						workingSet = mergePassages(workingSet, hits, MAX_WORKING_SET);

						const foundId = crypto.randomUUID();
						const foundLabel = `Found ${workingSet.length} relevant section${workingSet.length === 1 ? '' : 's'}`;
						yield {
							type: 'step',
							id: foundId,
							label: foundLabel,
							status: 'active',
						};
						yield {
							type: 'step',
							id: foundId,
							label: foundLabel,
							status: 'done',
						};
					},
				);

				yield* withStep(
					'Checking if the evidence is enough',
					signal,
					async function* () {
						decision = await deps.llm.generateObject({
							system: JUDGE_SYSTEM,
							prompt: judgePrompt(
								userText,
								passagesForPrompt(workingSet),
								round,
								history,
							),
							schema: SufficiencyDecisionSchema,
							signal,
						})
						const reasoningId = crypto.randomUUID();
						yield {
							type: 'reasoning',
							id: reasoningId,
							delta: `Confidence: ${decision.confidence}. Enough: ${decision.enough}.\n`,
						};
					},
				);

				if (decision.enough || round === MAX_RETRIEVAL_ROUNDS) break;

				const next = decision.nextQueries?.slice(0, MAX_QUERIES_PER_ROUND);
				if (!next?.length) break;
				queries = next;
			}
		}

		// Emit sources before answer text so UI can attach them.
		yield* withStep('Attaching citations', signal, async function* () {
			for (const passage of workingSet) {
				yield passageToSourceEvent(passage);
			}
		});

		yield* withStep('Drafting your answer', signal, async function* () {
			const textId = crypto.randomUUID();
			for await (const delta of deps.llm.streamText({
				system: ANSWER_SYSTEM,
				prompt: answerPrompt({
					userText,
					passagesBlock: passagesForPrompt(workingSet),
					confidence: decision.confidence,
					gaps: decision.gaps,
					conflicts: decision.conflicts ?? [],
					followUps: plan.followUpsForUser,
					skippedRetrieval,
					historySnippet: history,
				}),
				signal,
			})) {
				throwIfAborted(signal);
				yield { type: 'text', id: textId, delta };
			}
		});

		yield { type: 'done' };
	} catch (err) {
		if (
			signal?.aborted ||
			(err instanceof DOMException && err.name === 'AbortError')
		) {
			return;
		}
		yield {
			type: 'error',
			message: logAndFormatError('runAgent', err),
		};
		yield { type: 'done' };
	}
}
