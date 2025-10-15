// Jest setup file for test environment configuration
// Add custom matchers or global test utilities here

// Create global window object for Node environment
if (typeof window === 'undefined') {
  global.window = {};
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
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Make localStorage available as global
if (typeof global.localStorage === 'undefined') {
  global.localStorage = localStorageMock;
}

// Create crypto API mock for Node environment (only if not already available)
// Use Node's built-in crypto.webcrypto if available
let cryptoMock;
if (typeof window.crypto !== 'undefined') {
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
    // Fallback to simple mock
    cryptoMock = {
      getRandomValues: (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.floor(Math.random() * 4294967296); // 32-bit random value
        }
        return arr;
      },
      subtle: {
        digest: async (algorithm, data) => {
          // Simple mock that returns a buffer
          return new ArrayBuffer(32);
        },
      },
    };
  }
}

if (!window.crypto) {
  Object.defineProperty(window, 'crypto', {
    value: cryptoMock,
    writable: true,
  });
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
