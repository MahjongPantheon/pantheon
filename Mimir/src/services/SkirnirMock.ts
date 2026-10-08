import { SkirnirService } from './Skirnir.js';

export class SkirnirServiceMock extends SkirnirService {
  static sessionStartingSoonCalls: Array<{ playerIds: number[]; eventId: number }> = [];

  override async messageSessionStartingSoon(playerIds: number[], eventId: number): Promise<void> {
    SkirnirServiceMock.sessionStartingSoonCalls.push({ playerIds: [...playerIds], eventId });
  }

  protected override async _sendMessage(_telegramIds: string[], _message: string): Promise<void> {}
}
