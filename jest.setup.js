// Polyfills for the Jest environment
const { TextEncoder, TextDecoder } = require('util');
const { ReadableStream, WritableStream } = require('stream/web');
const { MessageChannel, MessagePort } = require('worker_threads');
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;
globalThis.ReadableStream = ReadableStream;
globalThis.WritableStream = WritableStream;
globalThis.MessageChannel = MessageChannel;
globalThis.MessagePort = MessagePort;

const { fetch: undiciFetch, Headers: UndiciHeaders, Request: UndiciRequest, Response: UndiciResponse } = require('undici');
require('@testing-library/jest-dom');

// Assign fetch primitives if missing
if (!globalThis.fetch) {
  globalThis.fetch = undiciFetch;
}

globalThis.Headers = UndiciHeaders;
globalThis.Request = UndiciRequest;
globalThis.Response = UndiciResponse;
// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Reset localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
