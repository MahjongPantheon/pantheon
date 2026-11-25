import { TransactionPropagation } from '@mikro-orm/core';
import { AddRefereeNotePayload, RefereeNotesResponse } from 'tsclients/proto/mimir.pb.js';
import { GenericSuccessResponse, Player } from 'tsclients/proto/atoms.pb.js';
import { EventEntity } from '../entities/Event.entity.js';
import { EventRegisteredPlayersEntity } from '../entities/EventRegisteredPlayers.entity.js';
import { RefereeNoteEntity } from '../entities/RefereeNote.entity.js';
import { Model } from './Model.js';
import { PlayerModel } from './PlayerModel.js';

export class RefereeNoteModel extends Model {
  private async requireEventAccess(eventId: number) {
    const players = this.getModel(PlayerModel);
    if (
      !this.repo.meta.personId ||
      !((await players.isEventAdmin(eventId)) || (await players.isEventReferee(eventId)))
    ) {
      throw new Error("You don't have the necessary permissions to access referee notes");
    }
    if (!(await this.repo.em.findOne(EventEntity, eventId))) {
      throw new Error('Event not found');
    }
  }

  async addRefereeNote(payload: AddRefereeNotePayload): Promise<GenericSuccessResponse> {
    return this.repo.em.transactional(
      async () => {
        await this.requireEventAccess(payload.eventId);
        const content = payload.content.trim();
        if (!content || content.length > 5000) {
          throw new Error('Referee notes must contain between 1 and 5000 characters');
        }
        const playerId = payload.playerId ?? undefined;
        if (playerId !== undefined) {
          if (!Number.isInteger(playerId) || playerId <= 0) {
            throw new Error('Player must be registered in this event');
          }
          const registration = await this.repo.em.findOne(EventRegisteredPlayersEntity, {
            event: payload.eventId,
            playerId,
          });
          if (!registration) {
            throw new Error('Player must be registered in this event');
          }
        }
        this.repo.em.persist(
          this.repo.em.create(RefereeNoteEntity, {
            event: this.repo.em.getReference(EventEntity, payload.eventId),
            authorId: this.repo.meta.personId!,
            createdAt: new Date().toISOString(),
            content,
            playerId,
          })
        );
        return { success: true };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }

  async listRefereeNotes(eventId: number): Promise<RefereeNotesResponse> {
    return this.repo.em.transactional(
      async () => {
        await this.requireEventAccess(eventId);
        const notes = await this.repo.em.findAll(RefereeNoteEntity, {
          where: { event: eventId },
          orderBy: { createdAt: 'DESC', id: 'DESC' },
        });
        const players = this.getModel(PlayerModel);
        const authorIds = [...new Set(notes.map((note) => note.authorId))];
        const playerIds = [
          ...new Set(notes.flatMap((note) => (note.playerId ? [note.playerId] : []))),
        ];
        const people = await players.findById([...new Set([...authorIds, ...playerIds])]);
        const displayPeople: Player[] = people.map((person) => ({
          id: person.id,
          title: person.title,
          tenhouId: person.tenhouId,
          roninId: person.roninId,
          hasAvatar: person.hasAvatar,
          lastUpdate: person.lastUpdate,
        }));
        return {
          notes: notes.map((note) => ({
            id: note.id,
            content: note.content,
            authorId: note.authorId,
            // PostgreSQL reads this UTC timestamp back without its original timezone marker.
            createdAt: new Date(
              note.createdAt.includes('T') ? note.createdAt : `${note.createdAt.replace(' ', 'T')}Z`
            ).toISOString(),
            playerId: note.playerId,
          })),
          authors: displayPeople.filter((person) => authorIds.includes(person.id)),
          players: displayPeople.filter((person) => playerIds.includes(person.id)),
        };
      },
      { propagation: TransactionPropagation.REQUIRED }
    );
  }
}
