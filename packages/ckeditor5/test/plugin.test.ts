import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_MODEL_NAME, FormulaX, resolveOptions } from '../src';

describe('ckeditor5 adapter', () => {
  it('resolves the default model name', () => {
    expect(resolveOptions()).toMatchObject({
      name: DEFAULT_MODEL_NAME,
      buttonName: 'formulaX',
    });
  });

  it('allows a custom model name', () => {
    expect(resolveOptions({ name: 'inlineMath' }).name).toBe('inlineMath');
  });

  it('logs and aborts initialization when the model name already exists', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const register = vi.fn();
    const editor = {
      config: {
        get: vi.fn(() => ({ name: 'inlineMath' })),
      },
      model: {
        schema: {
          isRegistered: vi.fn(() => true),
          register,
        },
      },
    };
    const plugin = new FormulaX(editor as never);

    plugin.init();

    expect(error).toHaveBeenCalledOnce();
    expect(register).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
