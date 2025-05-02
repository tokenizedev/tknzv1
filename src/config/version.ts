// Safely read VITE_APP_VERSION from import.meta.env (may be undefined in test env)
export const APP_VERSION = ((import.meta as any).env?.VITE_APP_VERSION) ?? '';