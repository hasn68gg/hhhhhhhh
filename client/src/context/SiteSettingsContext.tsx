import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

export const SITE_SETTINGS_QUERY_KEY = ['site-settings'] as const;

function normalizeSettings(raw: Record<string, string | null | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = value == null ? '' : String(value);
  }
  if (out.logo && !out.siteLogo) out.siteLogo = out.logo;
  if (out.siteLogo && !out.logo) out.logo = out.siteLogo;
  return out;
}

interface SiteSettingsContextValue {
  siteName: string;
  siteLogo: string;
  settings: Record<string, string>;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: SITE_SETTINGS_QUERY_KEY,
    queryFn: () => api.get<{ settings: Record<string, string> }>('/settings'),
  });

  const settings = normalizeSettings(data?.settings ?? {});
  const siteName = settings.siteName || '';
  const siteLogo = settings.siteLogo || settings.logo || '';

  useEffect(() => {
    if (siteName) document.title = siteName;
  }, [siteName]);

  return (
    <SiteSettingsContext.Provider value={{ siteName, siteLogo, settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return ctx;
}
