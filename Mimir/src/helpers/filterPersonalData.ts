import { PersonEx } from 'tsclients/proto/atoms.pb';

export function filterPersonalData(data: PersonEx[]): PersonEx[] {
  return data.map(filterPersonalDataSingle);
}

export function filterPersonalDataSingle(person?: PersonEx): PersonEx {
  return {
    ...(person ?? {
      id: 0,
      city: '',
      tenhouId: '',
      title: 'player',
      country: '',
      hasAvatar: false,
      lastUpdate: new Date().toISOString(),
      msNickname: '',
      msAccountId: 0,
      notifications: '',
    }),
    email: '',
    phone: '',
    telegramId: '',
  };
}
