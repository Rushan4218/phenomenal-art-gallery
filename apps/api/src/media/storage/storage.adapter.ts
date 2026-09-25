export interface StorageAdapter {
  upload(
    file: Buffer,
    options?: {
      folder?: string;
      filename?: string;
    },
  ): Promise<{
    url: string;
    key: string;
  }>;

  delete(key: string): Promise<void>;
}
