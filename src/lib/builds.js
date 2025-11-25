// Simple in-memory build store for dev
export const builds = new Map();
/*
build = {
  id, prompt, userId, status: 'queued'|'running'|'complete'|'error',
  logs: string[], createdAt: number
}
*/
export function createBuild({ id, prompt, userId }) {
  const b = { id, prompt, userId, status: 'queued', logs: [], createdAt: Date.now() };
  builds.set(id, b);
  return b;
}
export const getBuild = (id) => builds.get(id);
export const listBuilds = (userId) =>
  Array.from(builds.values()).filter(b => b.userId === userId).sort((a,b)=>b.createdAt-a.createdAt);
export const appendLog = (id, line) => { const b = builds.get(id); if (!b) return; b.logs.push(line); };
export const setStatus = (id, status) => { const b = builds.get(id); if (!b) return; b.status = status; };
