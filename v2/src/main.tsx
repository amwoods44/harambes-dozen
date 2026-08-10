import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { createFirebaseContractRepository, type ContractRepository } from './services/contractRepository';
import { createSleeperRepository } from './services/leagueRepository';
import { createMemberSessionService } from './services/memberSession';
import { viewerSessionFromSearch } from './services/viewerSession';

const session = viewerSessionFromSearch(window.location.search, import.meta.env.DEV);
const memberSessionService = import.meta.env.DEV ? null : createMemberSessionService();
const contractRepository: ContractRepository | null = import.meta.env.DEV
  ? {
      async loadContracts() {
        const [{ default: contractCsv }, { parseContractLedger }] = await Promise.all([
          import('../../data/contracts.csv?raw'),
          import('./data/contractLedger'),
        ]);
        return parseContractLedger(contractCsv);
      },
    }
  : createFirebaseContractRepository();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
      initialSession={session}
      repository={createSleeperRepository()}
      memberSessionService={memberSessionService}
      contractRepository={contractRepository}
    />
  </StrictMode>,
);
