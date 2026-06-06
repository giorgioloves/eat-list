import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'avec',
    short_name: 'avec',
    description: 'Your personal restaurant list.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f0e8',
    theme_color: '#3b2f27',
    orientation: 'portrait',
  }
}
