import React, { createContext, useContext } from 'react';
import { useCategories as useCategoriesHook } from '../hooks/useCategories';

const CategoriesContext = createContext(null);

export const CategoriesProvider = ({ children }) => {
  const categoriesData = useCategoriesHook();
  
  return (
    <CategoriesContext.Provider value={categoriesData}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};

