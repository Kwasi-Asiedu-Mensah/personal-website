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
  metadataBase: new URL("https://kwasiasiedumensah.com"),
  title: "kwasi asiedu-mensah",
  description:
    "A full macOS desktop in your browser — windows, dock, terminal, music, notes. The personal website of Kwasi Asiedu-Mensah.",
  openGraph: {
    title: "kwasi asiedu-mensah",
    description:
      "A full macOS desktop in your browser — windows, dock, terminal, music, notes.",
    url: "https://kwasiasiedumensah.com",
    siteName: "kwasi asiedu-mensah",
    images: [{ url: "/wallpapers/mojave.jpg", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "kwasi asiedu-mensah",
    description:
      "A full macOS desktop in your browser — windows, dock, terminal, music, notes.",
    images: ["/wallpapers/mojave.jpg"],
  },
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
            __html: `(function(){try{var t=localStorage.getItem('macos-desktop-theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else if(t==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}
try{var HAS=['snow-leopard','lion','mountain-lion','mavericks','yosemite','el-capitan','sierra','mojave','sonoma'];var w=localStorage.getItem('macos-desktop-wallpaper');if(w&&HAS.indexOf(w)>-1){var l=document.createElement('link');l.rel='preload';l.as='image';l.href='/wallpapers/'+w+'.jpg';document.head.appendChild(l);}}catch(e){}})();`,
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
