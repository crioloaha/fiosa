'use client';

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string; // Data URL or object URL of the selected image
  aspectRatio: '1:1' | '3:1' | '16:9'; // Target crop ratio
  onClose: () => void;
  onCrop: (croppedBlob: Blob) => void;
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  aspectRatio,
  onClose,
  onCrop,
}: ImageCropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Reset state when new image is loaded
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [imageSrc, isOpen]);

  if (!isOpen) return null;

  // Aspect ratio calculations for visual crop box
  let containerAspectRatioClass = 'aspect-square';
  let targetRatio = 1;
  if (aspectRatio === '3:1') {
    containerAspectRatioClass = 'aspect-[3/1]';
    targetRatio = 3;
  } else if (aspectRatio === '16:9') {
    containerAspectRatioClass = 'aspect-[16/9]';
    targetRatio = 16 / 9;
  }

  // Handle Drag / Pan
  const handleStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = { x: clientX - offset.x, y: clientY - offset.y };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setOffset({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Mouse Events
  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: ReactMouseEvent) => {
    handleMove(e.clientX, e.clientY);
  };

  // Touch Events (Mobile support)
  const handleTouchStart = (e: ReactTouchEvent) => {
    if (e.touches.length === 1) {
      handleStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: ReactTouchEvent) => {
    if (e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  // Generate Cropped Image using Canvas
  const handleSave = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    // Create target canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Define output dimensions based on crop type
    let width = 600;
    if (aspectRatio === '3:1') {
      width = 1200;
    } else if (aspectRatio === '16:9') {
      width = 1600;
    }
    const height = width / targetRatio;

    canvas.width = width;
    canvas.height = height;

    // Calculate dimensions & position relative to container
    const containerRect = container.getBoundingClientRect();
    const scaleX = img.naturalWidth / (img.width * zoom);
    const scaleY = img.naturalHeight / (img.height * zoom);

    // Compute source crop coordinates
    // Offset is how much the image center has been dragged relative to container center
    const imgRect = img.getBoundingClientRect();
    const sourceX = (containerRect.left - imgRect.left) * scaleX;
    const sourceY = (containerRect.top - imgRect.top) * scaleY;
    const sourceWidth = containerRect.width * scaleX;
    const sourceHeight = containerRect.height * scaleY;

    // Draw the image section to the canvas
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      width,
      height
    );

    // Export as Blob
    canvas.toBlob((blob) => {
      if (blob) {
        onCrop(blob);
      }
    }, 'image/jpeg', 0.85);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 font-sans text-xs">
      <div className="bg-[#FDFBF7] rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col border border-[#8D7F73]/30">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#8D7F73]/20 bg-[#F3EFE9]">
          <h3 className="font-serif text-base font-bold text-[#2B2D2F] flex items-center gap-2">
            <Move size={18} className="text-[#C15C3D]" />
            Recortar e Centralizar Foto
          </h3>
          <button type="button" onClick={onClose} className="text-[#2B2D2F]/60 hover:text-red-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Cropper area */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <p className="text-[#2B2D2F]/60 text-center">
            Arraste a foto para ajustar a centralização e use a barra abaixo para dar zoom.
          </p>

          {/* Mask Frame Container */}
          <div 
            ref={containerRef}
            className={`w-full max-w-md border-2 border-[#C15C3D] relative overflow-hidden bg-slate-100 rounded-lg shadow-inner select-none ${containerAspectRatioClass}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEnd}
          >
            {/* The Image being cropped */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              draggable="false"
              className="absolute max-w-none origin-center cursor-move"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                left: '0px',
                top: '0px',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
            {/* Aspect ratio guide overlay */}
            <div className="absolute inset-0 pointer-events-none border border-white/40 border-dashed" />
          </div>

          {/* Zoom Slider */}
          <div className="w-full max-w-md flex items-center gap-3 pt-2">
            <ZoomOut size={16} className="text-[#2B2D2F]/50" />
            <input
              type="range"
              min="1"
              max="4"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-[#8D7F73]/20 rounded-lg appearance-none cursor-pointer accent-[#C15C3D]"
            />
            <ZoomIn size={16} className="text-[#2B2D2F]/50" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end px-6 py-4 border-t border-[#8D7F73]/20 bg-[#F3EFE9]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-[#8D7F73]/40 rounded font-bold uppercase hover:bg-white/50 text-[#2B2D2F]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-[#C15C3D] hover:bg-[#C15C3D]/95 text-white px-5 py-2.5 rounded font-bold uppercase shadow-sm"
          >
            Recortar e Salvar
          </button>
        </div>

      </div>
    </div>
  );
}
