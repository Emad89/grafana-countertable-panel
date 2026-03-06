import React from 'react';
import { SelectableValue, StandardEditorProps } from '@grafana/data';
import { TableCellDisplayMode, TableCellOptions, defaultTableFieldOptions } from '@grafana/schema';
import { Combobox } from '@grafana/ui';

const cellTypeOptions: Array<SelectableValue<TableCellDisplayMode>> = [
  { value: TableCellDisplayMode.Auto, label: 'Auto' },
  { value: TableCellDisplayMode.ColorText, label: 'Colored text' },
  { value: TableCellDisplayMode.ColorBackground, label: 'Colored background' },
  { value: TableCellDisplayMode.DataLinks, label: 'Data links' },
  { value: TableCellDisplayMode.Gauge, label: 'Gauge' },
  { value: TableCellDisplayMode.Sparkline, label: 'Sparkline' },
  { value: TableCellDisplayMode.JSONView, label: 'JSON View' },
  { value: TableCellDisplayMode.Pill, label: 'Pill' },
  { value: TableCellDisplayMode.Markdown, label: 'Markdown + HTML' },
  { value: TableCellDisplayMode.Image, label: 'Image' },
  { value: TableCellDisplayMode.Actions, label: 'Actions' },
];

export const TableCellTypeOptionEditor = ({ value, onChange }: StandardEditorProps<TableCellOptions>) => {
  const cellOptions = value ?? defaultTableFieldOptions.cellOptions;
  const selected = cellTypeOptions.find((option) => option.value === cellOptions.type) ?? cellTypeOptions[0];

  return (
    <Combobox
      options={cellTypeOptions}
      value={selected}
      isClearable={false}
      onChange={(selectedOption) =>
        onChange({
          ...cellOptions,
          type: selectedOption?.value ?? TableCellDisplayMode.Auto,
        })
      }
    />
  );
};
