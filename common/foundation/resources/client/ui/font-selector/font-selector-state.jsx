import { useCallback, useEffect, useMemo, useState } from 'react';
import { useValueLists } from '@common/http/value-lists';
import { BrowserSafeFonts } from '@ui/fonts/font-picker/browser-safe-fonts';
import { chunkArray } from '@ui/utils/array/chunk-array';
import { loadFonts } from '@ui/fonts/font-picker/load-fonts';
import { useFilter } from '@ui/i18n/use-filter';
export function useFontSelectorState({
  value,
  onChange
}) {
  const {
    data,
    isLoading
  } = useValueLists(['googleFonts']);
  const [currentPage, setCurrentPage] = useState(0);
  const [filters, setFilterState] = useState({
    query: '',
    category: value?.category ?? ''
  });
  const {
    contains
  } = useFilter({
    sensitivity: 'base'
  });
  const allFonts = useMemo(() => {
    return BrowserSafeFonts.concat(data?.googleFonts ?? []);
  }, [data?.googleFonts]);
  const filteredFonts = useMemo(() => {
    return allFonts.filter(font => {
      return contains(font.family, filters.query) && (!filters.category || font.category?.toLowerCase() === filters.category.toLowerCase());
    });
  }, [allFonts, filters, contains]);
  const pages = useMemo(() => {
    return chunkArray(filteredFonts, 20);
  }, [filteredFonts]);
  const fonts = pages[currentPage];

  // open the page with the selected font
  useEffect(() => {
    if (data && value?.family) {
      const index = filteredFonts.findIndex(f => f.family === value.family);
      if (index >= 0) {
        setCurrentPage(Math.floor(index / 20));
      }
    }
  }, [data, filteredFonts, value?.family]);
  useEffect(() => {
    const id = 'font-selector';
    if (fonts?.length) {
      loadFonts(fonts, {
        id
      });
    }
  }, [fonts, currentPage]);
  const setFilters = useCallback(filters => {
    setFilterState(filters);
    // reset to first page when searching or changing category
    setCurrentPage(0);
  }, []);
  return {
    fonts: fonts || [],
    currentPage,
    filteredFonts: filteredFonts || [],
    setCurrentPage,
    isLoading,
    filters,
    setFilters,
    value,
    onChange,
    pages
  };
}