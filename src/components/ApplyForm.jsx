import { useState } from "react";

const initialForm = {
  name: "",
  email: "",
  teamName: "",
  role: "",
  projectIdea: ""
};

export function ApplyForm() {
  const [form, setForm] = useState(initialForm);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setError(false);

    try {
      const response = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      setError(!response.ok || !result.ok);
      setMessage(result.message || (response.ok ? "提交成功。" : "提交失败。"));
      if (response.ok && result.ok) {
        setForm(initialForm);
      }
    } catch {
      setError(true);
      setMessage("网络异常，请稍后再试。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="apply-form-shell">
      {!isExpanded && (
        <div className="apply-form-triggerband">
          <p className="apply-form-triggerband__hint">准备好再填写。</p>
          <button 
            className="button button--primary apply-cta-card__btn" 
            type="button" 
            onClick={() => setIsExpanded(true)}
          >
            填写报名表
          </button>
        </div>
      )}

      <div className={`apply-form-drawer ${isExpanded ? "is-visible" : ""}`} aria-hidden={!isExpanded} hidden={!isExpanded}>
        <div>
          <form className="apply-form" onSubmit={handleSubmit}>
            <div className="apply-form__topbar">
              <span className="apply-form__eyebrow">报名表</span>
              <button 
                type="button" 
                className="apply-form__close" 
                onClick={() => setIsExpanded(false)}
                aria-label="收起表单"
              >
                ×
              </button>
            </div>
            <p className="apply-form__hint">
              通过后会邮件通知。
            </p>
            <div className="apply-form__grid">
              <label className="apply-form__field">
                <span>姓名</span>
                <input name="name" value={form.name} onChange={updateField} required />
              </label>
              <label className="apply-form__field">
                <span>邮箱</span>
                <input name="email" type="email" value={form.email} onChange={updateField} required />
              </label>
              <label className="apply-form__field">
                <span>团队名称</span>
                <input name="teamName" value={form.teamName} onChange={updateField} />
              </label>
              <label className="apply-form__field">
                <span>你的角色</span>
                <input name="role" value={form.role} onChange={updateField} />
              </label>
            </div>
            <label className="apply-form__field apply-form__field--full">
              <span>想法简述</span>
              <textarea name="projectIdea" rows={5} value={form.projectIdea} onChange={updateField} required />
            </label>
            <div className="apply-form__actions">
              <button className="button button--primary" type="submit" disabled={pending}>
                {pending ? "发送中…" : "提交报名"}
              </button>
              <span className={`apply-form__message ${error ? "is-error" : "is-success"}`} role="status">
                {message}
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
