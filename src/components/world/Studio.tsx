import { lazy, Suspense, useEffect, useRef, type ReactNode } from "react";
import JSZip from "jszip";
import {
  Box, Circle, Cylinder, Triangle, Donut, TreePine, Mountain, Home, User, Lamp, MousePointer2, Pyramid, Pill, BrickWall, Fence, Shrub, Columns3, Package, Armchair, Car, Flower2, Gem, Move, RotateCw, Scaling,
  Undo2, Redo2, Save, FolderOpen, Download, FilePlus, Trash2, Copy, Footprints, PenTool, Sun, Upload,
} from "lucide-react";
import { useWorld, type ObjType, type Tool } from "@/lib/world-store";

const Viewport = lazy(() => import("./Viewport").then((m) => ({ default: m.Viewport })));
const KEY = "realityx-project";

const library: { type: ObjType; icon: any }[] = [
  { type: "box", icon: Box }, { type: "sphere", icon: Circle }, { type: "cylinder", icon: Cylinder }, { type: "cone", icon: Triangle },
  { type: "torus", icon: Donut }, { type: "tree", icon: TreePine }, { type: "rock", icon: Mountain }, { type: "house", icon: Home },
  { type: "character", icon: User }, { type: "lamp", icon: Lamp },
  { type: "pyramid", icon: Pyramid }, { type: "capsule", icon: Pill }, { type: "gem", icon: Gem }, { type: "wall", icon: BrickWall },
  { type: "stairs", icon: Footprints }, { type: "fence", icon: Fence }, { type: "bush", icon: Shrub }, { type: "pillar", icon: Columns3 },
  { type: "crate", icon: Package }, { type: "bench", icon: Armchair }, { type: "car", icon: Car }, { type: "flower", icon: Flower2 },
];
const tools: { t: Tool; icon: any; label: string; key: string }[] = [
  { t: "select", icon: MousePointer2, label: "Select", key: "Q" }, { t: "translate", icon: Move, label: "Move", key: "W" },
  { t: "rotate", icon: RotateCw, label: "Rotate", key: "E" }, { t: "scale", icon: Scaling, label: "Scale", key: "R" },
];

function Btn({ onClick, children, title, active }: { onClick: () => void; children: ReactNode; title: string; active?: boolean }) {
  return <button title={title} onClick={onClick} className={`rx-btn ${active ? "rx-btn-active" : ""}`}>{children}</button>;
}

