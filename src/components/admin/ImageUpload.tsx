'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  urls: string[]
  onChange: (urls: string[]) => void
  bucket?: string
}

export default function ImageUpload({ urls, onChange, bucket = 'products' }: Props) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('bucket', bucket)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onChange([...urls, data.url])
    } catch {
      toast.error('Erro ao fazer upload')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {urls.map((url, i) => (
          <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
            <Image src={url} alt="imagem" fill className="object-cover" sizes="80px" />
            <button
              onClick={() => onChange(urls.filter((_, j) => j !== i))}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        ))}

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-clara-rosa flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-clara-rosa transition-colors disabled:opacity-50"
        >
          {uploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
          <span className="text-xs">Foto</span>
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  )
}
