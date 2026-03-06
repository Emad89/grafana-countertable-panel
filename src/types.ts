import { TableSortByFieldState } from '@grafana/ui';
import { TableCellHeight } from '@grafana/schema';

export interface SimpleOptions {
  showCounter: boolean;
  counterHeader: string;
  counterPosition: 'left' | 'right';
  counterWidth: number;
  showHeader: boolean;
  showTypeIcons: boolean;
  sortBy: TableSortByFieldState[];
  frameIndex: number;
  frozenColumns: number;
  enablePagination: boolean;
  cellHeight: TableCellHeight;
  maxRowHeight?: number;
  disableKeyboardEvents: boolean;
}
