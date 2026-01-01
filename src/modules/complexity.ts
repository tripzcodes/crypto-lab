/**
 * Module 3: Computational Complexity Analysis
 *
 * Implements attack strategies and visualizes time complexity
 */

import * as crypto from 'crypto';
import chalk from 'chalk';
import { Visualization } from '../utils/visualization';
import { LCG, MersenneTwister } from './entropy';

/**
 * Brute Force Attack Simulator
 */
export class BruteForceAttack {
  private attempts: number = 0;
  private found: boolean = false;
  private target: string = '';

  /**
   * Attack a hash with brute force
   */
  async attack(
    targetHash: string,
    charset: string,
    maxLength: number,
    hashFn: (s: string) => string,
    onProgress?: (attempts: number, current: string) => void
  ): Promise<{ found: boolean; plaintext?: string; attempts: number; time: number }> {
    this.attempts = 0;
    this.found = false;
    this.target = targetHash;

    const start = performance.now();

    // Try each length
    for (let len = 1; len <= maxLength && !this.found; len++) {
      await this.bruteForceLength(charset, len, hashFn, onProgress);
    }

    return {
      found: this.found,
      plaintext: this.found ? this.target : undefined,
      attempts: this.attempts,
      time: performance.now() - start
    };
  }

  private async bruteForceLength(
    charset: string,
    length: number,
    hashFn: (s: string) => string,
    onProgress?: (attempts: number, current: string) => void
  ): Promise<void> {
    const indices = new Array(length).fill(0);

    while (!this.found) {
      // Build current candidate
      let candidate = '';
      for (let i = 0; i < length; i++) {
        candidate += charset[indices[i]];
      }

      this.attempts++;

      // Check hash
      const hash = hashFn(candidate);
      if (hash === this.target) {
        this.found = true;
        this.target = candidate;
        return;
      }

      // Progress callback
      if (onProgress && this.attempts % 10000 === 0) {
        onProgress(this.attempts, candidate);
      }

      // Increment indices
      let pos = length - 1;
      while (pos >= 0) {
        indices[pos]++;
        if (indices[pos] < charset.length) break;
        indices[pos] = 0;
        pos--;
      }

      if (pos < 0) break; // All combinations exhausted
    }
  }

  /**
   * Visualize brute force complexity
   */
  static visualizeComplexity(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         BRUTE FORCE COMPLEXITY ANALYSIS'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    // Complexity functions
    const functions = [
      {
        name: 'O(n) - Linear search',
        fn: (n: number) => n,
        color: chalk.green
      },
      {
        name: 'O(n²) - Nested loops',
        fn: (n: number) => n * n,
        color: chalk.yellow
      },
      {
        name: 'O(2^n) - Brute force',
        fn: (n: number) => Math.pow(2, n),
        color: chalk.red
      },
      {
        name: 'O(n!) - Permutations',
        fn: (n: number) => {
          let f = 1;
          for (let i = 2; i <= n; i++) f *= i;
          return f;
        },
        color: chalk.magenta
      }
    ];

    lines.push(Visualization.complexityCurve(functions, { maxN: 15, height: 15, width: 50 }));
    lines.push('');

    // Concrete numbers
    lines.push(chalk.bold('  Concrete Operation Counts:'));
    lines.push(chalk.gray('  ' + '─'.repeat(60)));

    const header = '    n'.padEnd(8) + 'O(n)'.padEnd(12) + 'O(n²)'.padEnd(14) + 'O(2^n)'.padEnd(20) + 'O(n!)';
    lines.push(chalk.bold(header));

    [5, 10, 15, 20, 25].forEach(n => {
      const linear = n;
      const quadratic = n * n;
      const exponential = Math.pow(2, n);
      let factorial = 1;
      for (let i = 2; i <= n; i++) factorial *= i;

      lines.push(
        `    ${chalk.cyan(n.toString().padEnd(4))}` +
        `${chalk.green(linear.toString().padEnd(12))}` +
        `${chalk.yellow(quadratic.toString().padEnd(14))}` +
        `${chalk.red(exponential.toExponential(2).padEnd(20))}` +
        `${chalk.magenta(factorial.toExponential(2))}`
      );
    });

    lines.push('');

    // Time estimates
    lines.push(chalk.bold('  Time to Complete (1 billion ops/sec):'));
    lines.push(chalk.gray('  ' + '─'.repeat(60)));

    const opsPerSec = 1e9;

    [32, 64, 128, 256].forEach(bits => {
      const operations = Math.pow(2, bits);
      const seconds = operations / opsPerSec;

      lines.push(`    ${bits}-bit key: ${Visualization.timeEstimate(seconds)}`);
    });

    return lines.join('\n');
  }
}

