"use client";

import { createContext, useContext } from "react";

const DemoModeContext = createContext(false);

export const DemoModeProvider = ({
  enabled,
  children,
}: {
  enabled: boolean;
  children: React.ReactNode;
}) => (
  <DemoModeContext.Provider value={enabled}>
    {children}
  </DemoModeContext.Provider>
);

export const useDemoMode = () => useContext(DemoModeContext);
