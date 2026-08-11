import React, { createContext, useContext, useEffect, useRef } from 'react';
import { usePathname, useLocalSearchParams, useRouter } from 'expo-router';
import { BackHandler } from 'react-native';

export interface RouteEntry {
  pathname: string;
  params?: Record<string, any>;
}

interface NavigationHistoryContextType {
  goBack: (fallbackPath?: string) => void;
  canGoBack: boolean;
}

const NavigationHistoryContext = createContext<NavigationHistoryContextType>({
  goBack: () => {},
  canGoBack: false,
});

export function NavigationHistoryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams();

  // Stack of visited routes
  const historyRef = useRef<RouteEntry[]>([{ pathname: '/' }]);
  const isInternalNavigationRef = useRef<boolean>(false);

  useEffect(() => {
    if (isInternalNavigationRef.current) {
      isInternalNavigationRef.current = false;
      return;
    }

    const currentEntry = historyRef.current[historyRef.current.length - 1];
    
    const isSamePathname = currentEntry?.pathname === pathname;
    const isSameParams = JSON.stringify(currentEntry?.params || {}) === JSON.stringify(params || {});

    if (isSamePathname && isSameParams) {
      return;
    }

    // Push new entry onto stack
    historyRef.current.push({
      pathname,
      params: Object.keys(params).length > 0 ? { ...params } : undefined,
    });

    // Keep history stack length manageable
    if (historyRef.current.length > 30) {
      historyRef.current.shift();
    }
  }, [pathname, params]);

  const goBack = (fallbackPath: string = '/') => {
    if (historyRef.current.length > 1) {
      // Pop current screen
      historyRef.current.pop();
      const prevEntry = historyRef.current[historyRef.current.length - 1];
      isInternalNavigationRef.current = true;
      
      if (prevEntry) {
        if (prevEntry.params && Object.keys(prevEntry.params).length > 0) {
          router.navigate({
            pathname: prevEntry.pathname as any,
            params: prevEntry.params,
          });
        } else {
          router.navigate(prevEntry.pathname as any);
        }
        return;
      }
    }

    // Fallback if history is empty
    isInternalNavigationRef.current = true;
    router.navigate(fallbackPath as any);
  };

  // Android hardware back button handler
  useEffect(() => {
    const onBackPress = () => {
      const isDetailOrSubScreen =
        pathname === '/item-detail' ||
        pathname === '/outfit-detail' ||
        pathname === '/scan' ||
        pathname === '/chat';

      if (isDetailOrSubScreen || historyRef.current.length > 1) {
        goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [pathname]);

  return (
    <NavigationHistoryContext.Provider
      value={{
        goBack,
        canGoBack: historyRef.current.length > 1,
      }}
    >
      {children}
    </NavigationHistoryContext.Provider>
  );
}

export function useAppNavigation() {
  return useContext(NavigationHistoryContext);
}
