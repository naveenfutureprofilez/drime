import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import mergedAppearanceConfig from './config/merged-appearance-config';
let resolvePreviewAppIsLoaded = () => {};
export const previewAppIsLoaded = new Promise(resolve => resolvePreviewAppIsLoaded = resolve);
export const useAppearanceStore = create()(subscribeWithSelector((set, get) => ({
  defaults: null,
  iframeWindow: null,
  isDirty: false,
  setIsDirty: value => {
    set(() => ({
      isDirty: value
    }));
  },
  config: mergedAppearanceConfig,
  setDefaults: value => {
    set({
      defaults: {
        ...value
      }
    });
  },
  setIframeWindow: value => {
    set({
      iframeWindow: value
    });
    value.addEventListener('message', e => {
      if (e.data.source === 'be-appearance-preview' && e.data.type === 'appLoaded') {
        resolvePreviewAppIsLoaded();
      }
    });
  },
  preview: {
    setValues: values => {
      const preview = get().iframeWindow;
      postMessage(preview, {
        type: 'setValues',
        values
      });
    },
    setThemeFont: font => {
      const preview = get().iframeWindow;
      postMessage(preview, {
        type: 'setThemeFont',
        value: font
      });
    },
    setThemeValue: (name, value) => {
      const preview = get().iframeWindow;
      postMessage(preview, {
        type: 'setThemeValue',
        name,
        value
      });
    },
    setActiveTheme: themeId => {
      const preview = get().iframeWindow;
      postMessage(preview, {
        type: 'setActiveTheme',
        themeId
      });
    },
    setCustomCode: (mode, value) => {
      const preview = get().iframeWindow;
      postMessage(preview, {
        type: 'setCustomCode',
        mode,
        value
      });
    },
    setHighlight: selector => {
      let node = null;
      const document = get().iframeWindow?.document;
      if (document && selector) {
        node = document.querySelector(selector);
      }
      if (node) {
        requestAnimationFrame(() => {
          if (!node) return;
          node.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center'
          });
        });
      }
    }
  }
})));
function postMessage(window, command) {
  if (window) {
    window.postMessage({
      source: 'be-appearance-editor',
      ...command
    }, '*');
  }
}
export function appearanceState() {
  return useAppearanceStore.getState();
}