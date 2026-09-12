"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CloudUpload, Image as ImageIcon, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

const mainVariant = {
  initial: { x: 0, y: 0 },
  animate: { x: 20, y: -20, opacity: 0.9 },
};

const secondaryVariant = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

interface FileUploadProps {
  onChange?: (files: File[]) => void;
  initialPreviewUrl?: string | null;
}

export const FileUploadStruc: React.FC<FileUploadProps> = ({
  onChange,
  initialPreviewUrl,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialPreviewUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPreviewUrl && files.length === 0) {
      setPreviewUrl(initialPreviewUrl);
    }
  }, [initialPreviewUrl, files.length]);

  const handleFileChange = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const selected = [newFiles[0]];
    setFiles(selected);
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(URL.createObjectURL(selected[0]));
    onChange?.(selected);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setFiles([]);
    setPreviewUrl(null);
    onChange?.([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: false,
    noClick: true,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    onDrop: handleFileChange,
  });

  const formatFileSize = (size: number) => (size / (1024 * 1024)).toFixed(2);

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-6 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
        />

        {previewUrl ? (
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md h-56 rounded-lg overflow-hidden border border-border group/preview shadow-sm">
              <Image
                src={previewUrl}
                alt="Preview"
                fill
                className="object-cover object-center"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors z-30"
                aria-label="Xóa ảnh"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Nhấp để chọn ảnh khác (hỗ trợ JPG, PNG, WEBP tối đa 5MB)
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <p className="relative z-20 font-bold text-foreground text-xl">
              Tải lên ảnh bìa
            </p>
            <p className="relative z-20 font-normal text-muted-foreground text-sm mt-1">
              Kéo hoặc thả ảnh vào đây hoặc nhấp để chọn tệp (tối đa 5MB)
            </p>
            <div className="relative w-full mt-6 max-w-xl mx-auto flex items-center justify-center">
              <div className="p-6 rounded-full bg-primary/5 text-primary">
                <CloudUpload className="w-10 h-10" />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default function FileUploadMotion({
  onChange,
  initialPreviewUrl,
}: FileUploadProps) {
  return (
    <div className="w-full mx-auto min-h-64 border border-dashed bg-card border-border rounded-lg flex items-center justify-center">
      <FileUploadStruc
        onChange={onChange}
        initialPreviewUrl={initialPreviewUrl}
      />
    </div>
  );
}
