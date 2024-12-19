'use client';

import { FC, useEffect, useState } from 'react';
import Image, { ImageProps, StaticImageData } from 'next/image';

interface FallbackImageProps extends ImageProps {
  fallbackSrc?: string;
}

const FallbackImage: FC<FallbackImageProps> = ({
  src: srcUrl,
  fallbackSrc = '/not-found-icon.svg',
  width = 24,
  height = 24,
  ...props
}) => {
  const [src, setSrc] = useState<string | StaticImageData>(
    () => srcUrl as string | StaticImageData
  );

  useEffect(() => {
    setSrc(srcUrl as string | StaticImageData);
  }, [srcUrl]);

  return (
    <Image
      src={src}
      width={width}
      height={height}
      onError={() => setSrc(fallbackSrc)}
      {...props}
      alt={props.alt || 'Fallback image'}
      style={{
        ...props.style,
        objectFit: 'contain',
        display: 'block',
        minWidth: `${width}px`,
        minHeight: `${height}px`,
      }}
    />
  );
};

export { FallbackImage };
