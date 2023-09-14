import { defineConfig, install, shortcut } from '@twind/core';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetTailwind from '@twind/preset-tailwind';
import presetTailwindForms from '@twind/preset-tailwind-forms';
import * as colors from '@twind/preset-tailwind/colors';

const config = defineConfig({
  presets: [presetAutoprefix(), presetTailwind(), presetTailwindForms()],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '2rem',
      },
      fontFamily: {
        sans: [
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
      },
      borderWidth: {
        default: '1px',
        0: '0',
        2: '2px',
        4: '4px',
        5: '5px',
        6: '6px',
      },
      spacing: {},
      colors: {
        dark: '#4a4a4a',
        green: colors.emerald,
        yellow: colors.amber,
        purple: colors.violet,
        blue: colors.sky,
      },
    },
  },
  rules: [
    ['btn', 'font-bold py-2 px-4 rounded'],

    [
      'btn-blue',
      'bg-blue-500 text-white hover:(bg-blue-700) disabled:(bg-blue-500 opacity-50 cursor-not-allowed) focus:(bg-blue-500 outline-none ring)',
    ],

    [
      'btn-red',
      'bg-red-500 text-white hover:(bg-red-700) disabled:(bg-red-500 opacity-50 cursor-not-allowed) focus:(bg-red-500 outline-none ring)',
    ],
    [
      'btn-gray',
      'bg-gray-500 text-white hover:(bg-gray-700) disabled:(bg-gray-300 opacity-50 cursor-not-allowed) focus:(bg-gray-500 outline-none ring)',
    ],

    [
      'btn-gray',
      'bg-gray-500 text-white hover:(bg-gray-700) disabled:(bg-gray-300 opacity-50 cursor-not-allowed) focus:(bg-gray-500 outline-none ring)',
    ],

    ['tab', 'flex border-b-2'],

    ['tab-element', 'px-4 -m-[2px] border-b-2'],

    ['tab-element:hover', 'border-blue-300 text-blue-500'],

    ['tab-element-selected', 'border-b-2 border-blue-300 text-blue-500'],

    ['tab-element-disabled', 'px-4 -m-[2px] border-b-2'],

    ['panel', 'mb-2 border-solid border-gray-300 rounded border shadow'],

    [
      'panel-title',
      'bg-gray-200 px-4 py-3 border-solid border-gray-300 border-b text-xl font-bold',
    ],

    // shortcut required since it's an alias with a single class and it'll be interpreted as a static property rule
    ['success', shortcut('border-green-400')],

    ['is-success', 'bg-green-400 text-white'],

    ['failed', shortcut('border-red-500')],

    ['is-failed', 'bg-red-500 text-white'],

    ['running', shortcut('border-blue-500')],

    ['is-running', 'bg-blue-500 text-white'],

    ['skipped', shortcut('border-gray-800')],

    ['is-skipped', 'bg-gray-800 text-white'],

    ['unknown', shortcut('border-gray-300')],

    ['is-unknown', 'bg-gray-300 text-white'],

    ['setuperror', shortcut('border-yellow-500')],

    ['is-setuperror', 'bg-yellow-500 text-white'],
  ],
});

install(config);
