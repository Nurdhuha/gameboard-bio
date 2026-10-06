/**
 * Konfigurasi URL Server Backend Ecoplay
 * Mendukung Vercel Serverless (same-origin / relative URL), custom environment variable,
 * localhost, serta akses via LAN IP (HP/Tablet).
 */
export const getBackendUrl = (): string => {
  // 1. Jika ada environment variable kustom
  if (import.meta.env.VITE_BACKEND_URL) {
    return import.meta.env.VITE_BACKEND_URL.replace(/\/$/, '');
  }

  // 2. Di lingkungan browser:
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol, origin } = window.location;

    // Jika berjalan di Vercel (atau domain publik produksi lainnya), gunakan same-origin
    if (hostname.endsWith('.vercel.app') || (!hostname.includes('localhost') && !hostname.includes('127.0.0.1') && !hostname.startsWith('192.168.'))) {
      return origin;
    }

    // Jika di localhost atau IP LAN lokal guru (port 5000)
    if (hostname) {
      return `${protocol}//${hostname}:5000`;
    }
  }

  return 'http://localhost:5000';
};

/**
 * Vercel Serverless tidak mendukung koneksi WebSocket (Socket.io) yang persisten.
 * Pada deployment tersebut sinkronisasi guru ↔ siswa sepenuhnya memakai HTTP polling.
 */
export const supportsRealtimeSocket = (): boolean => {
  if (import.meta.env.VITE_BACKEND_URL) return true;
  if (typeof window === 'undefined') return true;
  const { hostname } = window.location;
  const isLocal =
    hostname.includes('localhost') || hostname.includes('127.0.0.1') || hostname.startsWith('192.168.');
  return isLocal;
};
