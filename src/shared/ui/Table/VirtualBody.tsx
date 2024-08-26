import * as React from 'react';
import styled from 'styled-components';
import { refSetter } from '@admiral-ds/react-ui';

import { ScrollTableBody } from './style';

// TODO: вынести в константы
const DEFAULT_COLUMN_WIDTH = 200;

const Spacer = styled.div`
  display: flex;
  flex: 0 0 auto;
`;

// Изменен
interface VirtualBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  width: number;
  height: number;
  childHeight: number;
  renderAhead?: number;
  rowList: any[];
  columnList: any[];
  renderRow: (row: any, index: number, visibleColumns: any[]) => React.ReactNode;
}

export const VirtualBody = React.forwardRef<HTMLDivElement, VirtualBodyProps>(
  (
    { width, height, childHeight, renderAhead = 20, rowList, columnList, renderRow, ...props },
    ref,
  ) => {
    const [scrollTop, setScrollTop] = React.useState(0);
    const [scrollLeft, setScrollLeft] = React.useState(0);
    const scrollContainerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
      function handleScroll(e: any) {
        requestAnimationFrame(() => {
          setScrollTop(e.target.scrollTop);
          setScrollLeft(e.target.scrollLeft);
        });
      }

      const scrollContainer = scrollContainerRef.current;
      setScrollTop(scrollContainer?.scrollTop || 0);
      setScrollLeft(scrollContainer?.scrollLeft || 0);

      scrollContainer?.addEventListener('scroll', handleScroll);
      return () => scrollContainer?.removeEventListener('scroll', handleScroll);
    }, []);

    let startNode = Math.floor(scrollTop / childHeight) - renderAhead;
    startNode = Math.max(0, startNode);

    let startColumn = Math.floor(scrollLeft / DEFAULT_COLUMN_WIDTH) - renderAhead / 10;
    startColumn = Math.max(0, startColumn);

    let visibleColumnCount = Math.ceil(width / DEFAULT_COLUMN_WIDTH) + (2 * renderAhead) / 10;
    visibleColumnCount = Math.min(columnList.length - startColumn, visibleColumnCount);

    const itemCount = rowList.length;

    let visibleNodeCount = Math.ceil(height / childHeight) + 2 * renderAhead;
    visibleNodeCount = Math.min(itemCount - startNode, visibleNodeCount);

    const topPadding = `${startNode * childHeight}px`;
    const bottomPadding = `${(itemCount - startNode - visibleNodeCount) * childHeight}px`;
    const leftPadding = `${startColumn * DEFAULT_COLUMN_WIDTH}px`;
    const rightPadding = `${
      (columnList.length - startColumn - visibleColumnCount) * DEFAULT_COLUMN_WIDTH
    }px`;

    const visibleRows = React.useMemo(
      () => rowList.slice(startNode, startNode + visibleNodeCount),
      [rowList, startNode, visibleNodeCount],
    );

    const stickyColumns = React.useMemo(
      () => columnList.filter((column) => column.sticky),
      [columnList],
    );

    const visibleColumns = React.useMemo(() => {
      return Array.from(
        new Set(
          stickyColumns.concat(columnList.slice(startColumn, startColumn + visibleColumnCount)),
        ),
      );
    }, [columnList, startColumn, visibleColumnCount]);

    return (
      <ScrollTableBody
        style={{ height, minWidth: width }}
        ref={refSetter(ref, scrollContainerRef)}
        {...props}
      >
        <Spacer style={{ minHeight: topPadding }} />
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <Spacer style={{ minWidth: leftPadding }} />
          <div>
            {visibleRows.map((row, index) => renderRow(row, startNode + index, visibleColumns))}
          </div>
          <Spacer style={{ minWidth: rightPadding }} />
        </div>
        <Spacer style={{ minHeight: bottomPadding }} />
      </ScrollTableBody>
    );
  },
);
