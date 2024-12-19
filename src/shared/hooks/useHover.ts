import { RefObject, useEffect, useState } from 'react';

function useHover(ref: RefObject<HTMLElement>) {
  const [isHovering, setHovering] = useState(false);

  const on = () => setHovering(true);
  const off = () => setHovering(false);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const node = ref.current;

    node.addEventListener('mouseenter', on);
    node.addEventListener('mousemove', on);
    node.addEventListener('mouseleave', off);

    return function () {
      node.removeEventListener('mouseenter', on);
      node.removeEventListener('mousemove', on);
      node.removeEventListener('mouseleave', off);
    };
  }, []);

  return isHovering;
}

export { useHover };
