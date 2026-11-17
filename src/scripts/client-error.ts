import { track } from '@/scripts/analytics';

const MAX_REPORTS = 5;
let reported = 0;

/** Sends the block and the error type only: messages and stacks can contain visitor data. */
export function reportClientError(block: string, error: unknown): void {
  if (reported >= MAX_REPORTS) return;
  reported += 1;
  track('client_error', { block, error_type: error instanceof Error ? error.name : 'Error' });
}

export function installGlobalErrorHandlers(): void {
  window.addEventListener('error', (event) => reportClientError('page', event.error));
  window.addEventListener('unhandledrejection', (event) => reportClientError('page', event.reason));
}
