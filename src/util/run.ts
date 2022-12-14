import { RunResponse } from 'src/app/api';

export function runStatus(run: RunResponse): string {
  // * if the run has a result then return the result
  // * if stopping return "stopping"
  // * return the phase
  if (run.result != 'unknown') return run.result;
  if (run.stopping) return 'stopping';
  if (run.phase != 'finished') return run.phase;

  return run.result;
}

export function runResultClass(run: RunResponse): string {
  const status = runStatus(run);

  if (status == 'setuperror') return 'setuperror';
  if (status == 'queued') return 'unknown';
  if (status == 'cancelled') return 'failed';
  if (status == 'running') return 'running';
  if (status == 'stopping') return 'failed';
  if (status == 'stopped') return 'failed';
  if (status == 'success') return 'success';
  if (status == 'failed') return 'failed';
  return 'unknown';
}
