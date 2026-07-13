import { describe, it, expect, vi, beforeEach } from "vitest";
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

  it("renders headers, filters, game screens, playbook, and timers", () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    // Header check
    expect(screen.getByText("Cupid's Roulette")).toBeInTheDocument();
    expect(screen.getByText("ORACLE OF CONNECTION")).toBeInTheDocument();

    // Filters check
    expect(screen.getByText("Spiciness Meter")).toBeInTheDocument();
    expect(screen.getByText("Pose Category")).toBeInTheDocument();

    // Side widgets
    expect(screen.getByText("Pose Playbook")).toBeInTheDocument();
    expect(screen.getByText("Scenario Dice Roller")).toBeInTheDocument();
    expect(screen.getByText("Intimacy Challenge Timer")).toBeInTheDocument();
  });

  it("can spin the roulette to select a pose", async () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    const spinButton = screen.getByRole("button", { name: /SPIN ROULETTE/ });
    expect(spinButton).toBeInTheDocument();

    // Click spin button
    fireEvent.click(spinButton);

    // Should show rolling text
    expect(screen.getByText("Shuffling Poses...")).toBeInTheDocument();

    // Fast-forward timers to let shuffle complete
    act(() => {
      vi.runAllTimers();
    });

    // Spinning should finish
    expect(screen.queryByText("Shuffling Poses...")).not.toBeInTheDocument();
  });

  it("can roll scenario dice", () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    const rollDiceButton = screen.getByRole("button", { name: /ROLL DICE/ });
    expect(rollDiceButton).toBeInTheDocument();

    fireEvent.click(rollDiceButton);

    // Fast-forward to finish dice roll animation
    act(() => {
      vi.runAllTimers();
    });

    // Ensure they display something from Locations / Moods
    expect(screen.getByText(/Where to perform/i)).toBeInTheDocument();
    expect(screen.getByText(/Special Condition/i)).toBeInTheDocument();
  });

  it("can run and control the intimacy timer", () => {
    render(
      <MemoryRouter>
        <Secret />
      </MemoryRouter>
    );

    // Remaining time default should be 3:00 (180 seconds)
    expect(screen.getByText("3:00")).toBeInTheDocument();

    // Click play/start button using ARIA label
    const playBtn = screen.getByLabelText("Start Timer");
    expect(playBtn).toBeInTheDocument();
    fireEvent.click(playBtn);

    // Let's tick the clock 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Time should decrement to 2:59
    expect(screen.getByText("2:59")).toBeInTheDocument();

    // Fast forward remaining 179 seconds to complete timer challenge
    act(() => {
      vi.advanceTimersByTime(179000);
    });

    // Should finish and show reward card
    expect(screen.getByText("Challenge Completed! 🎉")).toBeInTheDocument();

    // Can dismiss reward
    const dismissBtn = screen.getByRole("button", { name: "Dismiss" });
    fireEvent.click(dismissBtn);
    expect(screen.queryByText("Challenge Completed! 🎉")).not.toBeInTheDocument();
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

    fireEvent.change(select, { target: { value: "Cuddling" } });
    expect(select.value).toBe("Cuddling");

    // All displayed poses under Cuddling category should match
    // E.g. "Cozy Spooning"
    expect(screen.getByText("Cozy Spooning")).toBeInTheDocument();
  });
});
