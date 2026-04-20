import { useSectionReveal } from "../hooks/useSectionReveal";
import { ApplyForm } from "../components/ApplyForm";
import { APPLY_COPY, FOOTER_COPY } from "../content/siteContent";

export function ApplySection({ onBackToTop, forceVisible = false }) {
  const { ref, visible } = useSectionReveal();
  const isVisible = forceVisible || visible;

  return (
    <section ref={ref} className={`section shell reveal-block ${isVisible ? "is-visible" : ""}`} id="apply">
      <div className="apply-wrap">
        <div className="apply-glow" aria-hidden="true" />

        <div className="apply-finale">
          <div className="apply-finale__intro">
            <span className="section-title__eyebrow">Apply</span>
            <h2 className="apply-finale__title">{APPLY_COPY.title}</h2>
            <p className="apply-finale__body">{APPLY_COPY.body}</p>
          </div>

          <div className="apply-finale__stats" aria-label="Apply metadata">
            <div className="apply-finale__stat">
              <span>报名截止</span>
              <strong>{APPLY_COPY.deadline}</strong>
            </div>
            <div className="apply-finale__stat">
              <span>参与名额</span>
              <strong>{APPLY_COPY.seats}</strong>
            </div>
            <div className="apply-finale__stat">
              <span>正式开始</span>
              <strong>{APPLY_COPY.start}</strong>
            </div>
          </div>

          <ul className="apply-checklist apply-finale__checklist">
            {APPLY_COPY.checklist.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>

          <div className="apply-finale__form">
            <ApplyForm />
          </div>

          <div className="apply-finale__back">
            <a
              className="button button--ghost"
              href="#top"
              onClick={(event) => {
                event.preventDefault();
                onBackToTop();
              }}
            >
              ← 回到顶部
            </a>
          </div>
        </div>

        <footer className="site-footer">
          {FOOTER_COPY.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </footer>
      </div>
    </section>
  );
}
