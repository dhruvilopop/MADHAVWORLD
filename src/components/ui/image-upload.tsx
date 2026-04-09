'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: 'products' | 'gallery' | 'categories' | 'logos'
  className?: string
  aspectRatio?: string
}

export function ImageUpload({ 
  value, 
  onChange, 
  folder = 'products',
  className,
  aspectRatio = 'aspect-square'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.')
      return
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        onChange(data.url)
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [folder, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const file = e.dataTransfer.files[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleUpload(file)
    }
  }, [handleUpload])

  const handleRemove = useCallback(() => {
    onChange('')
  }, [onChange])

  return (
    <div className={cn('relative', className)}>
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              'relative group rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50',
              aspectRatio
            )}
          >
            <img
              src={value}
              alt="Uploaded image"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Remove
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              'relative rounded-2xl border-2 border-dashed transition-all cursor-pointer overflow-hidden',
              aspectRatio,
              isDragging 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-gray-300 hover:border-amber-400 hover:bg-gray-50'
            )}
          >
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                  <span className="text-sm text-gray-500">Uploading...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
                    isDragging ? 'bg-amber-100' : 'bg-gray-100'
                  )}>
                    {isDragging ? (
                      <ImageIcon className="w-7 h-7 text-amber-500" />
                    ) : (
                      <Upload className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {isDragging ? 'Drop image here' : 'Click to upload'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      or drag and drop
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    PNG, JPG, GIF, WebP up to 10MB
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 mt-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// Multiple image upload component
interface MultiImageUploadProps {
  value?: string[]
  onChange: (urls: string[]) => void
  folder?: 'products' | 'gallery' | 'categories' | 'logos'
  maxImages?: number
  className?: string
}

export function MultiImageUpload({
  value = [],
  onChange,
  folder = 'products',
  maxImages = 5,
  className,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = useCallback(async (file: File) => {
    if (value.length >= maxImages) {
      setError(`Maximum ${maxImages} images allowed.`)
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB.')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', folder)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok && data.url) {
        onChange([...value, data.url])
      } else {
        setError(data.error || 'Upload failed')
      }
    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setIsUploading(false)
    }
  }, [folder, value, onChange, maxImages])

  const handleRemove = useCallback((index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }, [value, onChange])

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {value.map((url, index) => (
          <motion.div
            key={url}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group"
          >
            <img src={url} alt={`Image ${index + 1}`} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemove(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        ))}

        {value.length < maxImages && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-amber-400 cursor-pointer flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-all">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleUpload(file)
              }}
              disabled={isUploading}
            />
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
            <span className="text-xs text-gray-400 mt-1">Add Image</span>
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      <p className="text-xs text-gray-400">
        {value.length}/{maxImages} images uploaded
      </p>
    </div>
  )
}