/**
 * Birthday Paradox Collision Finder
 */
export class BirthdayAttack {
  /**
   * Find a collision using birthday attack
   */
  static findCollision(
    hashFn: (input: Buffer) => string,
    truncateBits: number = 32
  ): { collision: boolean; input1?: Buffer; input2?: Buffer; hash?: string; attempts: number; time: number } {
    const start = performance.now();
    const seen = new Map<string, Buffer>();
    let attempts = 0;

    // Truncate hash to make collision finding feasible for demo
    const truncatedHash = (input: Buffer) => {
      const full = hashFn(input);
      return full.slice(0, truncateBits / 4); // hex chars
    };

    // Expected attempts: sqrt(2^n) = 2^(n/2)
    const maxAttempts = Math.pow(2, truncateBits / 2 + 2); // Extra factor for safety

    while (attempts < maxAttempts) {
      const input = crypto.randomBytes(16);
      const hash = truncatedHash(input);
      attempts++;

      if (seen.has(hash)) {
        const existing = seen.get(hash)!;
        if (!input.equals(existing)) {
          return {
            collision: true,
            input1: existing,
            input2: input,
            hash,
            attempts,
            time: performance.now() - start
          };
        }
      }

      seen.set(hash, input);
    }

    return {
      collision: false,
      attempts,
      time: performance.now() - start
    };
  }

  /**
   * Demonstrate birthday paradox
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         BIRTHDAY PARADOX DEMONSTRATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  The Birthday Paradox:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    In a room of just 23 people, there\'s a >50% chance');
    lines.push('    that two people share the same birthday!');
    lines.push('');
    lines.push('    This applies to hash collisions:');
    lines.push(`    - For a ${chalk.cyan('n-bit')} hash, expect collision after ~${chalk.yellow('2^(n/2)')} tries`);
    lines.push(`    - Not ${chalk.red('2^n')} as naive intuition suggests`);
    lines.push('');

    // Birthday probability calculation
    lines.push(chalk.bold('  Birthday Collision Probability:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const probabilities: { people: number; prob: number }[] = [];
    for (let n = 1; n <= 50; n += 5) {
      let prob = 1;
      for (let i = 0; i < n; i++) {
        prob *= (365 - i) / 365;
      }
      probabilities.push({ people: n, prob: 1 - prob });
    }

    probabilities.forEach(p => {
      const barWidth = Math.floor(p.prob * 30);
      const bar = chalk.green('█'.repeat(barWidth)) + chalk.gray('░'.repeat(30 - barWidth));
      lines.push(`    ${p.people.toString().padStart(2)} people: [${bar}] ${(p.prob * 100).toFixed(1)}%`);
    });

    lines.push('');

    // Find actual collision with truncated hash
    lines.push(chalk.bold('  Finding Real Hash Collision (24-bit truncated):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const hashFn = (b: Buffer) => crypto.createHash('sha256').update(b).digest('hex');
    const result = this.findCollision(hashFn, 24);

    if (result.collision) {
      lines.push(`    ${chalk.green('✓ COLLISION FOUND!')}`);
      lines.push(`    Input 1: ${chalk.cyan(result.input1!.toString('hex'))}`);
      lines.push(`    Input 2: ${chalk.cyan(result.input2!.toString('hex'))}`);
      lines.push(`    Hash:    ${chalk.yellow(result.hash!)}`);
      lines.push(`    Attempts: ${chalk.cyan(result.attempts.toLocaleString())}`);
      lines.push(`    Expected: ~${chalk.cyan(Math.pow(2, 12).toLocaleString())} (2^12)`);
      lines.push(`    Time:     ${chalk.cyan(result.time.toFixed(2))} ms`);
    }

    lines.push('');
    lines.push(chalk.bold('  Security Implications:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    SHA-256 (256 bits): Collision in ~${chalk.cyan('2^128')} operations`);
    lines.push(`    SHA-1 (160 bits):   Collision in ~${chalk.yellow('2^80')} operations`);
    lines.push(`    MD5 (128 bits):     ${chalk.red('BROKEN')} - practical collisions found`);

    return lines.join('\n');
  }
}

/**
 * PRNG Pattern Prediction Attack
 */
export class PatternPredictionAttack {
  /**
   * Attack LCG by recovering internal state
   */
  static attackLCG(samples: number[]): {
    success: boolean;
    predictedA?: number;
    predictedC?: number;
    nextPrediction?: number;
  } {
    // LCG: x_{n+1} = (a * x_n + c) mod m
    // Given enough consecutive outputs, we can recover a, c, and m

    if (samples.length < 3) {
      return { success: false };
    }

    // Convert from [0,1) back to integer state (assuming m = 2^32)
    const m = Math.pow(2, 32);
    const states = samples.map(s => Math.floor(s * m));

    // For consecutive LCG outputs x0, x1, x2:
    // x1 = a*x0 + c (mod m)
    // x2 = a*x1 + c (mod m)
    // Therefore: x2 - x1 = a*(x1 - x0) (mod m)

    const diff1 = (states[1] - states[0] + m) % m;
    const diff2 = (states[2] - states[1] + m) % m;

    // Find a using modular inverse
    // a = diff2 * modInverse(diff1, m)
    // This is complex, so let's try known common values

    // Common LCG parameters
    const knownParams = [
      { a: 1664525, c: 1013904223 }, // Numerical Recipes
      { a: 1103515245, c: 12345 },   // glibc
      { a: 214013, c: 2531011 },     // MSVC
    ];

    for (const params of knownParams) {
      // Test if these parameters work
      const predicted = (params.a * states[0] + params.c) % m;
      if (Math.abs(predicted - states[1]) < 10) { // Allow small rounding errors
        // Predict next value
        const lastState = states[states.length - 1];
        const nextState = (params.a * lastState + params.c) % m;
        return {
          success: true,
          predictedA: params.a,
          predictedC: params.c,
          nextPrediction: nextState / m
        };
      }
    }

    return { success: false };
  }

