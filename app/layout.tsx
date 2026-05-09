import "./globals.css";
import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/lib/theme";
import { WallpaperProvider } from "@/lib/wallpaper";
import { SettingsRouterProvider } from "@/lib/settings-router";
import { ScreenStateProvider } from "@/lib/screen-state";
import { NotesStoreProvider } from "@/lib/notes-store";
import { SystemStateProvider } from "@/lib/system-state";
import { FilePreviewProvider } from "@/lib/file-preview";
import { RecentsProvider } from "@/lib/recents";
import { PlayerProvider } from "@/lib/player";
import { AppNavigationProvider } from "@/lib/app-navigation";

export const metadata: Metadata = {
  title: "kwasi asiedu-mensah",
  description: "kwasi asiedu-mensah's personal website",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      {/* Runs synchronously before paint — reads localStorage and applies the
          saved theme so there is no flash of light mode on dark-mode sessions. */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('macos-desktop-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else if(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <WallpaperProvider>
            <SettingsRouterProvider>
              <SystemStateProvider>
                <ScreenStateProvider>
                  <NotesStoreProvider>
                    <FilePreviewProvider>
                      <RecentsProvider>
                        <PlayerProvider>
                          <AppNavigationProvider>
                            {children}
                          </AppNavigationProvider>
                        </PlayerProvider>
                      </RecentsProvider>
                    </FilePreviewProvider>
                  </NotesStoreProvider>
                </ScreenStateProvider>
              </SystemStateProvider>
            </SettingsRouterProvider>
          </WallpaperProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
