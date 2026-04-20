import { SectionTitle } from "../components/SectionTitle";
import { useSectionReveal } from "../hooks/useSectionReveal";
import { MANIFEST_ITEMS } from "../content/siteContent";

export function ManifestSection({ forceVisible = false }) {
  const { ref, visible } = useSectionReveal();
  const isVisible = forceVisible || visible;

  return (
    <section ref={ref} className={`section shell reveal-block ${isVisible ? "is-visible" : ""}`} id="manifest">
      <SectionTitle
        eyebrow="Manifest"
        title="先开始。"
        copy="不用等到想清楚再动手。先做出一个瞬间，再决定它该往哪里去。"
      />
      <div className="manifest-grid">
        {MANIFEST_ITEMS.map((p) => (
          <article className="manifest-card" key={p.id}>
            <div className="manifest-card__top">
              <span className="manifest-card__icon">{p.icon}</span>
              <span className="manifest-card__num">{p.id}</span>
            </div>
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
