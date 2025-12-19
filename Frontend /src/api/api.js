const BASE = "http://localhost:4000";

export async function getTree() {
  const res = await fetch(`${BASE}/tree`);
  const json = await res.json();

  console.log("[api.getTree] raw response:", json);
  console.log("[api.getTree] keys:", json && typeof json === "object" ? Object.keys(json) : json);

  return json;
}

// PATCH /prompts/:id/notes
export async function updatePromptNotes(promptId, notes) {
  const res = await fetch(`${BASE}/prompts/${promptId}/notes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error("Failed to update prompt notes");
  return res.json();
}

// PATCH /nodes/:id/notes
export async function updateNodeNotes(nodeId, notes) {
  const res = await fetch(`${BASE}/nodes/${nodeId}/notes`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) throw new Error("Failed to update node notes");
  return res.json();
}
