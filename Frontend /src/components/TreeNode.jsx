import { useEffect, useMemo, useState } from "react";

export default function TreeNode({ prompt, selected, onSelect, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  const kids = useMemo(() => {
    const sub = Array.isArray(prompt?.subprompts) ? prompt.subprompts : [];
    const nodes = Array.isArray(prompt?.nodes) ? prompt.nodes : [];
    return sub.length ? sub : nodes;
  }, [prompt]);

  const hasKids = kids.length > 0;


  useEffect(() => {
    console.groupCollapsed(`[TreeNode] ${prompt?.title} (id=${prompt?.id})`);
    console.log("prompt obj:", prompt);
    console.log("subprompts:", prompt?.subprompts);
    console.log("nodes:", prompt?.nodes);
    console.log("kids used:", kids);
    console.log("hasKids:", hasKids);
    console.groupEnd();
  }, [prompt, kids, hasKids]);

  return (
    <div>
      <div
        className={`row ${
          selected?.type === "prompt" && selected?.id === prompt.id ? "selected" : ""
        }`}
        onClick={() => {
          console.log("[CLICK] prompt row:", prompt.title, prompt.id);
          onSelect({
            type: "prompt",
            id: prompt.id,
            title: prompt.title,
            description: prompt.description,
            notes: prompt.notes || "",
          });
        }}
      >
        {hasKids ? (
          <button
            type="button"
            className="toggle"
            onClick={(e) => {
              e.stopPropagation();
              console.log("[CLICK] toggle:", prompt.title, "open->", !open);
              setOpen((v) => !v);
            }}
          >
            {open ? "▾" : "▸"}
          </button>
        ) : (
          <span className="toggle-spacer" />
        )}

        <span className="label">{prompt.title}</span>
      </div>

      {hasKids && open && (
        <div className="children">
        {kids.map((sp) => {
  const nodeId = sp.id;
  const nodeName = sp.name;
  const nodeAction = sp.action;

  return (
    <div
      key={nodeId}
      className={`row ${
        selected?.type === "node" && selected?.id === nodeId ? "selected" : ""
      }`}
      onClick={() => {
        console.log("[CLICK] subprompt row:", nodeName, nodeId);
        onSelect({
          type: "node",
          id: nodeId,         
          promptId: prompt.id,
          name: nodeName,
          action: nodeAction,
          notes: sp.notes || "",
        });
      }}
    >
      <span className="toggle-spacer" />
      <span className="label">{nodeName}</span>
    </div>
  );
})}

        </div>
      )}
    </div>
  );
}
