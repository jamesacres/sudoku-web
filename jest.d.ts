/// <reference types="jest" />
/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeVisible(): R;
      toBeEmptyDOMElement(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toBeValid(): R;
      toBeDisabled(): R;
      toBeEnabled(): R;
      toBePartiallyChecked(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toHaveClass(classname: string): R;
      toHaveFocus(): R;
      toHaveFormValues(values: Record<string, any>): R;
      toHaveStyle(css: string | Record<string, any>): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: string | number | string[]): R;
      toHaveDisplayValue(value: string | string[]): R;
      toBeChecked(): R;
      toHaveErrorMessage(message: string): R;
    }
  }
}
