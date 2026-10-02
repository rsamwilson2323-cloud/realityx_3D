import { create } from "zustand";

export type ObjType = "box" | "sphere" | "cylinder" | "cone" | "torus" | "tree" | "rock" | "house" | "character" | "lamp" | "pyramid" | "capsule" | "wall" | "stairs" | "fence" | "bush" | "pillar" | "crate" | "bench" | "car" | "flower" | "gem";
export type Vec3 = [number, number, number];
export interface WorldObject {
  id: string;
  type: ObjType;
  name: string;
  position: Vec3;
  rotation: Vec3;
  scale: Vec3;
  color: string;
  metalness: number;
  roughness: number;
}
export interface Environment {
  timeOfDay: number; // 0-24
  sunIntensity: number;
  fog: boolean;
  fogDensity: number;
  ground: string;
  groundSize: number;
  showGrid: boolean;
}
export type Tool = "select" | "translate" | "rotate" | "scale";

interface Snapshot { objects: WorldObject[]; env: Environment }

interface State extends Snapshot {
  projectName: string;
  selectedId: string | null;
  tool: Tool;
  mode: "edit" | "explore";
  past: Snapshot[];
  future: Snapshot[];
  setTool: (t: Tool) => void;
  setMode: (m: "edit" | "explore") => void;
  select: (id: string | null) => void;
  add: (type: ObjType) => void;
  update: (id: string, p: Partial<WorldObject>, record?: boolean) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => void;
  setEnv: (p: Partial<Environment>) => void;
  setName: (n: string) => void;
  commit: () => void;
  undo: () => void;
  redo: () => void;
  load: (d: { projectName?: string; objects: WorldObject[]; env: Environment }) => void;
  reset: () => void;
}

const defaults: Record<ObjType, string> = {
  box: "#7c8cff", sphere: "#e8a33c", cylinder: "#4fc3a1", cone: "#e45d6a", torus: "#b98cff",
  tree: "#3f8f4a", rock: "#7d7a74", house: "#c98a5b", character: "#3d7be0", lamp: "#ffe08a",
  pyramid: "#d9b46a", capsule: "#5fb0e8", wall: "#b8b0a2", stairs: "#9c9488", fence: "#8a6440", bush: "#4d9a45", pillar: "#d8d2c4", crate: "#a87a48", bench: "#7a5434", car: "#d8423a", flower: "#e86aa8", gem: "#6ae0d8",
};
const uid = () => Math.random().toString(36).slice(2, 9);
export const defaultEnv: Environment = { timeOfDay: 14, sunIntensity: 1.6, fog: true, fogDensity: 0.015, ground: "#5d7d4a", groundSize: 120, showGrid: true };

const starter = (): WorldObject[] => [
  mk("house", [0, 0, -6]), mk("tree", [-6, 0, -3]), mk("tree", [7, 0, -8]), mk("rock", [4, 0, 2]), mk("character", [0, 0, 3]), mk("lamp", [-3, 0, 2]),
];
function mk(type: ObjType, position: Vec3 = [0, 0, 0]): WorldObject {
  const lift = ["box", "sphere", "cylinder", "cone", "torus", "capsule", "gem"].includes(type) ? 1 : 0;
  return { id: uid(), type, name: `${type.charAt(0).toUpperCase()}${type.slice(1)}`, position: [position[0], position[1] + lift, position[2]], rotation: [0, 0, 0], scale: [1, 1, 1], color: defaults[type], metalness: 0.1, roughness: 0.7 };
}

export const useWorld = create<State>((set, get) => {
  const snap = (): Snapshot => ({ objects: structuredClone(get().objects), env: { ...get().env } });
  const record = () => set({ past: [...get().past.slice(-50), snap()], future: [] });
  return {
    projectName: "Untitled World",
    objects: starter(),
    env: defaultEnv,
    selectedId: null,
    tool: "translate",
    mode: "edit",
    past: [],
    future: [],
    setTool: (tool) => set({ tool }),
    setMode: (mode) => set({ mode, selectedId: null }),
    select: (selectedId) => set({ selectedId }),
    add: (type) => {
      record();
      const o = mk(type, [(Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 6]);
      set({ objects: [...get().objects, o], selectedId: o.id });
    },
    update: (id, p, rec = true) => {
      if (rec) record();
      set({ objects: get().objects.map((o) => (o.id === id ? { ...o, ...p } : o)) });
    },
    remove: (id) => { record(); set({ objects: get().objects.filter((o) => o.id !== id), selectedId: null }); },
    duplicate: (id) => {
      const o = get().objects.find((x) => x.id === id); if (!o) return;
      record();
      const c = { ...structuredClone(o), id: uid(), name: o.name + " copy", position: [o.position[0] + 1.5, o.position[1], o.position[2]] as Vec3 };
      set({ objects: [...get().objects, c], selectedId: c.id });
    },
    setEnv: (p) => set({ env: { ...get().env, ...p } }),
    setName: (projectName) => set({ projectName }),
    commit: record,
    undo: () => { const { past } = get(); if (!past.length) return; const prev = past[past.length - 1]; set({ future: [snap(), ...get().future], past: past.slice(0, -1), ...prev }); },
    redo: () => { const { future } = get(); if (!future.length) return; set({ past: [...get().past, snap()], future: future.slice(1), ...future[0] }); },
    load: (d) => set({ objects: d.objects, env: { ...defaultEnv, ...d.env }, projectName: d.projectName ?? "Imported World", selectedId: null, past: [], future: [] }),
    reset: () => set({ objects: [], env: defaultEnv, projectName: "Untitled World", selectedId: null, past: [], future: [] }),
  };
});
