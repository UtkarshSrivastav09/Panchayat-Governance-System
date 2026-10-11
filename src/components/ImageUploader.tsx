"use client";

import { useState, useRef, useEffect } from "react";
import imageCompression from "browser-image-compression";
import { Camera, Image as ImageIcon, X, RefreshCw } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ImageUploaderProps {
  onImageSelected: (file: File | null) => void;
  className?: string;
  selectedFile?: File | null;
}

export default function ImageUploader({
  onImageSelected,
  className = "",
  selectedFile = null,
}: ImageUploaderProps) {
  const { t, locale } = useI18n();
  const [preview, setPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // Effect to update preview when selectedFile changes
  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [selectedFile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setCompressing(true);

      // Compress image client side for slow 2G/3G/4G networks
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);
      onImageSelected(compressedFile);
    } catch (err) {
      console.warn("Compression failed or fallback needed:", err);
      // Fallback: use raw file if compression fails
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      onImageSelected(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleClear = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onImageSelected(null);
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        id="crop-photo-input"
      />

      {!preview ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative cursor-pointer flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-emerald-300 bg-white/70 backdrop-blur-md hover:bg-emerald-50/50 hover:border-emerald-500 transition-all shadow-sm hover:shadow-md text-center"
          role="button"
          tabIndex={0}
        >
          <div className="w-16 h-16 mb-4 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform shadow-inner">
            <Camera className="w-8 h-8" />
          </div>

          <p className="text-lg font-bold text-slate-800 mb-1">
            {t("crop_doctor.upload_label")}
          </p>

          <p className="text-sm text-slate-500 max-w-xs">
            {locale === "hi"
              ? "खेत में खड़े होकर सीधे पौधे की फोटो खींचें या गैलरी से चुनें (JPG, PNG, WebP)"
              : "Take photo directly from your farm or select from gallery"}
          </p>

          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-600 text-white font-medium text-sm shadow hover:bg-emerald-700">
            <ImageIcon className="w-4 h-4" />
            <span>{locale === "hi" ? "फोटो चुनें" : "Select Photo"}</span>
          </div>
        </div>
      ) : (
        <div className="relative rounded-3xl overflow-hidden border border-emerald-200 shadow-md bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Uploaded crop"
            className="w-full h-64 sm:h-72 object-cover"
          />

          {compressing && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <p className="text-sm font-semibold">
                {locale === "hi" ? "फोटो अनुकूलित हो रही है..." : "Optimizing photo..."}
              </p>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Change photo"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Remove photo"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
