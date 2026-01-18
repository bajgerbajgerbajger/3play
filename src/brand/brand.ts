import logoIcon from '@/assets/branding/logo_400x100.png'
import logoHorizontal from '@/assets/branding/logo_800x200.png'

export const BRAND = {
  name: "3Play",
  tagline: "Watch. Create. Play.",
  colors: {
    bg: "#0B0B0D",
    card: "#121212",
    border: "#1E1E1E",
    text: "#FFFFFF",
    muted: "#999999",
    primary: "#E50914",
    success: "#00C853",
    warning: "#FFB300",
    error: "#D32F2F",
    info: "#2196F3",
  },
  radius: { sm: 8, md: 12, lg: 16 },
  assets: {
    logoIcon,
    logoHorizontal,
    logoPrimary: logoHorizontal,
  },
} as const;

export type Brand = typeof BRAND;
