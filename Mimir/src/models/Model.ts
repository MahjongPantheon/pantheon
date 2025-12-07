import type { Repository } from 'src/services/Repository.js';

type ModelClass<T extends Model> = Function & {
  prototype: T;
};

export abstract class Model {
  protected constructor(protected repo: Repository) {}

  private static readonly _modelRepo: Map<string, Model> = new Map();

  public getModel<T extends Model>(model: ModelClass<T>): T {
    if (!Model._modelRepo.has(model.constructor.name)) {
      // @ts-expect-error Typescript doesn't recognize generic constructable class
      Model._modelRepo.set(model.constructor.name, new model(this.repo));
    }
    return Model._modelRepo.get(model.constructor.name) as T;
  }

  public static getModel<T extends Model>(repo: Repository, model: ModelClass<T>): T {
    if (!this._modelRepo.has(model.constructor.name)) {
      // @ts-expect-error Typescript doesn't recognize generic constructable class
      this._modelRepo.set(model.constructor.name, new model(repo));
    }
    return this._modelRepo.get(model.constructor.name) as T;
  }
}
