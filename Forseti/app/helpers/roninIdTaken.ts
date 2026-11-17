export function isRoninIdTaken(err: unknown) {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === 'already_exists' &&
    'msg' in err &&
    err.msg === 'Ronin ID is already taken'
  );
}
