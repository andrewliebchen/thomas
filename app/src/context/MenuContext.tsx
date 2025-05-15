import React, { createContext, useContext, useState, useCallback } from 'react';
import { MenuOption } from '@/src/components/MenuSheet';

interface MenuContextType {
  isVisible: boolean;
  options: MenuOption[];
  showMenu: (options: MenuOption[]) => void;
  hideMenu: () => void;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [options, setOptions] = useState<MenuOption[]>([]);

  const showMenu = useCallback((newOptions: MenuOption[]) => {
    setOptions(newOptions);
    setIsVisible(true);
  }, []);

  const hideMenu = useCallback(() => {
    setIsVisible(false);
  }, []);

  return (
    <MenuContext.Provider value={{ isVisible, options, showMenu, hideMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}; 