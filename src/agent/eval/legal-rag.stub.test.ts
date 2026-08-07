import { describe, expect, it } from 'vitest';
import { createAgentDeps, runAgent } from '#/agent';
import type { AgentEvent } from '#/agent';

async function collect(events: AsyncIterable<AgentEvent>) {
	const out: AgentEvent[] = [];
	for await (const e of events) out.push(e);
	return out;
}

describe('legal RAG agent (stub deps)', () => {
	const deps = createAgentDeps();

	it('skips retrieval for meta greetings and still emits steps + text', async () => {
		const events = await collect(
			runAgent({
				messages: [{ role: 'user', text: 'hello' }],
				deps,
			}),
		);

		const steps = events.filter((e) => e.type === 'step');
		const labels = steps.map((e) => (e.type === 'step' ? e.label : ''));
		expect(
			labels.some((l) => l.includes('lookup') || l.includes('Understanding')),
		).toBe(true);
		expect(
			labels.some(
				(l) => l.includes('without a new search') || l.includes('Drafting'),
			),
		).toBe(true);
		expect(events.some((e) => e.type === 'text')).toBe(true);
		expect(events.at(-1)?.type).toBe('done');
	});

	it('runs retrieve path for statutory-looking questions with step ticker', async () => {
		const events = await collect(
			runAgent({
				messages: [
					{
						role: 'user',
						text: 'What does the law say about bail under the relevant Act section?',
					},
				],
				deps,
			}),
		);

		const stepLabels = events
			.filter(
				(e): e is Extract<AgentEvent, { type: 'step' }> => e.type === 'step',
			)
			.map((e) => e.label);

		expect(stepLabels.some((l) => l.includes('Planning search'))).toBe(true);
		expect(stepLabels.some((l) => l.includes('Searching acts'))).toBe(true);
		expect(stepLabels.some((l) => l.includes('evidence'))).toBe(true);
		expect(stepLabels.some((l) => l.includes('Drafting'))).toBe(true);
		expect(events.some((e) => e.type === 'source')).toBe(true);
		expect(events.some((e) => e.type === 'text')).toBe(true);
	});

	it('source events carry Act · Section citation fields', async () => {
		const events = await collect(
			runAgent({
				messages: [
					{
						role: 'user',
						text: 'Explain section penalties in criminal law Act',
					},
				],
				deps,
			}),
		);
		const source = events.find((e) => e.type === 'source');
		expect(source?.type).toBe('source');
		if (source?.type === 'source') {
			expect(source.actTitle).toBeTruthy();
			expect(source.sectionNumber).toBeTruthy();
			expect(source.title).toContain('s.');
		}
	});
});
