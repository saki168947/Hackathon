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
    <form className="apply-form" onSubmit={handleSubmit}>
      <div className="apply-form__topbar">
        <span className="apply-form__eyebrow">Application Form</span>
        <p className="apply-form__hint">信息会自动发送到报名邮箱，并可选发回执确认。</p>
      </div>
      <div className="apply-form__grid">
        <label className="apply-form__field">
          <span>姓名</span>
          <input name="name" autoComplete="name" value={form.name} onChange={updateField} required />
        </label>
        <label className="apply-form__field">
          <span>邮箱</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={form.email}
            onChange={updateField}
            required
          />
        </label>
        <label className="apply-form__field">
          <span>团队/项目名</span>
          <input name="teamName" autoComplete="organization" value={form.teamName} onChange={updateField} />
        </label>
        <label className="apply-form__field">
          <span>角色</span>
          <input name="role" autoComplete="organization-title" value={form.role} onChange={updateField} />
        </label>
      </div>
      <label className="apply-form__field apply-form__field--full">
        <span>想法简介</span>
        <textarea name="projectIdea" rows={6} value={form.projectIdea} onChange={updateField} required />
      </label>
      <div className="apply-form__actions">
        <button className="button button--primary" type="submit" disabled={pending}>
          {pending ? "发送中…" : "提交报名"}
        </button>
        <span className={`apply-form__message ${error ? "is-error" : "is-success"}`} role="status" aria-live="polite">
          {message}
        </span>
      </div>
    </form>
  );
}
