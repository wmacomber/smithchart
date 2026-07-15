import { parseUrlState } from '../persistence/urlState';
import { Workspace } from './Workspace';
export function App() {
  const initial = parseUrlState(location.search);
  return <Workspace initialState={initial.state} urlWarnings={initial.warnings} />;
}
