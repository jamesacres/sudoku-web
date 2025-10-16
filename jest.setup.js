// Jest setup file for test environment configuration
// Add custom matchers or global test utilities here

// Import testing-library matchers
require('@testing-library/jest-dom');

// Create global window object for Node environment
if (typeof window === 'undefined') {
  global.window = {};
}

// Mock PointerEvent for Node environment
if (typeof window !== 'undefined' && typeof window.PointerEvent === 'undefined') {
  window.PointerEvent = class PointerEvent extends MouseEvent {
    constructor(type, options = {}) {
      super(type, options);
      this.pointerId = options.pointerId || 0;
      this.width = options.width || 0;
      this.height = options.height || 0;
      this.pressure = options.pressure || 0;
      this.tangentialPressure = options.tangentialPressure || 0;
      this.tiltX = options.tiltX || 0;
      this.tiltY = options.tiltY || 0;
      this.twist = options.twist || 0;
      this.pointerType = options.pointerType || 'mouse';
      this.isPrimary = options.isPrimary !== false;
    }
  };
  global.PointerEvent = window.PointerEvent;
}

// Mock TextEncoder/TextDecoder for Node environment
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Create localStorage mock for all tests with real storage functionality
const storageData = {};
const localStorageMock = {
  getItem: jest.fn((key) => {
    return storageData[key] || null;
  }),
  setItem: jest.fn((key, value) => {
    storageData[key] = String(value);
  }),
  removeItem: jest.fn((key) => {
    delete storageData[key];
  }),
  clear: jest.fn(() => {
    Object.keys(storageData).forEach(key => {
      delete storageData[key];
    });
  }),
  get length() {
    return Object.keys(storageData).length;
  },
  key: jest.fn((index) => {
    const keys = Object.keys(storageData);
    return keys[index] || null;
  }),
};

// Make Object.entries(localStorage) work by creating a Proxy
const localStorageProxy = new Proxy(localStorageMock, {
  get: (target, prop) => {
    if (typeof prop === 'string' && prop !== 'getItem' && prop !== 'setItem' &&
        prop !== 'removeItem' && prop !== 'clear' && prop !== 'key' && prop !== 'length') {
      return storageData[prop];
    }
    return target[prop];
  },
  ownKeys: () => Object.keys(storageData),
  getOwnPropertyDescriptor: (target, prop) => {
    if (prop in storageData || typeof target[prop] !== 'undefined') {
      return { configurable: true, enumerable: true, value: storageData[prop] || target[prop] };
    }
  },
});

Object.defineProperty(window, 'localStorage', {
  value: localStorageProxy,
  writable: true,
});

// Make localStorage available as global
if (typeof global.localStorage === 'undefined') {
  global.localStorage = localStorageProxy;
}

// Create crypto API mock for Node environment (only if not already available)
// Use Node's built-in crypto.webcrypto if available
let cryptoMock;
if (typeof window.crypto !== 'undefined' && window.crypto.subtle && window.crypto.subtle.digest) {
  cryptoMock = window.crypto;
} else {
  try {
    // Try to use Node's built-in crypto
    const nodeCrypto = require('crypto');
    if (nodeCrypto.webcrypto) {
      cryptoMock = nodeCrypto.webcrypto;
    } else {
      throw new Error('webcrypto not available');
    }
  } catch (e) {
    // Fallback - still try to use Node's crypto for digest operations
    try {
      const nodeCrypto = require('crypto');
      cryptoMock = {
        getRandomValues: (arr) => {
          const randomBytes = nodeCrypto.randomBytes(arr.byteLength || arr.length);
          const view = new Uint8Array(arr);
          for (let i = 0; i < randomBytes.length; i++) {
            view[i] = randomBytes[i];
          }
          return arr;
        },
        subtle: {
          digest: async (algorithm, data) => {
            const algo = algorithm.toLowerCase().replace('-', '');
            const hash = nodeCrypto.createHash(algo);
            // Convert input to Buffer if needed
            if (data instanceof ArrayBuffer) {
              hash.update(Buffer.from(data));
            } else if (data instanceof Uint8Array) {
              hash.update(Buffer.from(data));
            } else if (typeof data === 'string') {
              hash.update(data);
            } else {
              hash.update(Buffer.from(data));
            }
            // Return as ArrayBuffer
            return hash.digest().buffer.slice(hash.digest().byteOffset, hash.digest().byteOffset + hash.digest().byteLength);
          },
        },
      };
    } catch (innerE) {
      // Final fallback - basic mock
      cryptoMock = {
        getRandomValues: (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = Math.floor(Math.random() * 4294967296);
          }
          return arr;
        },
        subtle: {
          digest: async (algorithm, data) => {
            return new ArrayBuffer(32);
          },
        },
      };
    }
  }
}

if (!window.crypto || !window.crypto.subtle) {
  if (!window.crypto) {
    window.crypto = cryptoMock;
  } else {
    window.crypto.subtle = cryptoMock.subtle;
  }
}

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = function(...args) {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Invalid cellId format')
    ) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clean up theme classes after each test
afterEach(() => {
  // Remove all theme-* classes from document root
  if (typeof document !== 'undefined' && document.documentElement) {
    const classes = Array.from(document.documentElement.classList);
    classes.forEach(cls => {
      if (cls.startsWith('theme-')) {
        document.documentElement.classList.remove(cls);
      }
    });
  }
});
