import { useCallback } from 'react';

type RefObject = {
  current: { offsetTop: number; scroll(options?: ScrollToOptions): void } | null;
};

type Options = {
  behavior?: 'smooth' | 'auto';
  minus?: number;
  plus?: number;
};
/**
 * Returns a callback function that scrolls the window to the top of the element
 * referenced by the provided ref, with optional offset and scrolling behavior.
 *
 * @param {RefObject | null} ref - The ref to the element to scroll to.
 * @param {RefObject | null} [containerRef] - The ref to the container element. If u want to scroll inside the overflowing element
 * @param {Options} [options] - Optional parameters for the scroll behavior.
 * @param {string} [options.behavior='smooth'] - The scrolling behavior.
 * @param {number} [options.minus] - The amount to subtract from the element's offset.
 * @param {number} [options.plus] - The amount to add to the element's offset.
 * @return {() => void} A callback function that scrolls the window to the element.
 * 
 * @example
 * const divRef = React.useRef<HTMLDivElement>(null);
const scrollTo = useScrollTo(divRef);

return (
  <div>
    <div onClick={scrollTo} style={{ height: '500px' }} />
    <div style={{ height: '500px' }} />
    <div style={{ height: '500px' }} />
    <div ref={divRef} />
  </div>
);
 */
export function useScrollTo(
  ref: RefObject | null,
  containerRef?: RefObject | null,
  options?: Options,
): () => void {
  return useCallback(() => {
    const refOffSetTop = ref?.current?.offsetTop || 0;
    const minus = options?.minus ? Math.abs(options.minus) : 0;
    const plus = options?.plus ? Math.abs(options.plus) : 0;
    const behavior = options?.behavior || 'smooth';
    if (containerRef?.current) {
      const refContainerOffSetTop = containerRef?.current?.offsetTop || 0;

      containerRef?.current?.scroll({ top: refOffSetTop, behavior });
    } else {
      window?.scroll({ top: refOffSetTop - minus + plus, behavior });
    }
  }, [ref, containerRef, options]);
}

