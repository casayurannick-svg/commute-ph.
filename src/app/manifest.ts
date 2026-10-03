import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'CommutePH - Metro Manila Transit Fare Comparison',
    short_name: 'CommutePH',
    description: 'Compare official fares across Jeepney, Bus, LRT, MRT, UV Express, and ride-hailing in NCR',
    start_url: '/',
    display: 'standalone',
    background_color: '#090d16',
    theme_color: '#0284c7',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
