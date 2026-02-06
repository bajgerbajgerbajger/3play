export const STORAGE_LIMITS = {
  // Neomezená velikost souboru (Infinity)
  MAX_FILE_SIZE: Infinity,
  
  // Neomezený počet videí na uživatele
  MAX_VIDEOS_PER_USER: Infinity,
  
  // Neomezené celkové úložiště
  MAX_STORAGE_PER_USER: Infinity,
  
  // Podporované formáty
  ACCEPTED_VIDEO_TYPES: {
    'video/mp4': [],
    'video/webm': [],
    'video/ogg': [],
    'video/quicktime': [], // .mov
    'video/x-msvideo': [], // .avi
    'video/x-matroska': [] // .mkv
  }
};

export const CDN_CONFIG = {
  provider: 'Cloudflare R2 + AWS CloudFront',
  region: 'global-edge',
  replication: true, // Redundance dat
  caching: {
    strategy: 'stale-while-revalidate',
    ttl: 31536000 // 1 rok
  }
};
