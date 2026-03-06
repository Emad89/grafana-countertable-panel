import { FieldConfigEditorBuilder, FieldConfigProperty, identityOverrideProcessor, PanelPlugin, standardEditorsRegistry } from '@grafana/data';
import { t } from '@grafana/i18n';
import {
  defaultTableFieldOptions,
  defaultTableOptions,
  TableCellDisplayMode,
  TableCellOptions,
  TableCellHeight,
  TableCellTooltipPlacement,
  TableFieldOptions,
} from '@grafana/schema';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';
import { TableCellTypeOptionEditor } from './components/TableCellTypeOptionEditor';

const addTableCustomConfig = <T extends TableFieldOptions>(builder: FieldConfigEditorBuilder<T>) => {
  const category = [t('table.category-table', 'Table')];
  builder
    .addNumberInput({
      path: 'minWidth',
      name: t('table.name-min-column-width', 'Minimum column width'),
      category,
      description: t('table.description-min-column-width', 'The minimum width for column auto resizing'),
      settings: {
        placeholder: '150',
        min: 50,
        max: 500,
      },
      shouldApply: () => true,
      defaultValue: defaultTableFieldOptions.minWidth,
    })
    .addNumberInput({
      path: 'width',
      name: t('table.name-column-width', 'Column width'),
      category,
      settings: {
        placeholder: t('table.placeholder-column-width', 'auto'),
        min: 20,
      },
      shouldApply: () => true,
      defaultValue: defaultTableFieldOptions.width,
    })
    .addRadio({
      path: 'align',
      name: t('table.name-column-alignment', 'Column alignment'),
      category,
      settings: {
        options: [
          { label: t('table.column-alignment-options.label-auto', 'Auto'), value: 'auto' },
          { label: t('table.column-alignment-options.label-left', 'Left'), value: 'left' },
          { label: t('table.column-alignment-options.label-center', 'Center'), value: 'center' },
          { label: t('table.column-alignment-options.label-right', 'Right'), value: 'right' },
        ],
      },
      defaultValue: defaultTableFieldOptions.align,
    })
    .addBooleanSwitch({
      path: 'wrapText',
      name: t('table.name-wrap-text', 'Wrap text'),
      category,
    })
    .addBooleanSwitch({
      path: 'wrapHeaderText',
      name: t('table.name-wrap-header-text', 'Wrap header text'),
      category,
    })
    .addBooleanSwitch({
      path: 'filterable',
      name: t('table.name-column-filter', 'Column filter'),
      category,
      description: t('table.description-column-filter', 'Enables/disables field filters in table'),
      defaultValue: defaultTableFieldOptions.filterable,
    })
    .addBooleanSwitch({
      path: 'hideFrom.viz',
      name: t('table.name-hide-in-table', 'Hide in table'),
      category,
      defaultValue: undefined,
      hideFromDefaults: true,
    });
};

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel)
  .useFieldConfig({
    standardOptions: {
      [FieldConfigProperty.Actions]: {
        hideFromDefaults: false,
      },
    },
    useCustomConfig: (builder) => {
      addTableCustomConfig(builder as unknown as FieldConfigEditorBuilder<TableFieldOptions>);

      const cellCategory = [t('table.category-cell-options', 'Cell options')];
      const tableFooterCategory = [t('table.category-table-footer', 'Table footer')];

      builder.addCustomEditor({
        id: 'footer.reducers',
        category: tableFooterCategory,
        path: 'footer.reducers',
        name: t('table.name-calculation', 'Calculation'),
        description: t('table.description-calculation', 'Choose a reducer function / calculation'),
        editor: standardEditorsRegistry.get('stats-picker').editor,
        override: standardEditorsRegistry.get('stats-picker').editor,
        defaultValue: [],
        process: identityOverrideProcessor,
        shouldApply: () => true,
        settings: {
          allowMultiple: true,
        },
      });

      builder
        .addCustomEditor<void, TableCellOptions>({
          id: 'cellOptions',
          path: 'cellOptions',
          name: t('table.name-cell-type', 'Cell type'),
          editor: TableCellTypeOptionEditor,
          override: TableCellTypeOptionEditor,
          defaultValue: defaultTableFieldOptions.cellOptions,
          process: identityOverrideProcessor,
          category: cellCategory,
          shouldApply: () => true,
        })
        .addBooleanSwitch({
          path: 'inspect',
          name: t('table.name-cell-value-inspect', 'Cell value inspect'),
          description: t('table.description-cell-value-inspect', 'Enable cell value inspection in a modal window'),
          defaultValue: false,
          category: cellCategory,
          showIf: (cfg: any) => {
            return (
              cfg.cellOptions?.type === TableCellDisplayMode.Auto ||
              cfg.cellOptions?.type === TableCellDisplayMode.JSONView ||
              cfg.cellOptions?.type === TableCellDisplayMode.ColorText ||
              cfg.cellOptions?.type === TableCellDisplayMode.ColorBackground
            );
          },
        })
        .addFieldNamePicker({
          path: 'tooltip.field',
          name: t('table.name-tooltip-from-field', 'Tooltip from field'),
          description: t('table.description-tooltip-from-field', 'Render a cell from a field (hidden or visible) in a tooltip'),
          category: cellCategory,
        })
        .addSelect({
          path: 'tooltip.placement',
          name: t('table.name-tooltip-placement', 'Tooltip placement'),
          category: cellCategory,
          settings: {
            options: [
              { label: t('table.tooltip-placement-options.label-auto', 'Auto'), value: TableCellTooltipPlacement.Auto },
              { label: t('table.tooltip-placement-options.label-top', 'Top'), value: TableCellTooltipPlacement.Top },
              { label: t('table.tooltip-placement-options.label-right', 'Right'), value: TableCellTooltipPlacement.Right },
              { label: t('table.tooltip-placement-options.label-bottom', 'Bottom'), value: TableCellTooltipPlacement.Bottom },
              { label: t('table.tooltip-placement-options.label-left', 'Left'), value: TableCellTooltipPlacement.Left },
            ],
          },
          showIf: (cfg: any) => cfg.tooltip?.field !== undefined,
        })
        .addFieldNamePicker({
          path: 'styleField',
          name: t('table.name-styling-from-field', 'Styling from field'),
          description: t('table.description-styling-from-field', 'A field containing JSON objects with CSS properties'),
          category: cellCategory,
        });
    },
  })
  .setPanelOptions((builder) => {
    return builder
    .addBooleanSwitch({
      path: 'showHeader',
      name: 'Show header',
      defaultValue: defaultTableOptions.showHeader,
    })
    .addBooleanSwitch({
      path: 'showTypeIcons',
      name: 'Show type icons',
      defaultValue: defaultTableOptions.showTypeIcons,
    })
    .addBooleanSwitch({
      path: 'enablePagination',
      name: 'Enable pagination',
      defaultValue: defaultTableOptions.enablePagination,
    })
    .addNumberInput({
      path: 'frozenColumns.left',
      name: 'Frozen columns (left)',
      defaultValue: defaultTableOptions?.frozenColumns?.left,
      settings: {
        placeholder: 'none',
      },
    })
    .addRadio({
      path: 'cellHeight',
      name: 'Cell height',
      defaultValue: defaultTableOptions.cellHeight,
      settings: {
        options: [
          { value: TableCellHeight.Sm, label: 'Small' },
          { value: TableCellHeight.Md, label: 'Medium' },
          { value: TableCellHeight.Lg, label: 'Large' },
        ],
      },
    })
    .addNumberInput({
      path: 'maxRowHeight',
      name: 'Max row height',
      settings: {
        min: 0,
        max: 500,
        integer: true,
      },
    })
    .addBooleanSwitch({
      path: 'disableKeyboardEvents',
      name: 'Disable keyboard events',
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'showCounter',
      name: 'Show counter',
      defaultValue: true,
    })
    .addTextInput({
      path: 'counterHeader',
      name: 'Counter header',
      defaultValue: '#',
      showIf: (config) => config.showCounter,
    })
    .addRadio({
      path: 'counterPosition',
      defaultValue: 'left',
      name: 'Counter position',
      settings: {
        options: [
          {
            value: 'left',
            label: 'Left',
          },
          {
            value: 'right',
            label: 'Right',
          },
        ],
      },
      showIf: (config) => config.showCounter,
    })
    .addNumberInput({
      path: 'counterWidth',
      name: 'Counter width',
      defaultValue: 70,
      settings: {
        min: 40,
        max: 200,
        integer: true,
      },
      showIf: (config) => config.showCounter,
    });
});
