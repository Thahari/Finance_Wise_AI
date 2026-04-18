import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock MatchMedia and scrollIntoView for jsdom compatibility
window.matchMedia = window.matchMedia || function() {
  return { matches: false, addListener: function() {}, removeListener: function() {} };
};
window.HTMLElement.prototype.scrollIntoView = function() {};

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Strict localStorage mock
const localStorageMock = (function() {
  let store = {};
  return {
    getItem(key) { return store[key] !== undefined ? store[key] : null; },
    setItem(key, value) { store[key] = String(value); },
    removeItem(key) { delete store[key]; },
    clear() { store = {}; }
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: false });

describe('Finance Wise App UI', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ─── Test 1: Smoke Test ────────────────────────────────────────────────────
  it('1. successfully loads the initial form without crashing', () => {
    render(<App />);
    expect(screen.getByText("What's your financial choice?")).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your first financial option/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Enter your second financial option/i)).toBeInTheDocument();
  });

  // ─── Test 2: Accessibility — Skip Link present ─────────────────────────────
  it('2. renders a skip-to-main-content accessibility link', () => {
    render(<App />);
    const skipLink = screen.getByText(/skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  // ─── Test 3: History DB write ──────────────────────────────────────────────
  it('3. writes "Option A vs Option B" to the history database on form submit', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Simulated AI Response" })
    });

    render(<App />);
    fireEvent.change(screen.getByLabelText(/Enter your first financial option/i), { target: { value: 'Buy a car' } });
    fireEvent.change(screen.getByLabelText(/Enter your second financial option/i), { target: { value: 'Invest the money' } });
    fireEvent.click(screen.getByRole('button', { name: /Compare financial options/i }));

    await waitFor(() => {
      const stored = window.localStorage.getItem('finance_wise_history');
      expect(stored).not.toBeNull();
      const parsed = JSON.parse(stored);
      expect(parsed.length).toBeGreaterThanOrEqual(1);
      expect(parsed[0].title).toBe('Buy a car vs Invest the money');
    });
  });

  // ─── Test 4: Mocked API response displayed ─────────────────────────────────
  it('4. mocks the API call and displays the AI response correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Here is your mocked AI advice." })
    });

    render(<App />);
    fireEvent.change(screen.getByLabelText(/Enter your first financial option/i), { target: { value: 'A' } });
    fireEvent.change(screen.getByLabelText(/Enter your second financial option/i), { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: /Compare financial options/i }));

    await waitFor(() => {
      expect(screen.getByText(/Here is your mocked AI advice./i)).toBeInTheDocument();
    });
  });

  // ─── Test 5: Input sanitization ───────────────────────────────────────────
  it('5. sanitizes HTML injection in option inputs before storing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: "Safe response" })
    });

    render(<App />);
    fireEvent.change(screen.getByLabelText(/Enter your first financial option/i), { target: { value: '<script>alert(1)</script>Pay debt' } });
    fireEvent.change(screen.getByLabelText(/Enter your second financial option/i), { target: { value: 'Invest savings' } });
    fireEvent.click(screen.getByRole('button', { name: /Compare financial options/i }));

    await waitFor(() => {
      const stored = window.localStorage.getItem('finance_wise_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Title must not contain raw <script> tags
        expect(parsed[0].title).not.toContain('<script>');
      }
    });
  });

  // ─── Test 6: API Settings UI renders and toggles ──────────────────────────
  it('6. API settings input appears on clicking API Settings button', () => {
    render(<App />);
    const settingsBtn = screen.getByRole('button', { name: /open api key settings/i });
    fireEvent.click(settingsBtn);
    expect(screen.getByPlaceholderText(/Grok/i)).toBeInTheDocument();
  });
});
