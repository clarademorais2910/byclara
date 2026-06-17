import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('id, updated_at')
    .eq('active', true)

  const base = 'https://clarabyclara.com.br'

  const productUrls: MetadataRoute.Sitemap = (products ?? []).map(p => ({
    url:             `${base}/produto/${p.id}`,
    lastModified:    new Date(p.updated_at),
    changeFrequency: 'weekly',
    priority:        0.8,
  }))

  return [
    { url: base,                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: `${base}/catalogo`,                lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${base}/monte-sua-pulseira`,      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/encomendas`,              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    ...productUrls,
  ]
}
