import { pendingRpc } from '../../../Common/pendingRpc';

describe('pending RPC submissions', () => {
  it('reuses the original key after an ambiguous failure and rotates after success', async () => {
    const generate = vi.fn().mockReturnValueOnce('first').mockReturnValueOnce('second');
    const send = vi.fn().mockRejectedValueOnce(new Error('Network lost')).mockResolvedValue('ok');
    await expect(pendingRpc('creation', {}, generate, send)).rejects.toThrow('Network lost');
    await expect(pendingRpc('creation', {}, generate, send)).resolves.toBe('ok');
    expect(send.mock.calls.map(([key]: [string]) => key)).toEqual(['first', 'first']);
    await pendingRpc('creation', {}, generate, send);
    expect(send).toHaveBeenLastCalledWith('second');
  });

  it('uses a persisted server token even if overview now supplies a newer token', async () => {
    const request = { chombo: { loserId: 10 } };
    sessionStorage.setItem(`pantheon:pending-rpc:round:${JSON.stringify(request)}`, 'original');
    const send = vi.fn().mockResolvedValue('ok');
    const generate = vi.fn(() => 'new-overview-token');
    await pendingRpc('round', request, generate, send);
    expect(send).toHaveBeenCalledWith('original');
    expect(generate).not.toHaveBeenCalled();
  });

  it('forgets a definitively rejected stale token so a refreshed submission can proceed', async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce({ code: 'failed_precondition' })
      .mockResolvedValue('ok');
    await expect(pendingRpc('stale', {}, () => 'old', send)).rejects.toEqual({
      code: 'failed_precondition',
    });
    await pendingRpc('stale', {}, () => 'fresh', send);
    expect(send).toHaveBeenLastCalledWith('fresh');
  });
});

it('retains a creation key across expired authentication after an ambiguous failure', async () => {
  const send = vi
    .fn()
    .mockRejectedValueOnce(new Error('Response lost'))
    .mockRejectedValueOnce({ code: 'unauthenticated' })
    .mockResolvedValue('ok');
  const generate = vi.fn(() => 'original-creation-key');
  await expect(pendingRpc('expired-auth', {}, generate, send)).rejects.toThrow('Response lost');
  await expect(pendingRpc('expired-auth', {}, generate, send)).rejects.toEqual({
    code: 'unauthenticated',
  });
  await pendingRpc('expired-auth', {}, generate, send);
  expect(generate).toHaveBeenCalledTimes(1);
  expect(send.mock.calls.map(([key]: [string]) => key)).toEqual([
    'original-creation-key',
    'original-creation-key',
    'original-creation-key',
  ]);
});
