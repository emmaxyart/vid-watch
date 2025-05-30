export interface VideoFile {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: number;
  duration?: number;
  thumbnail?: string;
  addedAt: number;
  lastWatched?: number;
  watchProgress?: number;
  favorite: boolean;
}

export interface StorageStats {
  used: number;
  total: number;
  percentage: number;
}

export type SortOption = 'date-added' | 'name' | 'size' | 'last-watched';
export type FilterOption = 'all' | 'favorites' | 'unwatched' | 'in-progress';