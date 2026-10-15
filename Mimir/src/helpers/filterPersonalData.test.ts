import { filterPersonalData, filterPersonalDataSingle } from './filterPersonalData.js';
import { PersonEx } from 'tsclients/proto/atoms.pb.js';

describe('Public player data', () => {
  const person: PersonEx = {
    id: 12,
    title: 'Player',
    city: 'City',
    country: 'Country',
    tenhouId: 'tenhou-player',
    msNickname: 'majsoul-player',
    msAccountId: 34,
    hasAvatar: true,
    lastUpdate: '2026-01-01T00:00:00.000Z',
    email: 'private@example.com',
    phone: 'private-phone',
    telegramId: 'private-telegram',
    notifications: 'settings',
  };

  it('removes contact details without mutating the original player', () => {
    expect(filterPersonalDataSingle(person)).toEqual({
      ...person,
      email: '',
      phone: '',
      telegramId: '',
    });
    expect(person.email).toBe('private@example.com');
    expect(person.phone).toBe('private-phone');
    expect(person.telegramId).toBe('private-telegram');
  });

  it('filters every player and supports empty lists', () => {
    const filtered = filterPersonalData([person, { ...person, id: 13 }]);
    expect(filtered.map((p) => p.id)).toEqual([12, 13]);
    expect(filtered.every((p) => !p.email && !p.phone && !p.telegramId)).toBe(true);
    expect(filterPersonalData([])).toEqual([]);
  });

  it('provides a depersonalized placeholder for a missing player', () => {
    const before = Date.now();
    const result = filterPersonalDataSingle();
    expect(result).toMatchObject({
      id: 0,
      title: 'player',
      hasAvatar: false,
      msAccountId: 0,
      city: '',
      country: '',
      tenhouId: '',
      msNickname: '',
      notifications: '',
      email: '',
      phone: '',
      telegramId: '',
    });
    expect(Date.parse(result.lastUpdate)).toBeGreaterThanOrEqual(before);
    expect(Date.parse(result.lastUpdate)).toBeLessThanOrEqual(Date.now());
  });
});
