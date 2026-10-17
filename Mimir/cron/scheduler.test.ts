import { jest } from '@jest/globals';
import { ChildProcess, spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { JobScheduler } from './scheduler.js';

function createChild() {
  const child = new EventEmitter() as ChildProcess;
  child.kill = jest.fn<ChildProcess['kill']>().mockReturnValue(true);
  return child;
}

afterEach(() => jest.useRealTimers());

it('skips duplicate executions until the child closes, while allowing other job types', async () => {
  const children = [createChild(), createChild(), createChild()];
  const launch = jest
    .fn<(name: string) => ChildProcess>()
    .mockReturnValueOnce(children[0])
    .mockReturnValueOnce(children[1])
    .mockReturnValueOnce(children[2]);
  const scheduler = new JobScheduler(1000, 100, launch);
  const first = scheduler.run('achievements');
  await scheduler.run('achievements');
  const other = scheduler.run('playerStats');
  expect(launch).toHaveBeenCalledTimes(2);
  children[0].emit('exit', 0, null);
  await scheduler.run('achievements');
  expect(launch).toHaveBeenCalledTimes(2);
  children[0].emit('close', 0, null);
  children[1].emit('close', 0, null);
  await Promise.all([first, other]);
  const next = scheduler.run('achievements');
  expect(launch).toHaveBeenCalledTimes(3);
  children[2].emit('close', 0, null);
  await next;
});

it('escalates a deadline to SIGKILL and retains exclusion until termination', async () => {
  jest.useFakeTimers();
  const child = createChild();
  const launch = jest.fn<() => ChildProcess>().mockReturnValue(child);
  const scheduler = new JobScheduler(1000, 100, launch);
  const execution = scheduler.run('achievements');
  const rejected = expect(execution).rejects.toThrow('exceeded 1000ms');
  await jest.advanceTimersByTimeAsync(1000);
  expect(child.kill).toHaveBeenCalledWith('SIGTERM');
  await jest.advanceTimersByTimeAsync(100);
  expect(child.kill).toHaveBeenCalledWith('SIGKILL');
  await scheduler.run('achievements');
  expect(launch).toHaveBeenCalledTimes(1);
  child.emit('close', null, 'SIGKILL');
  await rejected;
  expect(jest.getTimerCount()).toBe(0);
});

it('reports spawn failures and permits a later attempt', async () => {
  const child = createChild();
  const scheduler = new JobScheduler(1000, 100, () => child);
  const execution = scheduler.run('metrics');
  const rejected = expect(execution).rejects.toThrow('Cannot spawn');
  child.emit('error', new Error('Cannot spawn'));
  child.emit('close', -2, null);
  await rejected;
  const next = scheduler.run('metrics');
  child.emit('close', 0, null);
  await next;
});

it('stops active children, waits for closure, and refuses new executions', async () => {
  const child = createChild();
  const launch = jest.fn<() => ChildProcess>().mockReturnValue(child);
  const scheduler = new JobScheduler(1000, 100, launch);
  const execution = scheduler.run('metrics');
  const rejected = expect(execution).rejects.toThrow('SIGTERM');
  const stopping = scheduler.stop();
  expect(child.kill).toHaveBeenCalledWith('SIGTERM');
  await scheduler.run('achievements');
  expect(launch).toHaveBeenCalledTimes(1);
  child.emit('close', null, 'SIGTERM');
  await Promise.all([rejected, stopping]);
});

it('reaps a real timed-out Node process before completing the execution', async () => {
  let child!: ChildProcess;
  const scheduler = new JobScheduler(100, 100, () => {
    child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)']);
    return child;
  });
  await expect(scheduler.run('metrics')).rejects.toThrow('exceeded 100ms');
  expect(child.signalCode).not.toBeNull();
});
