import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  validateFile,
  fileToDataUrl,
  getMediaType,
  saveMedia,
  removeMedia,
  getMediaBySection,
  getGitHubConfig,
  autoSyncToGitHub,
  MediaItem,
} from '../utils/storage';

interface MediaUploadProps {
  section: string;
  type: 'image' | 'video' | 'both';
  label?: string;
}

function compressImage(file: File, maxWidth = 1000, quality = 0.75): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Ошибка обработки изображения'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const size = Math.round((dataUrl.length * 3) / 4);
        resolve({ dataUrl, size });
      };
      img.onerror = () => reject(new Error('Ошибка загрузки изображения'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsDataURL(file);
  });
}

export function MediaUpload({ section, type, label = 'Загрузить медиа' }: MediaUploadProps) {
  const { isAuthenticated } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>(() => getMediaBySection(section));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshMedia = useCallback(() => {
    setMedia(getMediaBySection(section));
  }, [section]);

  useEffect(() => {
    refreshMedia();
    window.addEventListener('storage', refreshMedia);
    return () => window.removeEventListener('storage', refreshMedia);
  }, [refreshMedia]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Ошибка файла');
      return;
    }

    const mediaType = getMediaType(file);
    if (type === 'image' && mediaType !== 'image') {
      setError('Разрешены только изображения');
      return;
    }
    if (type === 'video' && mediaType !== 'video') {
      setError('Разрешены только видео');
      return;
    }

    setIsLoading(true);
    try {
      let dataUrl: string;
      let finalSize = file.size;

      if (mediaType === 'image' && file.type !== 'image/gif') {
        const compressed = await compressImage(file);
        dataUrl = compressed.dataUrl;
        finalSize = compressed.size;
      } else {
        dataUrl = await fileToDataUrl(file);
      }

      const item: MediaItem = {
        id: `${section}-${Date.now()}`,
        name: file.name,
        type: mediaType,
        dataUrl,
        size: finalSize,
        uploadedAt: new Date().toISOString(),
        section,
      };
      saveMedia(item);
      refreshMedia();
    } catch {
      setError('Ошибка загрузки файла');
    }
    setIsLoading(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (id: string) => {
    removeMedia(id);
    refreshMedia();
    const githubConfig = getGitHubConfig();
    if (githubConfig?.token) {
      autoSyncToGitHub(githubConfig).catch(console.error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-4 space-y-3">
        {media.map((item) => (
          <MediaPreview key={item.id} item={item} />
        ))}
      </div>
    );
  }

  const acceptTypes = type === 'image'
    ? 'image/jpeg,image/png,image/webp,image/gif'
    : type === 'video'
    ? 'video/mp4,video/webm'
    : 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm';

  return (
    <div className="mt-4 space-y-4">
      <div className="border-2 border-dashed border-gold/30 rounded-lg p-4 text-center hover:border-gold/50 transition-all">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileChange}
          className="hidden"
          id={`upload-${section}`}
        />
        <label
          htmlFor={`upload-${section}`}
          className="cursor-pointer inline-flex flex-col items-center gap-2"
        >
          <span className="text-3xl">📁</span>
          <span className="font-condensed text-gold text-sm uppercase tracking-wider">
            {label}
          </span>
          <span className="text-paper/40 text-xs">
            JPG, PNG, WebP, GIF, MP4, WebM (макс. 5 МБ)
          </span>
        </label>
        {isLoading && (
          <div className="mt-2 text-gold text-sm">Загрузка и сжатие...</div>
        )}
        {error && (
          <div className="mt-2 text-army-red text-sm">⚠️ {error}</div>
        )}
      </div>

      {media.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-condensed text-gold text-sm uppercase tracking-wider">
            Загруженные файлы:
          </h4>
          {media.map((item) => (
            <div key={item.id} className="relative group">
              <MediaPreview item={item} />
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-2 right-2 w-7 h-7 bg-army-red text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm"
                title="Удалить"
              >
                ×
              </button>
              <div className="text-paper/30 text-xs mt-1">
                {item.name} • {(item.size / 1024).toFixed(1)} КБ
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MediaPreview({ item }: { item: MediaItem }) {
  if (item.type === 'image') {
    return (
      <img
        src={item.dataUrl}
        alt={item.name}
        className="w-full max-h-64 object-contain rounded border border-gold/20 bg-dark-green/50"
        loading="lazy"
      />
    );
  }
  return (
    <video
      src={item.dataUrl}
      controls
      playsInline
      className="w-full max-h-80 rounded border border-gold/20 bg-dark-green/50"
    >
      Ваш браузер не поддерживает видео.
    </video>
  );
}
