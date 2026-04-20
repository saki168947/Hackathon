import { SectionTitle } from "../components/SectionTitle";
import { useSectionReveal } from "../hooks/useSectionReveal";
import { TIMELINE_ITEMS } from "../content/siteContent";

export function TimelineSection({ forceVisible = false }) {
  const { ref, visible } = useSectionReveal();
  const isVisible = forceVisible || visible;

  return (
    <section ref={ref} className={`section shell reveal-block ${isVisible ? "is-visible" : ""}`} id="schedule">
      <SectionTitle
        eyebrow="Schedule"
        title="时间线。"
      />
      <div className="timeline">
        {TIMELINE_ITEMS.map(({ title, date, text }, i) => (
          <article key={title} className="timeline__item" style={{ "--delay": `${i * 80}ms` }}>
            <div className="timeline__step">
              <div className="timeline__step-dot" />
              {i < TIMELINE_ITEMS.length - 1 && <div className="timeline__step-line" />}
            </div>
            <div className="timeline__date-col">
              <span className="timeline__date">{date}</span>
            </div>
            <div className="timeline__body">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
