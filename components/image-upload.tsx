"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Upload, X, Loader2, ImageIcon } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder: "medals" | "certificates" | "photos"
  label?: string
}

export function ImageUpload({ value, onChange, folder, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다")
      return
    }

    // 이미지 타입 체크
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다")
      return
    }

    setIsUploading(true)

    try {
      const supabase = createClient()

      // 현재 유저 확인
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("로그인이 필요합니다")
        return
      }

      // 파일명 생성 (유저ID/타임스탬프_원본파일명)
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}/${folder}_${Date.now()}.${fileExt}`

      // Supabase Storage에 업로드
      const { data, error } = await supabase.storage
        .from("medals")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (error) throw error

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from("medals")
        .getPublicUrl(data.path)

      setPreview(publicUrl)
      onChange(publicUrl)
    } catch (error) {
      console.error("Upload error:", error)
      alert("업로드 중 오류가 발생했습니다")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange("")
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        disabled={isUploading}
      />

      {preview ? (
        <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-lg border border-border">
          <Image
            src={preview}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onClick={() => !isUploading && inputRef.current?.click()}
          className="flex aspect-square w-full max-w-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/20 transition-colors hover:border-primary hover:bg-muted/40"
        >
          {isUploading ? (
            <>
              <Loader2 className="mb-2 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">업로드 중...</p>
            </>
          ) : (
            <>
              <ImageIcon className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">클릭하여 업로드</p>
              <p className="text-xs text-muted-foreground/60">최대 5MB</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
