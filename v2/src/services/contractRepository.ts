import { collection, getDocs } from 'firebase/firestore';

import type { ContractAuthority, ContractPlayer } from '../data/contractLedger';
import { firebaseRuntime, type FirebaseRuntime } from './firebaseClient';

export interface ContractRepository {
  loadContracts(): Promise<ContractPlayer[]>;
}

function optionalString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function contractFromDocument(id: string, value: Record<string, unknown>): ContractPlayer | null {
  const sleeperPlayerId = optionalString(value.sleeperPlayerId) ?? id.trim();
  const playerName = optionalString(value.playerName);
  if (!sleeperPlayerId || !playerName) return null;
  const rawYears = value.yearsRemaining;
  const yearsRemaining = typeof rawYears === 'number' && Number.isFinite(rawYears)
    ? rawYears
    : null;
  const authority: ContractAuthority = value.authority === 'manager-correction'
    ? 'manager-correction'
    : 'contracts-sheet';

  return {
    sleeperPlayerId,
    playerName,
    position: optionalString(value.position) ?? '—',
    nflTeam: optionalString(value.nflTeam) ?? 'FA',
    sheetFantasyTeam: '',
    yearsRemaining,
    tag: optionalString(value.tag),
    exemption: optionalString(value.exemption),
    notes: optionalString(value.notes) ?? '',
    authority,
  };
}

export function createFirebaseContractRepository(
  runtime: FirebaseRuntime | null = firebaseRuntime(),
): ContractRepository | null {
  if (!runtime) return null;

  return {
    async loadContracts() {
      const snapshot = await getDocs(collection(runtime.db, 'contracts'));
      return snapshot.docs
        .map((item) => contractFromDocument(item.id, item.data()))
        .filter((contract): contract is ContractPlayer => contract !== null);
    },
  };
}
