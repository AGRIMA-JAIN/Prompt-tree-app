import { useEffect, useMemo, useState } from "react";
import { updateNodeNotes, updatePromptNotes } from "../api/api";

export default function SidePanel({ item, onSaved, onRefresh }) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(item?.notes || "");
  }, [item?.id, item?.type]);

  const title = useMemo(() => {
    if (!item) return "";
    return item.type === "prompt" ? item.title : item.name;
  }, [item]);

  const subtitle = useMemo(() => {
    if (!item) return "";
    return item.type === "prompt" ? item.description : item.action;
  }, [item]);

  const dirty = (item?.notes || "") !== draft;

  async function handleSave() {
    if (!item) return;
    setSaving(true);

    try {
      if (item.type === "prompt") {
         console.log("[SidePanel] calling updatePromptNotes", item.id);


        await updatePromptNotes(item.id, draft);
        onSaved?.("Prompt notes saved ✅");
      } else {
         console.log("[SidePanel] calling updateNodeNotes", item.id);
        await updateNodeNotes(item.id, draft);
        onSaved?.("Subprompt notes saved ✅");
      }

      onRefresh?.();
    } catch (e) {
      console.error(e);
      onSaved?.("Save failed ❌");
    } finally {
      setSaving(false);
    }
  }

  if (!item) {
    return (
      <div className="panel">
        <div className="panel-empty">Select a prompt or subprompt to view details.</div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-card">
        <div className="panel-title">{title}</div>
        <div className="panel-desc">{subtitle}</div>

        <label className="panel-label">Notes</label>
        <textarea
          className="panel-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Write notes here..."
        />

        <div className="panel-actions">
          <button
            className="btn"
            onClick={handleSave}
            disabled={!dirty || saving}
          >
            {saving ? "Saving..." : dirty ? "Save Notes" : "Saved"}
          </button>
        </div>
      </div>
    </div>
  );
}
