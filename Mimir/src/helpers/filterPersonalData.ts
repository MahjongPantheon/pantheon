import { PersonEx } from 'tsclients/proto/atoms.pb';

export function filterPersonalData(data: PersonEx[]): PersonEx[] {
  return data.map((person) => ({
    ...person,
    email: '',
    phone: '',
    telegramId: '',
  }));
}
