import { SectionTitle } from "../components/SectionTitle";
import { useSectionReveal } from "../hooks/useSectionReveal";
import { TRACK_ITEMS } from "../content/siteContent";

export function TracksSection({ forceVisible = false }) {
  const { ref, visible } = useSectionReveal();
  const isVisible = forceVisible || visible;

  return (
    <section ref={ref} className={`section shell reveal-block ${isVisible ? "is-visible" : ""}`} id="tracks">
      <SectionTitle
        eyebrow="Tracks"
        title="几个起点。"
        copy="可以从这里开始。也可以带着自己的题目来。"
      />
      <div className="tracks-grid">
        {TRACK_ITEMS.map((track) => (
          <article className="track-card" key={track.id}>
            <div className="track-card__header">
              <span className="track-card__num">{track.id}</span>
              <span className="track-card__badge">{track.badge}</span>
            </div>
            <h3>{track.title}</h3>
            <p>{track.text}</p>
            <div className="track-card__arrow">→</div>
          </article>
        ))}
      </div>
    </section>
  );
}