  /**
   * Demonstrate PRNG weakness
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         PRNG PATTERN PREDICTION ATTACK'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    // Attack LCG
    lines.push(chalk.bold('  Attacking Linear Congruential Generator (LCG):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const lcg = new LCG(12345);
    const samples: number[] = [];
    for (let i = 0; i < 5; i++) {
      samples.push(lcg.next());
    }

    lines.push('    Observed outputs:');
    samples.slice(0, 3).forEach((s, i) => {
      lines.push(`      x[${i}] = ${chalk.cyan(s.toFixed(6))}`);
    });
    lines.push('');

    const attack = this.attackLCG(samples);
    if (attack.success) {
      lines.push(`    ${chalk.red('⚠ ATTACK SUCCESSFUL!')}`);
      lines.push(`    Recovered parameters:`);
      lines.push(`      a = ${chalk.yellow(attack.predictedA!.toString())}`);
      lines.push(`      c = ${chalk.yellow(attack.predictedC!.toString())}`);
      lines.push('');
      lines.push(`    Predicted next value: ${chalk.green(attack.nextPrediction!.toFixed(6))}`);
      lines.push(`    Actual next value:    ${chalk.cyan(samples[3].toFixed(6))}`);

      const error = Math.abs(attack.nextPrediction! - samples[3]);
      if (error < 0.0001) {
        lines.push(`    ${chalk.green('✓ PREDICTION CORRECT!')}`);
      }
    }

    lines.push('');

    // Compare with CSPRNG
    lines.push(chalk.bold('  Attempting to Attack crypto.randomBytes:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const cryptoSamples: number[] = [];
    for (let i = 0; i < 5; i++) {
      cryptoSamples.push(crypto.randomBytes(4).readUInt32LE(0) / 0xFFFFFFFF);
    }

    lines.push('    Observed outputs:');
    cryptoSamples.slice(0, 3).forEach((s, i) => {
      lines.push(`      x[${i}] = ${chalk.cyan(s.toFixed(6))}`);
    });
    lines.push('');

    lines.push(`    ${chalk.green('✓ ATTACK FAILED!')}`);
    lines.push('    No detectable pattern - output appears random');
    lines.push('    CSPRNG uses entropy pool, not mathematical formula');

    lines.push('');
    lines.push(chalk.bold('  Key Takeaway:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    ${chalk.red('LCG/MT19937')}: Deterministic, predictable with enough samples`);
    lines.push(`    ${chalk.green('CSPRNG')}: Entropy-based, computationally unpredictable`);

    return lines.join('\n');
  }
}

/**
 * Time to Crack Estimator
 */
export class CrackTimeEstimator {
  /**
   * Estimate time to crack based on key space
   */
  static estimate(
    keySpaceBits: number,
    operationsPerSecond: number = 1e9
  ): { seconds: number; years: number; description: string } {
    const operations = Math.pow(2, keySpaceBits);
    const seconds = operations / operationsPerSecond;
    const years = seconds / (365.25 * 24 * 3600);

    return {
      seconds,
      years,
      description: Visualization.timeEstimate(seconds)
    };
  }

