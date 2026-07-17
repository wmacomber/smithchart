import { parseUrlState } from '../persistence/urlState';
import { Workspace } from './Workspace';
export function App() {
  if (__E2E_TEST_HOOKS__ && new URLSearchParams(location.search).get('test-error') === 'render') {
    throw new Error('Intentional end-to-end error-boundary trigger.');
  }
  const initial = parseUrlState(location.search);
  return <Workspace initialState={initial.state} urlWarnings={initial.warnings} />;
}
