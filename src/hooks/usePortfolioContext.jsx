import React, { createContext, useContext } from 'react';
import { usePortfolioData } from '../hooks/usePortfolioData';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const value = usePortfolioData();
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export const usePortfolio = () => useContext(PortfolioContext);
