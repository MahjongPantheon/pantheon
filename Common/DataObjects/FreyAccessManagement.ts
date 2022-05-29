function serialize(obj) {

}

export class Serializable {
  public serialize(): string {

    function serialize(anything: any): string {
      let data: Record<string, string> = {};
      for (let prop in anything) {
        if (this[prop] instanceof Serializable) {
          // @ts-ignore
          data[prop] = anything[prop].serialize();
        } else if (anything[prop] instanceof Array) {
          data[prop] = '[' + anything[prop].map(serialize).join(', ') + ']';
        } else if (anything[prop] instanceof Object) {
          data[prop] = serialize(anything[prop]);
        } else {
          data[prop] = anything[prop];
        }
      }

      
    }
    return JSON.stringify([this.key, this.value]);
  }
  public static deserialize(input: string) {
    let rule = new AccessRule();
    [rule.key, rule.value] = JSON.parse(input);
    return rule;
  }
}

export class AccessRule extends Serializable {
  public key: string;
  public value: boolean|number|string;
  public serialize(): string {
    return JSON.stringify([this.key, this.value]);
  }
  public static deserialize(input: string) {
    let rule = new AccessRule();
    [rule.key, rule.value] = JSON.parse(input);
    return rule;
  }
}

export class AccessRules {
  public rules: AccessRules[] = [];
  public serialize(): string {
    return JSON.stringify(this.rules);
  }
  public static deserialize(input: string) {
    let rules = new AccessRules();
    rules.rules = JSON.parse(input);
    return rules;
  }
}
