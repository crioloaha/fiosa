'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';

interface Artisan {
  id: string;
  nome: string;
  marca: string | null;
  slug: string;
  bio: string | null;
  foto: string | null;
  cidade: string;
}

interface ArtesaosCarouselProps {
  artesaos: Artisan[];
}

export default function ArtesaosCarousel({ artesaos }: { artesaos: any[] }) {
  const [shuffled, setShuffled] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Shuffle artisans list on page load
  useEffect(() => {
    if (artesaos.length === 0) return;
    const arr = [...artesaos];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setShuffled(arr);
  }, [artesaos]);

  // Monitor scroll to show/hide arrows
  const checkScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setShowLeftArrow(el.scrollLeft > 10);
    // Show right arrow if there's remaining scroll area
    setShowRightArrow(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      // Run once initially
      checkScroll();
      // Also check on window resize
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [shuffled]);

  const handleScroll = (direction: 'left' | 'right') => {
    const el = containerRef.current;
    if (!el) return;

    // Determine card step width: width of first card + gap
    const firstCard = el.firstElementChild as HTMLElement;
    const step = firstCard ? firstCard.clientWidth + 24 : 312; // default 312px

    el.scrollBy({
      left: direction === 'right' ? step : -step,
      behavior: 'smooth',
    });
  };

  if (shuffled.length === 0) {
    return (
      <div className="flex gap-6 overflow-hidden py-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="shrink-0 w-72 h-96 bg-fiosa-linho animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative group">
      {/* Navigation Arrows */}
      {showLeftArrow && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 bg-fiosa-cru border border-fiosa-marrom/20 hover:bg-fiosa-terracota hover:text-white text-fiosa-grafite p-3 rounded-full shadow-md hover:shadow-lg transition-all"
          aria-label="Artisans anteriores"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 bg-fiosa-cru border border-fiosa-marrom/20 hover:bg-fiosa-terracota hover:text-white text-fiosa-grafite p-3 rounded-full shadow-md hover:shadow-lg transition-all"
          aria-label="Próximos artisans"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Horizontal scroll container with native swipe and snap */}
      <div
        ref={containerRef}
        className="flex gap-6 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shuffled.map((artesao) => (
          <div
            key={artesao.id}
            className="snap-start shrink-0 w-72 bg-fiosa-cru rounded-xl overflow-hidden border border-fiosa-marrom/10 shadow-sm hover:shadow-md transition-shadow flex flex-col"
          >
            <div className="relative h-56 w-full bg-slate-100">
              <Image
                src={artesao.foto || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'}
                alt={artesao.nome}
                fill
                sizes="288px"
                className="object-cover"
              />
            </div>
            <div className="p-5 flex flex-col flex-grow space-y-3">
              <div>
                <h3 className="font-serif text-lg text-fiosa-grafite font-bold">{artesao.nome}</h3>
                {artesao.marca && (
                  <p className="font-sans text-xs tracking-widest text-fiosa-marrom uppercase font-bold">
                    {artesao.marca}
                  </p>
                )}
              </div>
              <p className="font-sans text-xs text-fiosa-grafite/70 line-clamp-3 leading-relaxed flex-grow">
                {artesao.bio}
              </p>
              <div className="flex items-center text-xs text-fiosa-grafite/50 gap-1 font-semibold">
                <MapPin size={14} className="text-fiosa-terracota" />
                {artesao.cidade}
              </div>
              <Link
                href={`/artesao/${artesao.slug}`}
                className="block text-center border border-fiosa-terracota text-fiosa-terracota hover:bg-fiosa-terracota hover:text-white py-2.5 rounded font-sans font-bold text-[11px] tracking-wider transition-all"
              >
                CONHEÇA O ARTESÃO
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {/* Subtle fade hint on right edge if more elements are scrollable */}
      {showRightArrow && (
        <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-[#FDFBF7] to-transparent opacity-60" />
      )}
    </div>
  );
}
