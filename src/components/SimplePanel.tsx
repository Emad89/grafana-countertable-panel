import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { css } from '@emotion/css';
import {
  cacheFieldDisplayNames,
  DashboardCursorSync,
  DataFrame,
  DisplayValue,
  Field,
  FieldType,
  FieldMatcherID,
  PanelProps,
  SelectableValue,
} from '@grafana/data';
import { config, PanelDataErrorView } from '@grafana/runtime';
import {
  Combobox,
  ComboboxOption,
  CustomCellRendererProps,
  TableCellDisplayMode,
  TableSortByFieldState,
  usePanelContext,
  useTheme2,
} from '@grafana/ui';
import { SimpleOptions } from 'types';

interface Props extends PanelProps<SimpleOptions> {
  initialRowIndex?: number;
}

const { TableNG } = require('@grafana/ui/unstable') as { TableNG: React.ComponentType<any> };

const CounterCell: React.FC<CustomCellRendererProps> = ({ rowIndex }) => {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const cell = ref.current;
    const row = cell?.closest('[role="row"]');
    if (!cell || !row) {
      return;
    }

    const updateVisibleIndex = () => {
      const dataRowIndex = row.getAttribute('data-rowidx');
      if (dataRowIndex != null) {
        const parsed = Number(dataRowIndex);
        if (!Number.isNaN(parsed)) {
          cell.textContent = String(parsed + 1);
          return;
        }
      }

      const ariaRowIndex = row.getAttribute('aria-rowindex');
      if (ariaRowIndex != null) {
        const parsed = Number(ariaRowIndex);
        if (!Number.isNaN(parsed)) {
          cell.textContent = String(Math.max(1, parsed - 1));
          return;
        }
      }

      cell.textContent = String(rowIndex + 1);
    };

    updateVisibleIndex();
    const observer = new MutationObserver(updateVisibleIndex);
    observer.observe(row, { attributes: true, attributeFilter: ['aria-rowindex', 'data-rowidx'] });
    return () => observer.disconnect();
  }, [rowIndex]);

  return <span ref={ref}>{rowIndex + 1}</span>;
};

const counterDisplay = (value: unknown): DisplayValue => {
  return {
    text: value == null ? '' : String(value),
    numeric: typeof value === 'number' ? value : Number.NaN,
  };
};

const addCounterColumn = (frame: DataFrame, options: SimpleOptions): DataFrame => {
  const baseFields = frame.fields.map((field) => {
    const customConfig = field.config.custom ?? {};
    if (customConfig.filterable !== undefined) {
      return field;
    }

    return {
      ...field,
      config: {
        ...field.config,
        custom: {
          ...customConfig,
          filterable: true,
        },
      },
    };
  });

  if (!options.showCounter) {
    return { ...frame, fields: baseFields };
  }

  const counterField: Field = {
    name: options.counterHeader.trim() || '#',
    type: FieldType.number,
    values: new Array(frame.length).fill(null),
    config: {
      filterable: false,
      custom: {
        align: 'right',
        width: options.counterWidth,
        minWidth: options.counterWidth,
        cellOptions: {
          type: TableCellDisplayMode.Custom,
          cellComponent: CounterCell,
        },
      },
    },
    display: counterDisplay,
  };

  const fields = options.counterPosition === 'right' ? [...baseFields, counterField] : [counterField, ...baseFields];
  return { ...frame, fields };
};