function download(blob: Blob, name: string) {
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

export function Studio() {
  const s = useWorld();
  const file = useRef<HTMLInputElement>(null);
  const sel = s.objects.find((o) => o.id === s.selectedId);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) try { useWorld.getState().load(JSON.parse(raw)); } catch {}
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;
      const st = useWorld.getState();
      if (st.mode === "explore") { if (e.code === "Escape") st.setMode("edit"); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "z") { e.preventDefault(); e.shiftKey ? st.redo() : st.undo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "y") { e.preventDefault(); st.redo(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); save(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && st.selectedId) { e.preventDefault(); st.duplicate(st.selectedId); return; }
      const m: Record<string, Tool> = { q: "select", w: "translate", e: "rotate", r: "scale" };
      const tl = m[e.key]; if (tl) st.setTool(tl);
      if ((e.key === "Delete" || e.key === "Backspace") && st.selectedId) st.remove(st.selectedId);
    };
    addEventListener("keydown", h); return () => removeEventListener("keydown", h);
  }, []);

  const data = () => { const { projectName, objects, env } = useWorld.getState(); return { app: "REALITYX", version: 1, projectName, objects, env }; };
  const save = () => { localStorage.setItem(KEY, JSON.stringify(data())); flash("Saved"); };
  const exportZip = async () => {
    const zip = new JSZip();
    zip.file("world.json", JSON.stringify(data(), null, 2));
    const c = document.querySelector("canvas"); if (c) zip.file("preview.png", c.toDataURL("image/png").split(",")[1] ?? "", { base64: true });
    zip.file("README.txt", "REALITYX world export. Import world.json (or this zip) in REALITYX to continue editing.");
    download(await zip.generateAsync({ type: "blob" }), `${s.projectName.replace(/\W+/g, "_")}.zip`);
  };
  const importFile = async (f: File) => {
    try {
      const text = f.name.endsWith(".zip") ? await (await JSZip.loadAsync(f)).file("world.json")!.async("string") : await f.text();
      s.load(JSON.parse(text)); flash("Imported");
    } catch { flash("Invalid file"); }
  };
  const flashRef = useRef<HTMLDivElement>(null);
  const flash = (t: string) => { const el = flashRef.current; if (!el) return; el.textContent = t; el.style.opacity = "1"; setTimeout(() => (el.style.opacity = "0"), 1200); };

  const num = (v: number) => Math.round(v * 100) / 100;
  const vecRow = (label: string, key: "position" | "rotation" | "scale") => sel && (
    <div><div className="rx-label">{label}</div><div className="grid grid-cols-3 gap-1">
      {sel[key].map((v, i) => (
        <input key={i} type="number" step={key === "rotation" ? 0.1 : 0.25} className="rx-input" value={num(v)}
          onChange={(e) => { const nv = [...sel[key]] as [number, number, number]; nv[i] = parseFloat(e.target.value) || 0; s.update(sel.id, { [key]: nv }); }} />
      ))}
    </div></div>
  );

  return (
    <div className="fixed inset-0 bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="rx-panel m-2 mb-0 flex items-center gap-2 px-3 py-2">
        <div className="flex items-baseline gap-2 pr-3 border-r border-border">
          <span className="rx-logo text-xl">REALITYX</span>
          <span className="hidden lg:inline text-xs text-muted-foreground">Build Beyond Reality.</span>
        </div>
        <input className="rx-input w-44" value={s.projectName} onChange={(e) => s.setName(e.target.value)} />
        <Btn title="New project" onClick={() => confirm("Start a new empty world?") && s.reset()}><FilePlus size={16} /></Btn>
        <Btn title="Save (Ctrl+S)" onClick={save}><Save size={16} /></Btn>
        <Btn title="Undo (Ctrl+Z)" onClick={s.undo}><Undo2 size={16} /></Btn>
        <Btn title="Redo (Ctrl+Y)" onClick={s.redo}><Redo2 size={16} /></Btn>
        <Btn title="Import .json/.zip" onClick={() => file.current?.click()}><Upload size={16} /></Btn>
        <Btn title="Export .zip" onClick={exportZip}><Download size={16} /></Btn>
        <Btn title="Load saved" onClick={() => { const r = localStorage.getItem(KEY); if (r) s.load(JSON.parse(r)); }}><FolderOpen size={16} /></Btn>
        <input ref={file} type="file" accept=".json,.zip" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
        <div className="flex-1" />
        <button className="rx-cta" onClick={() => s.setMode(s.mode === "edit" ? "explore" : "edit")}>
          {s.mode === "edit" ? <><Footprints size={16} /> Explore</> : <><PenTool size={16} /> Back to edit</>}
        </button>
      </header>

      <div className="flex-1 flex gap-2 p-2 min-h-0">
        {/* Left tools */}
        <aside className="rx-panel flex flex-col gap-1 p-1.5">
          {tools.map(({ t, icon: I, label, key }) => (
            <Btn key={t} title={`${label} (${key})`} active={s.tool === t} onClick={() => s.setTool(t)}><I size={18} /></Btn>
          ))}
        </aside>

        {/* Library */}
        <aside className="rx-panel w-44 p-3 overflow-y-auto hidden md:block">
          <div className="rx-label mb-2">Asset Library</div>
          <div className="grid grid-cols-2 gap-1.5">
            {library.map(({ type, icon: I }) => (
              <button key={type} onClick={() => s.add(type)} className="rx-tile"><I size={20} /><span className="capitalize">{type}</span></button>
            ))}
          </div>
          <div className="rx-label mt-4 mb-2">Scene ({s.objects.length})</div>
          <div className="flex flex-col gap-0.5">
            {s.objects.map((o) => (
              <button key={o.id} onClick={() => s.select(o.id)} className={`rx-row ${o.id === s.selectedId ? "rx-row-active" : ""}`}>{o.name}</button>
            ))}
          </div>
        </aside>

        {/* Viewport */}
        <main className="relative flex-1 rx-panel overflow-hidden p-0">
          <Suspense fallback={<div className="grid h-full place-items-center text-muted-foreground">Loading engine…</div>}>
            <Viewport />
          </Suspense>
          {s.mode === "explore" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
              <div className="rx-panel px-4 py-2 text-sm">Click to look around · WASD move · Shift run · Esc release mouse</div>
            </div>
          )}
          {s.mode === "explore" && <div className="pointer-events-none absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" />}
          <div ref={flashRef} className="rx-toast">Saved</div>
        </main>

        {/* Inspector */}
        <aside className="rx-panel w-64 p-3 overflow-y-auto hidden lg:flex flex-col gap-3">
          {sel ? (<>
            <div className="rx-label">Inspector</div>
            <input className="rx-input" value={sel.name} onChange={(e) => s.update(sel.id, { name: e.target.value }, false)} />
            {vecRow("Position", "position")}{vecRow("Rotation (rad)", "rotation")}{vecRow("Scale", "scale")}
            <div><div className="rx-label">Color</div><input type="color" className="h-9 w-full rounded-md bg-transparent" value={sel.color} onChange={(e) => s.update(sel.id, { color: e.target.value }, false)} /></div>
            <div><div className="rx-label">Metalness {num(sel.metalness)}</div><input type="range" min={0} max={1} step={0.05} value={sel.metalness} onChange={(e) => s.update(sel.id, { metalness: +e.target.value }, false)} className="rx-range" /></div>
            <div><div className="rx-label">Roughness {num(sel.roughness)}</div><input type="range" min={0} max={1} step={0.05} value={sel.roughness} onChange={(e) => s.update(sel.id, { roughness: +e.target.value }, false)} className="rx-range" /></div>
            <div className="flex gap-2">
              <button className="rx-btn flex-1" onClick={() => s.duplicate(sel.id)}><Copy size={14} /> Duplicate</button>
              <button className="rx-btn rx-danger flex-1" onClick={() => s.remove(sel.id)}><Trash2 size={14} /> Delete</button>
            </div>
          </>) : (<>
            <div className="rx-label flex items-center gap-1"><Sun size={12} /> Environment</div>
            <div><div className="rx-label">Time of day {s.env.timeOfDay.toFixed(1)}h</div><input type="range" min={5} max={19.5} step={0.1} value={s.env.timeOfDay} onChange={(e) => s.setEnv({ timeOfDay: +e.target.value })} className="rx-range" /></div>
            <div><div className="rx-label">Sun intensity</div><input type="range" min={0} max={4} step={0.1} value={s.env.sunIntensity} onChange={(e) => s.setEnv({ sunIntensity: +e.target.value })} className="rx-range" /></div>
            <div><div className="rx-label">Terrain size {s.env.groundSize}</div><input type="range" min={20} max={300} step={10} value={s.env.groundSize} onChange={(e) => s.setEnv({ groundSize: +e.target.value })} className="rx-range" /></div>
            <div><div className="rx-label">Terrain color</div><input type="color" className="h-9 w-full rounded-md bg-transparent" value={s.env.ground} onChange={(e) => s.setEnv({ ground: e.target.value })} /></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.env.fog} onChange={(e) => s.setEnv({ fog: e.target.checked })} /> Fog</label>
            {s.env.fog && <div><div className="rx-label">Fog density</div><input type="range" min={0.002} max={0.06} step={0.002} value={s.env.fogDensity} onChange={(e) => s.setEnv({ fogDensity: +e.target.value })} className="rx-range" /></div>}
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={s.env.showGrid} onChange={(e) => s.setEnv({ showGrid: e.target.checked })} /> Grid</label>
            <p className="text-xs text-muted-foreground mt-2">Select an object to edit it. Camera: left-drag rotate, right-drag move, scroll zooms toward the mouse. Shortcuts: Q/W/E/R tools, Del delete, Ctrl+D duplicate.</p>
          </>)}
        </aside>
      </div>
    </div>
  );
}
