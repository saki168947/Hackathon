import { ApplyForm } from "./ApplyForm";
import { APPLY_COPY, MANIFEST_ITEMS, TIMELINE_ITEMS, TRACK_ITEMS } from "../content/siteContent";

function ManifestChapter() {
  return (
    <>
      <p className="chapter-overlay__copy">
        做东西的过程比想象的乱。写着写着发现方向不对，聊着聊着才找到重点。但好像每次都是这样过来的。
      </p>
      <div className="chapter-stack">
        {MANIFEST_ITEMS.map(({ id, title, text }) => (
          <article className="chapter-strip" key={id}>
            <span className="chapter-strip__index">{id}</span>
            <div className="chapter-strip__body">
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function TracksChapter() {
  return (
    <>
      <p className="chapter-overlay__copy">
        这几个方向是我们自己觉得值得试的。当然，你也可以完全不管这些。
      </p>
      <div className="chapter-dual-lane">
        {TRACK_ITEMS.map(({ id, title, text }) => (
          <article className="chapter-track" key={id}>
            <span className="chapter-track__id">{id}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </>
  );
}

function ScheduleChapter() {
  return (
    <>
      <div className="chapter-timeline">
        {TIMELINE_ITEMS.map(({ date, title }) => (
          <article className="chapter-timeline__item" key={date}>
            <span>{date}</span>
            <h3>{title}</h3>
          </article>
        ))}
      </div>
    </>
  );
}

function ApplyChapter({ onGoToChapter }) {
  return (
    <>
      <p className="chapter-overlay__copy">
        不用准备得很完美。想清楚大概要做什么，找好人，剩下的到了现场再说。
      </p>
      <ApplyForm />
      <div className="chapter-actionband">
        <button className="button button--ghost" type="button" onClick={() => onGoToChapter(0)}>返回起点</button>
      </div>
      <div className="chapter-kicker">
        {APPLY_COPY.kicker.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </>
  );
}

function getModifier(index) {
  if (index === 1) return "is-left";
  if (index === 2) return "is-center";
  return "is-right";
}

function getChapterStyle(index, progress) {
  const distance = index - progress;
  const abs = Math.abs(distance);
  const opacity = Math.max(0, 1 - abs * 1.2);
  const x = distance * 132;
  const z = -abs * 80;
  const scale = 1 - abs * 0.06;
  const blur = abs * 10;
  const pointerEvents = abs < 0.58 ? "auto" : "none";
  const light = Math.max(0, 1 - abs * 1.55);
  const pointerShiftX = Math.max(12, 34 - abs * 14);
  const pointerShiftY = Math.max(6, 18 - abs * 8);
  const tiltY = (distance * -4.2).toFixed(3);
  const tiltX = (distance * 1.2).toFixed(3);

  return {
    "--chapter-light": light.toFixed(4),
    "--chapter-pointer-x": `${pointerShiftX.toFixed(2)}px`,
    "--chapter-pointer-y": `${pointerShiftY.toFixed(2)}px`,
    opacity,
    transform: `translate3d(calc(${x}px + var(--pointer-x) * ${pointerShiftX.toFixed(2)}px), calc(var(--pointer-y) * ${(-pointerShiftY).toFixed(2)}px), ${z}px) scale(${scale}) rotateY(calc(${tiltY}deg + var(--pointer-x) * -5deg)) rotateX(calc(${tiltX}deg + var(--pointer-y) * 3deg))`,
    filter: `blur(${blur}px)`,
    pointerEvents
  };
}

export function StoryChapterOverlay({ progress, onGoToChapter, isApplyFocused }) {
  if (progress < 0.18) return null;

  const chapters = [
    { index: 1, modifier: getModifier(1), content: <ManifestChapter /> },
    { index: 2, modifier: getModifier(2), content: <TracksChapter /> },
    { index: 3, modifier: getModifier(3), content: <ScheduleChapter /> },
    { index: 4, modifier: getModifier(4), content: <ApplyChapter onGoToChapter={onGoToChapter} /> }
  ];

  return (
    <div className="chapter-overlay-stack">
      {chapters.map((chapter) => (
        <div
          key={chapter.index}
          className={`chapter-overlay ${chapter.modifier} ${Math.abs(chapter.index - progress) < 0.58 ? "is-live" : ""} ${isApplyFocused && chapter.index === 4 ? "is-apply-focus" : ""}`}
          style={getChapterStyle(chapter.index, progress)}
        >
          <div className="chapter-overlay__rail" aria-hidden="true" />
          <div className="chapter-overlay__panel">
            <div className="chapter-overlay__panel-glow" aria-hidden="true" />
            <div className="chapter-overlay__panel-line" aria-hidden="true" />
            <div className="chapter-overlay__content">
              {chapter.content}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