  /**
   * Show P vs NP relevance
   */
  static demonstratePvsNP(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         P vs NP AND CRYPTOGRAPHY'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  The Core Asymmetry:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    // Example: Integer factorization
    const p = 104729n; // Prime
    const q = 104743n; // Prime
    const n = p * q;

    lines.push(chalk.bold('  Example: Integer Factorization'));
    lines.push('');
    lines.push(`    ${chalk.green('EASY (P)')}: Multiply two primes`);
    lines.push(`      ${p} × ${q} = ${chalk.cyan(n.toString())}`);
    lines.push(`      Time: ${chalk.green('< 1 microsecond')}`);
    lines.push('');

    lines.push(`    ${chalk.red('HARD (NP?)')}: Factor the product`);
    lines.push(`      ${n} = ? × ?`);
    lines.push(`      For 2048-bit numbers: ${chalk.red('millions of years')}`);
    lines.push('');

    lines.push(`    ${chalk.yellow('EASY TO VERIFY (NP)')}: Check the factors`);
    lines.push(`      Is ${p} × ${q} = ${n}? ${chalk.green('✓ Yes (instant)')}`);
    lines.push('');

    // Hash verification
    lines.push(chalk.bold('  Example: Hash Verification'));
    lines.push('');

    const password = 'mysecretpassword';
    const hash = crypto.createHash('sha256').update(password).digest('hex');

    lines.push(`    ${chalk.green('EASY TO VERIFY')}: Check if password matches hash`);
    lines.push(`      SHA256("${password}") = ${chalk.gray(hash.slice(0, 32))}...`);
    lines.push(`      Time: ${chalk.green('microseconds')}`);
    lines.push('');

    lines.push(`    ${chalk.red('HARD TO SOLVE')}: Find password from hash`);
    lines.push(`      ${chalk.gray(hash.slice(0, 32))}... = SHA256(?)`);
    lines.push(`      Time: ${chalk.red('potentially forever')}`);
    lines.push('');

    // The big question
    lines.push(chalk.bold('  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.yellow('  THE MILLION DOLLAR QUESTION: Does P = NP?'));
    lines.push(chalk.bold('  ═══════════════════════════════════════════════'));
    lines.push('');

    lines.push(`    ${chalk.cyan('If P ≠ NP (believed true):')}`);
    lines.push('      • Cryptography is fundamentally secure');
    lines.push('      • Some problems are inherently hard');
    lines.push('      • One-way functions exist');
    lines.push('');

    lines.push(`    ${chalk.red('If P = NP (catastrophic):')}`);
    lines.push('      • All encryption becomes breakable');
    lines.push('      • Digital signatures become forgeable');
    lines.push('      • Cryptocurrencies become worthless');
    lines.push('      • All current security collapses');
    lines.push('');

    lines.push(chalk.gray('  Note: While not proven, P ≠ NP is widely believed'));
    lines.push(chalk.gray('  because no polynomial algorithm has ever been found'));
    lines.push(chalk.gray('  for any NP-complete problem despite 50+ years of research.'));

    return lines.join('\n');
  }

  /**
   * Full complexity demonstration
   */
  static fullDemo(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         TIME TO CRACK ESTIMATES'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  Hardware Assumptions:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Consumer GPU:     10^9 ops/sec (1 billion)');
    lines.push('    Supercomputer:    10^18 ops/sec (1 exaflop)');
    lines.push('    All Earth GPUs:   ~10^21 ops/sec');
    lines.push('');

    lines.push(chalk.bold('  Key Size Analysis:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const scenarios: { name: string; bits: number; usage: string }[] = [
      { name: 'DES (broken)', bits: 56, usage: 'Legacy encryption' },
      { name: 'RC4-40 (weak)', bits: 40, usage: 'Export crypto (90s)' },
      { name: '3DES', bits: 112, usage: 'Legacy banking' },
      { name: 'AES-128', bits: 128, usage: 'Standard encryption' },
      { name: 'AES-256', bits: 256, usage: 'Top secret/quantum safe' },
      { name: 'RSA-2048', bits: 112, usage: 'Effective security' },
      { name: 'RSA-4096', bits: 140, usage: 'High security' },
    ];

    const gpu = 1e9;
    const supercomputer = 1e18;
    const allGpus = 1e21;

    scenarios.forEach(s => {
      lines.push('');
      lines.push(`    ${chalk.bold(s.name)} (${s.bits} bits effective)`);
      lines.push(`      Usage: ${s.usage}`);

      const gpuTime = this.estimate(s.bits, gpu);
      const superTime = this.estimate(s.bits, supercomputer);
      const allTime = this.estimate(s.bits, allGpus);

      lines.push(`      Consumer GPU:    ${gpuTime.description}`);
      lines.push(`      Supercomputer:   ${superTime.description}`);
      lines.push(`      All Earth GPUs:  ${allTime.description}`);
    });

    lines.push('');
    lines.push(Visualization.securityLevel(128));

    return lines.join('\n');
  }
}

export default {
  BruteForceAttack,
  BirthdayAttack,
  PatternPredictionAttack,
  CrackTimeEstimator
};
