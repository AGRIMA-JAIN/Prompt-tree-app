import { useEffect, useMemo, useState } from "react";
import { getTree } from "./api/api";
import Treeview from "./components/Treeview";
import SidePanel from "./components/SidePanel";
import Toast from "./components/Toast";
import "./styles.css";

export default function App() {
  const [tree, setTree] = useState([]);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  const fetchTree = () =>
  getTree()
    .then((data) => {
      console.log("[App.fetchTree] raw data:", data);

      const list =
        data?.roots ??
        data?.prompts ??
        data?.tree ??
        data?.tree?.prompts ??
        [];

      console.log(
        "[App.fetchTree] normalized list length:",
        Array.isArray(list) ? list.length : "NOT ARRAY",
        list
      );

      setTree(Array.isArray(list) ? list : []);
    })
    .catch((e) => console.error(e));


  useEffect(() => {
    fetchTree();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const headerText = useMemo(() => {
    if (!selected) return "Select an item";
    return selected.type === "prompt" ? selected.title : selected.name;
  }, [selected]);

  return (
    <div className="app-shell">
      <Toast message={toast} />

      <aside className="sidebar">
        <div className="brand">
          <div className="brand-dot" />
          <div>
            <div className="brand-title">Prompt Tree</div>
            <div className="brand-subtitle">Prompts & subprompts</div>
          </div>
        </div>

        <Treeview data={tree} selected={selected} onSelect={setSelected} />
      </aside>

      <main className="content">
        <div className="content-header">
          <h2>{headerText}</h2>
        </div>

        <SidePanel
          item={selected}
          onSaved={(msg) => setToast(msg)}
          onRefresh={fetchTree}
        />
      </main>
    </div>
  );
}
