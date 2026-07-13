import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Secret from "./Secret";

// Mock global AudioContext since it's not implemented in jsdom
class MockAudioContext {
  state = "suspended";
  currentTime = 0;
  resume = vi.fn().mockResolvedValue(undefined);
  createOscillator = vi.fn().mockReturnValue({
    connect: vi.fn(),
    frequency: {
      setValueAtTime: vi.fn(),
    },
    start: vi.fn(),
    stop: vi.fn(),
  });
  createGain = vi.fn().mockReturnValue({
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
  });
  destination = {};
}

global.AudioContext = MockAudioContext as any;
(global as any).webkitAudioContext = MockAudioContext as any;

describe("Secret Intimacy Roulette Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders headers, filters, game screens, playbook, and dice roller in Bangla", () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    // Header check
    expect(screen.getAllByText(/কিউপিড রুলেট/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/ভঙ্গির দৈবচয়ন/i)).toBeInTheDocument();

    // Filters check
    expect(screen.getByText(/উষ্ণতার মাত্রা/i)).toBeInTheDocument();
    expect(screen.getByText(/আসন বা ভঙ্গির ধরণ/i)).toBeInTheDocument();

    // Side widgets
    expect(screen.getByText(/ভঙ্গি নির্দেশিকা/i)).toBeInTheDocument();
    expect(screen.getByText(/পরিস্থিতি ডাইস/i)).toBeInTheDocument();
  });

  it("can spin the roulette to select a pose", async () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    const spinButton = screen.getByRole("button", { name: /রুলেট ঘোরান/i });
    expect(spinButton).toBeInTheDocument();

    // Click spin button
    fireEvent.click(spinButton);

    // Should show rolling text in Bangla
    expect(screen.getByText("ভঙ্গি বাছাই করা হচ্ছে...")).toBeInTheDocument();

    // Fast-forward timers to let shuffle complete
    act(() => {
      vi.runAllTimers();
    });

    // Spinning should finish
    expect(screen.queryByText("ভঙ্গি বাছাই করা হচ্ছে...")).not.toBeInTheDocument();
  });

  it("can roll scenario dice", () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    const rollDiceButton = screen.getByRole("button", { name: /ডাইস রোল করুন/i });
    expect(rollDiceButton).toBeInTheDocument();

    fireEvent.click(rollDiceButton);

    // Fast-forward to finish dice roll animation
    act(() => {
      vi.runAllTimers();
    });

    // Ensure they display labels
    expect(screen.getByText(/📍 স্থান/i)).toBeInTheDocument();
    expect(screen.getByText(/🎲 বিশেষ শর্ত/i)).toBeInTheDocument();
  });

  it("can change category and spiciness filters", () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    // Select category dropdown
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    act(() => {
      fireEvent.change(select, { target: { value: "আরামদায়ক" } });
    });
    expect(select.value).toBe("আরামদায়ক");

    // Under fake timers, let's run all pending timers
    act(() => {
      vi.runAllTimers();
    });

    // All displayed poses under Comfortable category should match
    // E.g. "ফ্ল্যাট আয়রন (The Flat Iron)"
    const poseName = screen.getByText(/ফ্ল্যাট আয়রন/i);
    expect(poseName).toBeInTheDocument();
  });
});
