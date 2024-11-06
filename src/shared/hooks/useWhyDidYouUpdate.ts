import { useEffect, useRef } from 'react';

export type IProps = Record<string, any>;

/**
 * Hook to log all changes of props in console.
 *
 * @param componentName - name of component
 * @param props - props of component
 *
 * @example
 * import React from 'react';
 * import { useWhyDidYouUpdate } from 'hooks';
 *
 * const Demo: React.FC<{ count: number }> = (props) => {
 *     const [randomNum, setRandomNum] = useState(Math.random());
        useWhyDidYouUpdate('useWhyDidYouUpdateComponent', { ...props, randomNum });
 *   // ...
 * };
 */
export function useWhyDidYouUpdate(componentName: string, props: IProps) {
  const prevProps = useRef<IProps>({});

  useEffect(() => {
    if (prevProps.current) {
      const allKeys = Object.keys({ ...prevProps.current, ...props });
      const changedProps: IProps = {};

      allKeys.forEach((key) => {
        if (!Object.is(prevProps.current[key], props[key])) {
          changedProps[key] = {
            from: prevProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length) {
        console.log('[why-did-you-update]', componentName, changedProps);
      }
    }

    prevProps.current = props;
  });
}

