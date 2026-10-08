import { SkirnirService } from './Skirnir.js';

export class SkirnirServiceMock extends SkirnirService {
  static sessionStartingSoonCalls: Array<{ playerIds: number[]; eventId: number }> = [];
  static callRefereeCalls: Array<{ eventId: number; tableIndex: number }> = [];

  override async messageSessionStartingSoon(playerIds: number[], eventId: number): Promise<void> {
    SkirnirServiceMock.sessionStartingSoonCalls.push({ playerIds: [...playerIds], eventId });
  }

  override async messageCallReferee(eventId: number, tableIndex: number): Promise<void> {
    SkirnirServiceMock.callRefereeCalls.push({ eventId, tableIndex });
  }

  protected override async _sendMessage(_telegramIds: string[], _message: string): Promise<void> {}
}
