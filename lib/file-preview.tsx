"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { FileContent } from "./file-contents";

export type OpenedFile = {
  name: string;
  content: FileContent;
};

type FilePreviewContextValue = {
  openedFile: OpenedFile | null;
  setOpenedFile: (file: OpenedFile | null) => void;
};

const FilePreviewContext = createContext<FilePreviewContextValue>({
  openedFile: null,
  setOpenedFile: () => {},
});

export function FilePreviewProvider({ children }: { children: ReactNode }) {
  const [openedFile, setOpenedFileInternal] = useState<OpenedFile | null>(null);

  const setOpenedFile = useCallback((file: OpenedFile | null) => {
    setOpenedFileInternal(file);
  }, []);

  return (
    <FilePreviewContext.Provider value={{ openedFile, setOpenedFile }}>
      {children}
    </FilePreviewContext.Provider>
  );
}

export function useFilePreview() {
  return useContext(FilePreviewContext);
}
