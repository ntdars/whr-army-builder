// Lightweight localStorage-backed replacement for the Claude-artifact
// `window.storage` API. Same async shape (get/set/delete), so App.jsx
// only needed its call sites swapped, not rewritten.
//
// Everything is namespaced under "whr:" so it won't collide with
// anything else that might use localStorage on the same origin.

const NS = "whr:";
const k = (key) => NS + key;

export const storage = {
  async get(key) {
    try {
      const raw = window.localStorage.getItem(k(key));
      if (raw === null) return null;
      return { key, value: raw };
    } catch (e) {
      console.error("storage.get failed", e);
      return null;
    }
  },

  async set(key, value) {
    try {
      window.localStorage.setItem(k(key), value);
      return { key, value };
    } catch (e) {
      console.error("storage.set failed", e);
      return null;
    }
  },

  async delete(key) {
    try {
      window.localStorage.removeItem(k(key));
      return { key, deleted: true };
    } catch (e) {
      console.error("storage.delete failed", e);
      return null;
    }
  },
};
