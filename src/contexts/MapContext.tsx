"use client";

import { createContext, useContext, useRef, ReactNode } from 'react';

interface MapContextType {
  navigateToBuilding: (buildingId: number) => void;
  setNavigateToBuilding: (fn: (buildingId: number) => void) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const navigateToBuildingRef = useRef<((buildingId: number) => void) | null>(null);

  const navigateToBuilding = (buildingId: number) => {
    if (navigateToBuildingRef.current) {
      navigateToBuildingRef.current(buildingId);
    }
  };

  const setNavigateToBuilding = (fn: (buildingId: number) => void) => {
    navigateToBuildingRef.current = fn;
  };

  return (
    <MapContext.Provider value={{ navigateToBuilding, setNavigateToBuilding }}>
      {children}
    </MapContext.Provider>
  );
}

export function useMap() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMap must be used within a MapProvider');
  }
  return context;
}
