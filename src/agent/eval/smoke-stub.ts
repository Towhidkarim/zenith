import { createAgentDeps, runAgent } from '../index'

async function main() {
  const deps = createAgentDeps()
  for await (const e of runAgent({
    messages: [
      {
        role: 'user',
        text: 'What does the law say about bail under the Act?',
      },
    ],
    deps,
  })) {
    if (e.type === 'step' && e.status === 'active') console.log('STEP', e.label)
    if (e.type === 'source') console.log('SRC', e.title)
    if (e.type === 'text') process.stdout.write(e.delta)
    if (e.type === 'done') console.log('\nDONE')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