export function SimplePanel(props: Props) {
  const { data, height, width, options, fieldConfig, id, timeRange, replaceVariables, transparent, initialRowIndex } =
    props;

  useEffect(() => {
    cacheFieldDisplayNames(data.series);
  }, [data.series]);

  const theme = useTheme2();
  const panelContext = usePanelContext();
  const frames = data.series;
  const count = frames?.length;
  const hasFields = frames.some((frame) => frame.fields.length > 0);
  const currentIndex = getCurrentFrameIndex(frames, options);

  let tableHeight = height;

  if (!count || !hasFields) {
    return <PanelDataErrorView panelId={id} fieldConfig={fieldConfig} data={data} />;
  }

  const main = addCounterColumn(frames[currentIndex], options);

  if (count > 1) {
    const inputHeight = theme.spacing.gridSize * theme.components.height.md;
    const padding = theme.spacing.gridSize;
    tableHeight = height - inputHeight - padding;
  }

  const enableSharedCrosshair = panelContext.sync && panelContext.sync() !== DashboardCursorSync.Off;
  const disableCounterSortClass = options.showCounter
    ? css({
        [options.counterPosition === 'left'
          ? '[role="row"][aria-rowindex="1"] [role="columnheader"]:first-child button'
          : '[role="row"][aria-rowindex="1"] [role="columnheader"]:last-child button']: {
          pointerEvents: 'none',
        },
      })
    : undefined;

  const tableElement = (
    <div className={disableCounterSortClass}>
      <TableNG
        initialRowIndex={initialRowIndex}
        height={tableHeight}
        width={width}
        data={main}
        noHeader={!options.showHeader}
        showTypeIcons={options.showTypeIcons}
        resizable={true}
        initialSortBy={options.sortBy}
        onSortByChange={(sortBy: TableSortByFieldState[]) => onSortByChange(sortBy, props)}
        onColumnResize={(displayName: string, resizedWidth: number) => onColumnResize(displayName, resizedWidth, props)}
        onCellFilterAdded={panelContext.onAddAdHocFilter}
        frozenColumns={options.frozenColumns}
        enablePagination={options.enablePagination}
        cellHeight={options.cellHeight}
        maxRowHeight={options.maxRowHeight}
        timeRange={timeRange}
        enableSharedCrosshair={config.featureToggles.tableSharedCrosshair && enableSharedCrosshair}
        fieldConfig={fieldConfig}
        structureRev={data.structureRev}
        transparent={transparent}
        disableKeyboardEvents={options.disableKeyboardEvents}
        replaceVariables={replaceVariables}
      />
    </div>
  );

  if (count === 1) {
    return tableElement;
  }

  const names: Array<ComboboxOption<number>> = frames.map((frame, index) => {
    return {
      label: frame.name || `Frame ${index + 1}`,
      value: index,
    };
  });

  return (
    <div className={tableStyles.wrapper}>
      {tableElement}
      <div className={tableStyles.selectWrapper}>
        <Combobox
          options={names}
          value={names[currentIndex]}
          onChange={(val) => onChangeTableSelection(val, props)}
          isClearable={false}
        />
      </div>
    </div>
  );
}

function getCurrentFrameIndex(frames: DataFrame[], options: SimpleOptions) {
  return options.frameIndex > 0 && options.frameIndex < frames.length ? options.frameIndex : 0;
}

function onColumnResize(fieldDisplayName: string, width: number, props: Props) {
  const { fieldConfig } = props;
  const { overrides } = fieldConfig;

  const matcherId = FieldMatcherID.byName;
  const propId = 'custom.width';

  const override = overrides.find((o) => o.matcher.id === matcherId && o.matcher.options === fieldDisplayName);

  if (override) {
    const property = override.properties.find((prop) => prop.id === propId);
    if (property) {
      property.value = width;
    } else {
      override.properties.push({ id: propId, value: width });
    }
  } else {
    overrides.push({
      matcher: { id: matcherId, options: fieldDisplayName },
      properties: [{ id: propId, value: width }],
    });
  }

  props.onFieldConfigChange({
    ...fieldConfig,
    overrides,
  });
}

function onSortByChange(sortBy: TableSortByFieldState[], props: Props) {
  props.onOptionsChange({
    ...props.options,
    sortBy,
  });
}

function onChangeTableSelection(val: SelectableValue<number>, props: Props) {
  props.onOptionsChange({
    ...props.options,
    frameIndex: val.value || 0,
  });
}

const tableStyles = {
  wrapper: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  }),
  selectWrapper: css({
    padding: '8px 8px 0px 8px',
  }),
};
