import { workspaceReducer } from './workspaceReducer';
import type { WorkspaceAction, WorkspaceHistory } from './workspaceTypes';

const TRANSIENT = new Set<WorkspaceAction['type']>(['preview-load', 'cancel-preview']);

type HistoryAction = WorkspaceAction | { readonly type: 'undo' } | { readonly type: 'redo' };

export function historyReducer(history: WorkspaceHistory, action: HistoryAction): WorkspaceHistory {
  if (action.type === 'undo') {
    const previous = history.past.at(-1);
    if (!previous) return history;
    return {
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present, ...history.future],
    };
  }
  if (action.type === 'redo') {
    const next = history.future[0];
    if (!next) return history;
    return {
      past: [...history.past, history.present],
      present: next,
      future: history.future.slice(1),
    };
  }
  const next = workspaceReducer(history.present, action);
  if (next === history.present) return history;
  if (TRANSIENT.has(action.type)) return { ...history, present: next };
  const committedPresent = { ...history.present, previewLoad: null };
  return { past: [...history.past, committedPresent], present: next, future: [] };
}
