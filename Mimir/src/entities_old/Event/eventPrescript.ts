export function unpackScript(script: string): number[][][] {
  return script
    .replace(/\\r/g, '')
    .split('\n\n')
    .map((session) => {
      if (session.length === 0) {
        return null;
      }
      return session
        .trim()
        .split('\n')
        .map((line) => {
          return line.split('-').map((part) => parseInt(part, 10));
        });
    })
    .filter((session) => !!session);
}

export function packScript(script: number[][][]): string {
  return script.map((session) => session.map((line) => line.join('-')).join('\n')).join('\n\n');
}

export function checkForErrors(script: number[][][], localIdMap: Map<number, number>): string[] {
  const errors: string[] = [];

  script.forEach((session, sessionIdx) => {
    const map = new Map<number, boolean>();
    session.forEach((table, tableIdx) => {
      table.forEach((player, playerIdx) => {
        if (map.has(player)) {
          errors.push(
            `Duplicate local player #${player} (at session #${sessionIdx + 1}, at table #${tableIdx + 1}, position #${playerIdx + 1})`
          );
        }
        map.set(player, true);

        // Check for existence
        if (!localIdMap.has(player)) {
          errors.push(
            `Player doesn't exist: wrong local id #${player} (at session #${sessionIdx + 1}, at table #${tableIdx + 1}, position #${playerIdx + 1})`
          );
        }
      });
    });
  });

  if (script.length === 0) {
    errors.push('Event script is empty');
  }

  return errors;
}
