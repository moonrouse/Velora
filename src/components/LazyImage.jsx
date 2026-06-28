import { useEffect, useRef, useState } from 'react';

function LazyImage({ src, alt, className, ...rest }) {
  const [isVisible, setVisible] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const node = imgRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={isVisible ? src : undefined}
      data-src={src}
      alt={alt}
      className={className}
      {...rest}
    />
  );
}

export default LazyImage;
