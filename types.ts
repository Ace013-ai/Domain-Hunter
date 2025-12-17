export enum Status {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface CompanyEntry {
  id: string;
  originalName: string;
  domain: string | null;
  sourceUrl: string | null;
  status: Status;
  errorMsg?: string;
}

export interface ProcessingStats {
  total: number;
  completed: number;
  failed: number;
  pending: number;
  inProgress: number;
}
