/**
 * Utilitário de cache cliente com TTL (Time To Live) e monitorização.
 * Focado em reduzir leituras redundantes da base de dados.
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const DEFAULT_TTL = 1000 * 60 * 30; // 30 minutos por defeito para dados estáticos

interface CacheStats {
  hits: number;
  misses: number;
  hitRate?: number;
}

const getStats = (): CacheStats => {
  if (typeof window === 'undefined') return { hits: 0, misses: 0 };
  const raw = localStorage.getItem('nk_cache_stats');
  const stats = raw ? JSON.parse(raw) : { hits: 0, misses: 0 };
  const total = stats.hits + stats.misses;
  return {
    ...stats,
    hitRate: total > 0 ? stats.hits / total : 0
  };
};

const updateStats = (type: 'hit' | 'miss') => {
  if (typeof window === 'undefined') return;
  const stats = getStats();
  if (type === 'hit') stats.hits++;
  else stats.misses++;
  localStorage.setItem('nk_cache_stats', JSON.stringify(stats));
  
  // Log de performance a cada 5 operações
  if ((stats.hits + stats.misses) % 5 === 0) {
    const total = stats.hits + stats.misses;
    const ratio = (stats.hits / total * 100).toFixed(1);
    console.info(`[Cache Stats] Total: ${total}, Hits: ${stats.hits}, Misses: ${stats.misses}, Efficiency: ${ratio}%`);
  }
};

export const cache = {
  getStats,
  
  resetStats: () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('nk_cache_stats', JSON.stringify({ hits: 0, misses: 0 }));
  },

  set: <T>(key: string, data: T, ttl: number = DEFAULT_TTL): void => {
    if (typeof window === 'undefined') return;
    
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };
    
    try {
      localStorage.setItem(`nk_cache_${key}`, JSON.stringify(item));
      // Gravado: ${key} (Expira em: ${ttl / 1000 / 60}m)
    } catch (e) {
      // Erro ao gravar no localStorage
    }
  },

  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;
    
    const raw = localStorage.getItem(`nk_cache_${key}`);
    if (!raw) {
      updateStats('miss');
      console.debug(`[Cache] Miss: ${key}`);
      return null;
    }
    
    try {
      const item: CacheItem<T> = JSON.parse(raw);
      const now = Date.now();
      const isExpired = now - item.timestamp > item.ttl;
      
      if (isExpired) {
        updateStats('miss');
        localStorage.removeItem(`nk_cache_${key}`);
        return null;
      }
      
      updateStats('hit');
      return item.data;
    } catch (e) {
      // Erro ao processar item do cache
      updateStats('miss');
      return null;
    }
  },

  invalidate: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`nk_cache_${key}`);
    // Cache Invalidated: ${key}
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    Object.keys(localStorage)
      .filter(key => key.startsWith('nk_cache_'))
      .forEach(key => localStorage.removeItem(key));
    // Cache Cleared
  }
};
