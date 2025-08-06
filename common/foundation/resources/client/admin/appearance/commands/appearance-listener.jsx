import { useCallback, useEffect, useRef } from 'react';
import { removeThemeValue, setThemeValue } from '@ui/themes/utils/set-theme-value';
import { loadFonts } from '@ui/fonts/font-picker/load-fonts';
import { mergeBootstrapData, useBootstrapDataStore } from '@ui/bootstrap-data/bootstrap-data-store';
import deepMerge from 'deepmerge';
import { useAppearanceEditorMode } from '@common/admin/appearance/commands/use-appearance-editor-mode';
import { useThemeSelector } from '@ui/themes/theme-selector-context';
export function AppearanceListener() {
  const {
    isAppearanceEditorActive
  } = useAppearanceEditorMode();
  const alreadyFiredLoadedEvent = useRef(false);
  const currentData = useBootstrapDataStore(s => s.data);
  const {
    selectThemeTemporarily
  } = useThemeSelector();
  const handleCommand = useCallback(command => {
    switch (command.type) {
      case 'setValues':
        const newData = {};
        if (command.values.appearance?.themes) {
          newData.themes = command.values.appearance.themes;
        }
        if (command.values.settings) {
          newData.settings = deepMerge(currentData.settings, command.values.settings, {
            arrayMerge: (_, source) => source
          });
        }
        return mergeBootstrapData(newData);
      case 'setThemeFont':
        if (command.value) {
          setThemeValue('--be-font-family', command.value.family);
          loadFonts([command.value], {
            id: 'be-primary-font',
            forceAssetLoad: true
          });
        } else {
          removeThemeValue('--be-font-family');
        }
        return;
      case 'setThemeValue':
        return setThemeValue(command.name, command.value);
      case 'setActiveTheme':
        selectThemeTemporarily(command.themeId);
        return;
      case 'setCustomCode':
        return renderCustomCode(command.mode, command.value);
      default:
    }
  }, [currentData, selectThemeTemporarily]);
  useEffect(() => {
    const handleMessage = e => {
      if (isAppearanceEvent(e) && eventIsTrusted(e)) {
        handleCommand(e.data);
      }
    };
    window.addEventListener('message', handleMessage);
    if (isAppearanceEditorActive && !alreadyFiredLoadedEvent.current) {
      window.postMessage({
        source: 'be-appearance-preview',
        type: 'appLoaded'
      }, '*');
      alreadyFiredLoadedEvent.current = true;
    }
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleCommand, isAppearanceEditorActive]);
  return null;
}
function isAppearanceEvent(e) {
  return e.data?.source === 'be-appearance-editor';
}
function eventIsTrusted(e) {
  return new URL(e.origin).hostname === window.location.hostname;
}
function renderCustomCode(mode, value) {
  const parent = mode === 'html' ? document.body : document.head;
  const nodeType = mode === 'html' ? 'div' : 'style';
  let customNode = parent.querySelector('#be-custom-code');
  if (!value) {
    if (customNode) {
      customNode.remove();
    }
  } else {
    if (!customNode) {
      customNode = document.createElement(nodeType);
      customNode.id = 'be-custom-code';
      parent.appendChild(customNode);
    }
    customNode.innerHTML = value;
  }
}