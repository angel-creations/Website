import { capabilities } from '../data/capabilities';

export function CapabilityIndex(): JSX.Element {
  return (
    <section className="angel-capability-index" aria-labelledby="capability-index-title">
      <div className="angel-capability-index__intro">
        <p>Capabilities / source index</p>
        <h2 id="capability-index-title">Find the right starting point.</h2>
        <p>These pathways organise Angel’s existing public capability material for clearer exploration. They do not add unsourced client, outcome, or industry claims.</p>
      </div>
      <ol>
        {capabilities.map((capability, index) => (
          <li key={capability.slug}>
            <a href={capability.route}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><strong>{capability.title}</strong><em>{capability.overview}</em><i aria-hidden="true">↗</i></a>
          </li>
        ))}
      </ol>
    </section>
  );
}
