import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export const Lightbox = ({ isOpen, image, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 transition-all"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full bg-neutral-900/80 text-white hover:text-amber-400 hover:bg-neutral-800 transition-colors z-50 border border-neutral-700"
        aria-label="Close"
      >
        <X className="w-6 h-6" />
      </button>

      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          className="absolute left-4 sm:left-8 p-3 rounded-full bg-neutral-900/80 text-white hover:text-amber-400 hover:bg-neutral-800 transition-colors z-50 border border-neutral-700"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 sm:right-8 p-3 rounded-full bg-neutral-900/80 text-white hover:text-amber-400 hover:bg-neutral-800 transition-colors z-50 border border-neutral-700"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div
        className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.imageUrl || image.url}
          alt={image.caption || image.title || 'Barbershop image'}
          className="max-h-[75vh] w-auto max-w-full rounded-lg object-contain shadow-2xl border border-neutral-800"
        />
        {(image.title || image.caption || image.barberName) && (
          <div className="mt-4 text-center px-4">
            <h4 className="text-base sm:text-lg font-semibold text-amber-300">
              {image.title || image.caption}
            </h4>
            {image.barberName && (
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Usta / Barber: <span className="text-white font-medium">{image.barberName}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
