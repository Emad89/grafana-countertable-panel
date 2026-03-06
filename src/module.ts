import { PanelPlugin } from '@grafana/data';
import { TableCellHeight } from '@grafana/schema';
import { SimpleOptions } from './types';
import { SimplePanel } from './components/SimplePanel';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
  return builder
    .addBooleanSwitch({
      path: 'showHeader',
      name: 'Show header',
      defaultValue: true,
    })
    .addBooleanSwitch({
      path: 'showTypeIcons',
      name: 'Show type icons',
      defaultValue: false,
    })
    .addBooleanSwitch({
      path: 'enablePagination',
      name: 'Enable pagination',
      defaultValue: false,
    })
    .addNumberInput({
      path: 'frozenColumns',
      name: 'Frozen columns (left)',
      defaultValue: 0,
      settings: {
        min: 0,
        max: 10,
        integer: true,
      },
    })
    .addRadio({
      path: 'cellHeight',
      name: 'Cell height',
      defaultValue: TableCellHeight.Sm,
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
        min: 24,
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
