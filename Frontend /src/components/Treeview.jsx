import { useEffect } from "react";
import TreeNode from "./TreeNode";

export default function Treeview({ data, selected, onSelect }) {
  useEffect(() => {
    console.log(
      "[Treeview] data length:",
      Array.isArray(data) ? data.length : "NOT ARRAY",
      data
    );
    if (Array.isArray(data) && data.length > 0) {
      console.log("[Treeview] first prompt sample:", data[0]);
    }
  }, [data]);

  return (
    <div className="tree">
      {Array.isArray(data) &&
        data.map((p, idx) => (
  <TreeNode
    key={p.id}
    prompt={p}
    selected={selected}
    onSelect={onSelect}
    defaultOpen={idx === 0}
  />
        ))}
    </div>
  );
}
