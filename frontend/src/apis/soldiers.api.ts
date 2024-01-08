import { fetcher } from '@/helpers/fetcherHelper';

export interface Soldier {
  id: string;
  first_name: string;
  last_name: string;
  personal_number: string;
  phone_number: string;
  capabilities: string[];
}

export async function getSoldiers(): Promise<Soldier[]> {
  const response = await fetcher.fetch('/soldiers');
  return response.soldiers;
}

export interface CreateSoldierParams {
  first_name: string;
  last_name: string;
  personal_number: string;
  phone_number: string;
  capabilities: string[];
}

export async function createSoldier(params: CreateSoldierParams): Promise<void> {
  await fetcher.fetch('/soldiers', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(params),
  });
}

export async function deleteSoldier(soldierId: string): Promise<void> {
  await fetcher.fetch(`/soldiers/${soldierId}`, {
    method: 'DELETE',
    headers: { 'content-type': 'application/json' },
  });
}
