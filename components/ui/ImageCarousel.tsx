import React, { useState } from 'react';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';

interface ImageCarouselProps {
  images: string[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  }

  if (!images || images.length === 0) {
    return <div className="w-full h-[40vh] bg-secondary flex items-center justify-center text-text-secondary">No Image</div>;
  }

  return (
    <div className="relative w-full">
      <div className="relative h-[40vh] overflow-hidden bg-primary">
        <img src={images[currentIndex]} alt={`Slide ${currentIndex}`} className="w-full h-full object-contain" />
        {images.length > 1 && (
            <>
                <button onClick={goToPrevious} className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10">
                    <ChevronLeftIcon />
                </button>
                <button onClick={goToNext} className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 z-10">
                    <ChevronRightIcon />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-full z-10">
                    {currentIndex + 1} / {images.length}
                </div>
            </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex justify-center p-2 space-x-2 bg-primary overflow-x-auto">
            {images.map((image, index) => (
                <button key={index} onClick={() => goToImage(index)} className={`w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors ${currentIndex === index ? 'border-accent' : 'border-transparent'}`}>
                     <img src={image} alt={`Thumbnail ${index}`} className="w-full h-full object-cover" />
                </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;