/**
 * Apple WWDC Fluid Interface Physics & Gesture Utilities
 * Distilled from Apple's "Designing Fluid Interfaces" (WWDC 2018) and Emil Kowalski's apple-design skill.
 *
 * Principles enforced:
 * 1. Parameterized by Damping Ratio (`damping`) and Response (`response` in seconds), not fixed duration.
 * 2. Always animates from the current presentation value and blends velocity on interruption (zero brick-wall).
 * 3. Exponential decay momentum projection (`project`) to land flicks where the gesture is headed.
 * 4. Progressive rubber-band resistance (`rubberBand`) at boundaries (`c = 0.55`).
 */

export interface SpringConfig {
  /** Damping ratio: 1.0 = critically damped (no overshoot), ~0.8 = under-damped (slight bounce for momentum). */
  damping: number;
  /** Response time in seconds: lower = snappier (0.3 - 0.45 typical for UI). */
  response: number;
}

export const APPLE_SPRINGS = {
  /** Default UI spring: critically damped, no bounce, graceful settle (damping 1.0, response 0.38s) */
  default: { damping: 1.0, response: 0.38 } satisfies SpringConfig,
  /** Snappy interactive control spring (damping 1.0, response 0.28s) */
  snappy: { damping: 1.0, response: 0.28 } satisfies SpringConfig,
  /** Momentum / flick spring: slight physical overshoot when preceded by user velocity (damping 0.82, response 0.38s) */
  momentum: { damping: 0.82, response: 0.38 } satisfies SpringConfig,
  /** Drawer / sheet / spatial inspector spring (damping 0.86, response 0.34s) */
  sheet: { damping: 0.86, response: 0.34 } satisfies SpringConfig,
  /** Gentle ambient parallax spring (damping 1.0, response 0.55s) */
  parallax: { damping: 1.0, response: 0.55 } satisfies SpringConfig,
} as const;

/**
 * Apple's exact momentum projection function from WWDC "Designing Fluid Interfaces":
 * Projects the resting position of a flick given initial velocity (px/s) and deceleration rate.
 */
export function projectMomentum(initialVelocity: number, decelerationRate = 0.998): number {
  return ((initialVelocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

/**
 * Apple's exact rubber-band formula for progressive boundary resistance:
 * `1 - (1 / ((x * c / d) + 1)) * d` where `c = 0.55`.
 */
export function rubberBand(distance: number, dimension: number, constant = 0.55): number {
  if (dimension <= 0 || distance === 0) return 0;
  const sign = distance < 0 ? -1 : 1;
  const abs = Math.abs(distance);
  return sign * (1 - 1 / ((abs * constant) / dimension + 1)) * dimension;
}

/**
 * Applies rubber-banding when `value` exceeds `[min, max]`.
 */
export function clampWithRubberBand(value: number, min: number, max: number, dimension: number, constant = 0.55): number {
  if (value < min) {
    return min - rubberBand(min - value, dimension, constant);
  }
  if (value > max) {
    return max + rubberBand(value - max, dimension, constant);
  }
  return value;
}

export interface VelocitySample {
  position: number;
  time: number;
}

/**
 * Tracks a short pointer history (last 80ms) to compute accurate release velocity in px/s.
 */
export class PointerVelocityTracker {
  private samples: VelocitySample[] = [];

  public record(position: number, time = performance.now()): void {
    this.samples.push({ position, time });
    const cutoff = time - 100;
    while (this.samples.length > 2 && this.samples[0].time < cutoff) {
      this.samples.shift();
    }
  }

  public getVelocity(now = performance.now()): number {
    if (this.samples.length < 2) return 0;
    const latest = this.samples[this.samples.length - 1];
    if (now - latest.time > 80) return 0;
    const first = this.samples[0];
    const dt = (latest.time - first.time) / 1000;
    if (dt <= 0.001) return 0;
    return (latest.position - first.position) / dt;
  }

  public reset(): void {
    this.samples = [];
  }
}

/**
 * Interruptible 1D harmonic oscillator spring controller.
 * Preserves live position and velocity across target changes so animations never jump or hit a velocity brick wall.
 */
export class InterruptibleSpring {
  private current: number;
  private target: number;
  private velocity = 0;
  private config: SpringConfig;
  private rafId: number | null = null;
  private lastTime = 0;
  private onUpdate: (value: number, velocity: number) => void;
  private onRest?: (value: number) => void;

  constructor(
    initialValue: number,
    onUpdate: (value: number, velocity: number) => void,
    config: SpringConfig = APPLE_SPRINGS.default,
    onRest?: (value: number) => void,
  ) {
    this.current = initialValue;
    this.target = initialValue;
    this.onUpdate = onUpdate;
    this.config = config;
    this.onRest = onRest;
  }

  public getValue(): number {
    return this.current;
  }

  public getVelocity(): number {
    return this.velocity;
  }

  /**
   * Immediately sets the presentation value (e.g. during 1:1 direct pointer manipulation).
   */
  public setImmediate(value: number, velocity = 0): void {
    this.stop();
    this.current = value;
    this.target = value;
    this.velocity = velocity;
    this.onUpdate(this.current, this.velocity);
  }

  /**
   * Animates from the current presentation value to `newTarget`, preserving existing velocity
   * or handing off a gesture release velocity (`initialVelocity` in units/sec).
   */
  public animateTo(newTarget: number, options?: { velocity?: number; config?: SpringConfig }): void {
    if (options?.config) {
      this.config = options.config;
    }
    if (options?.velocity !== undefined) {
      this.velocity = options.velocity;
    }
    this.target = newTarget;

    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.setImmediate(newTarget, 0);
      this.onRest?.(newTarget);
      return;
    }

    if (this.rafId === null) {
      this.lastTime = performance.now();
      this.rafId = window.requestAnimationFrame(this.tick);
    }
  }

  public stop(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private tick = (now: number): void => {
    // Cap delta time to 32ms to remain stable across background tab switches
    const dt = Math.min((now - this.lastTime) / 1000, 0.032);
    this.lastTime = now;

    if (dt > 0) {
      // Convert Apple's (damping, response) to physical stiffness (k) and damping coefficient (c)
      // stiffness = (2π / response)^2, dampingCoeff = 4π * damping / response (unit mass = 1)
      const omega = (2 * Math.PI) / Math.max(0.05, this.config.response);
      const stiffness = omega * omega;
      const dampingCoeff = 2 * this.config.damping * omega;

      // Semi-implicit Euler integration in 4 sub-steps for high precision
      const steps = 4;
      const subDt = dt / steps;
      for (let i = 0; i < steps; i++) {
        const displacement = this.current - this.target;
        const springForce = -stiffness * displacement;
        const dampingForce = -dampingCoeff * this.velocity;
        const acceleration = springForce + dampingForce;
        this.velocity += acceleration * subDt;
        this.current += this.velocity * subDt;
      }
    }

    const isSettled = Math.abs(this.current - this.target) < 0.0015 && Math.abs(this.velocity) < 0.015;
    if (isSettled) {
      this.current = this.target;
      this.velocity = 0;
      this.rafId = null;
      this.onUpdate(this.current, 0);
      this.onRest?.(this.current);
      return;
    }

    this.onUpdate(this.current, this.velocity);
    this.rafId = window.requestAnimationFrame(this.tick);
  };
}
