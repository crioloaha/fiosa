'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="space-y-4">
      {/* Large view */}
      <div className="relative h-96 md:h-[500px] w-full rounded-2xl overflow-hidden bg-slate-100 border border-fiosa-marrom/20 shadow-sm">
        <Image
          src={activeImage}
          alt={productName}
          fill
          className="object-cover transition-all duration-300"
          priority
        />
      </div>

      {/* Thumbnails row */}
      {images.length > 1 && (
        <div className="flex gap-3 overflow-x-auto py-1">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 bg-slate-100 transition-all ${
                activeImage === img ? 'border-fiosa-terracota scale-95 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
