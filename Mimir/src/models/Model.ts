import type { Repository } from 'src/services/Repository.js';

type ModelClass<T extends Model> = Function & {
  prototype: T;
};

export abstract class Model {
  protected constructor(protected repo: Repository) {}

  // each model instance is associated with a context-aware repository, so we need
  // a weak map here to avoid messing repositories between different models
  private static readonly _modelRepo: WeakMap<Repository, Map<string, Model>> = new WeakMap();

  public getModel<T extends Model>(model: ModelClass<T>): T {
    if (!Model._modelRepo.get(this.repo)!.has(model.prototype.constructor.name)) {
      // @ts-expect-error Typescript doesn't recognize generic constructable class
      Model._modelRepo.get(this.repo)!.set(model.prototype.constructor.name, new model(this.repo));
    }
    return Model._modelRepo.get(this.repo)!.get(model.prototype.constructor.name) as T;
  }

  public static getModel<T extends Model>(repo: Repository, model: ModelClass<T>): T {
    if (!this._modelRepo.has(repo)) {
      this._modelRepo.set(repo, new Map());
    }
    if (!this._modelRepo.get(repo)!.has(model.prototype.constructor.name)) {
      // @ts-expect-error Typescript doesn't recognize generic constructable class
      this._modelRepo.get(repo)!.set(model.prototype.constructor.name, new model(repo));
    }
    return this._modelRepo.get(repo)!.get(model.prototype.constructor.name) as T;
  }
}
