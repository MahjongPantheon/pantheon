import { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import { NumberInput } from './NumberInput';

let container: HTMLDivElement;
let root: Root;
const changed = vi.fn();

function Fixture({ initial = 15000 }: { initial?: number }) {
  const [value, setValue] = useState<number | ''>(initial);
  return (
    <MantineProvider env='test'>
      <NumberInput
        value={value}
        onChange={(next) => {
          setValue(next);
          changed(next);
        }}
      />
    </MantineProvider>
  );
}

beforeEach(() => {
  changed.mockClear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function type(value: string) {
  const input = container.querySelector('input')!;
  act(() => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  return input;
}

it('keeps an unfinished minus sign editable and emits numeric negative uma values', () => {
  act(() => root.render(<Fixture />));
  expect(type('-').value).toBe('-');
  expect(changed).toHaveBeenLastCalledWith('');
  expect(type('-5000').value).toBe('-5000');
  expect(changed).toHaveBeenLastCalledWith(-5000);
  expect(type('').value).toBe('');
  expect(changed).toHaveBeenLastCalledWith('');
});

it('updates displayed values when a ruleset is loaded or the form is reset', () => {
  act(() =>
    root.render(
      <MantineProvider env='test'>
        <NumberInput value={100} />
      </MantineProvider>
    )
  );
  act(() =>
    root.render(
      <MantineProvider env='test'>
        <NumberInput value={30000} />
      </MantineProvider>
    )
  );
  expect(container.querySelector('input')!.value).toBe('30000');
});

it('keeps integer precision and numeric step controls', () => {
  act(() => root.render(<Fixture initial={0} />));
  const input = type('100');
  act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })));
  expect(changed).toHaveBeenLastCalledWith(101);
  type('101.5');
  expect(changed).toHaveBeenLastCalledWith(102);
  act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
  expect(input.value).toBe('102');
});

it('preserves minimum, maximum, and step behavior when editing and clearing', () => {
  act(() =>
    root.render(
      <MantineProvider env='test'>
        <NumberInput defaultValue={100} min={100} max={200} step={50} onChange={changed} />
      </MantineProvider>
    )
  );
  const input = type('250');
  act(() => input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })));
  expect(input.value).toBe('200');
  expect(changed).toHaveBeenLastCalledWith(200);
  type('');
  act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })));
  expect(changed).toHaveBeenLastCalledWith(100);
  act(() => input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true })));
  expect(changed).toHaveBeenLastCalledWith(150);
});
