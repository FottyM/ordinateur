import type CustomMatchers from 'jest-extended';
import 'vitest';

declare module 'vitest' {
  type Assertion<T = any> = CustomMatchers<T>;
  type AsymmetricMatchersContaining<T = any> = CustomMatchers<T>;
  type ExpectStatic<T = any> = CustomMatchers<T>;
}
