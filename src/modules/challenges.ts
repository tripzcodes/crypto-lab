/**
 * Module 6: Interactive Challenges
 *
 * Educational games demonstrating cryptographic concepts
 */

import * as crypto from 'crypto';
import * as readline from 'readline';
import chalk from 'chalk';
import { Visualization } from '../utils/visualization';
import { Statistics } from '../utils/statistics';
import { LCG, MersenneTwister, ChaCha20CSPRNG } from './entropy';

/**
 * "Crack the RNG" Challenge
 *
 * Player tries to predict the next random number
 */
export class CrackTheRNG {
  private generator: { next: () => number; type: string };
  private history: number[] = [];

  constructor(generatorType: 'lcg' | 'mersenne' | 'csprng' = 'lcg') {
    switch (generatorType) {
      case 'lcg':
        const lcg = new LCG(Date.now());
        this.generator = { next: () => lcg.next(), type: 'LCG' };
        break;
      case 'mersenne':
        const mt = new MersenneTwister(Date.now());
        this.generator = { next: () => mt.next(), type: 'Mersenne Twister' };
        break;
      case 'csprng':
        const chacha = new ChaCha20CSPRNG();
        this.generator = { next: () => chacha.next(), type: 'ChaCha20' };
        break;
    }
  }

  /**
   * Get next number and add to history
   */
  nextNumber(): number {
    const num = this.generator.next();
    this.history.push(num);
    return num;
  }

  /**
   * Check if prediction is close enough
   */
  checkPrediction(predicted: number): { correct: boolean; actual: number; error: number } {
    const actual = this.nextNumber();
    const error = Math.abs(predicted - actual);
    return {
      correct: error < 0.01, // Within 1%
      actual,
      error
    };
  }

  /**
   * Get history for analysis
   */
  getHistory(): number[] {
    return [...this.history];
  }

  /**
   * Run the challenge (non-interactive for demo)
   */
  static runDemo(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         CRACK THE RNG CHALLENGE'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  Challenge: Predict the next random number!'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    // Easy mode: LCG
    lines.push(chalk.bold.yellow('  Level 1: Linear Congruential Generator'));
    lines.push('');

    const lcg = new LCG(12345);
    const lcgSamples: number[] = [];
    for (let i = 0; i < 5; i++) {
      lcgSamples.push(lcg.next());
      lines.push(`    Sample ${i + 1}: ${chalk.cyan(lcgSamples[i].toFixed(6))}`);
    }

    lines.push('');
    lines.push(chalk.gray('    Pattern analysis...'));

    // Show that LCG is predictable
    const lcg2 = new LCG(12345);
    for (let i = 0; i < 5; i++) lcg2.next();
    const prediction = lcg2.next();
    const actual = lcg.next();

    lines.push(`    Predicted next: ${chalk.yellow(prediction.toFixed(6))}`);
    lines.push(`    Actual next:    ${chalk.cyan(actual.toFixed(6))}`);
    if (Math.abs(prediction - actual) < 0.0001) {
      lines.push(chalk.green('    ✓ CRACKED! LCG is predictable with state recovery'));
    }

    lines.push('');

    // Hard mode: CSPRNG
    lines.push(chalk.bold.red('  Level 3: ChaCha20 CSPRNG'));
    lines.push('');

    const chacha = new ChaCha20CSPRNG();
    for (let i = 0; i < 5; i++) {
      lines.push(`    Sample ${i + 1}: ${chalk.cyan(chacha.next().toFixed(6))}`);
    }

    lines.push('');
    lines.push(chalk.gray('    Pattern analysis...'));
    lines.push(chalk.red('    ✗ NO PATTERN FOUND'));
    lines.push(chalk.red('    ✗ CSPRNG is computationally unpredictable'));
    lines.push('');

    lines.push(chalk.bold('  Lesson Learned:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Weak PRNGs can be broken with enough samples.');
    lines.push('    Always use CSPRNGs for security applications!');

    return lines.join('\n');
  }
}

/**
 * Human Randomness Test
 *
 * Compare human-generated sequences with true random
 */
export class HumanRandomnessTest {
  private humanSequence: number[] = [];
  private randomSequence: number[] = [];

  constructor() {
    // Generate true random sequence
    for (let i = 0; i < 100; i++) {
      this.randomSequence.push(crypto.randomBytes(1)[0] % 10);
    }
  }

  /**
   * Analyze a sequence for randomness patterns
   */
  static analyzeSequence(sequence: number[]): {
    distribution: number[];
    runs: number;
    expectedRuns: number;
    repetitions: number;
    patterns: { pattern: string; count: number }[];
  } {
    // Distribution
    const distribution = new Array(10).fill(0);
    sequence.forEach(n => distribution[n]++);

    // Count runs (consecutive increases/decreases)
    let runs = 1;
    for (let i = 1; i < sequence.length; i++) {
      if ((sequence[i] > sequence[i - 1]) !== (sequence[i - 1] > sequence[i - 2] || i === 1)) {
        runs++;
      }
    }
    const expectedRuns = (2 * sequence.length - 1) / 3;

    // Count immediate repetitions
    let repetitions = 0;
    for (let i = 1; i < sequence.length; i++) {
      if (sequence[i] === sequence[i - 1]) repetitions++;
    }

    // Find common patterns
    const patternCounts = new Map<string, number>();
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= sequence.length - len; i++) {
        const pattern = sequence.slice(i, i + len).join('');
        patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
      }
    }

    const patterns = Array.from(patternCounts.entries())
      .filter(([_, count]) => count > 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pattern, count]) => ({ pattern, count }));

    return { distribution, runs, expectedRuns, repetitions, patterns };
  }

  /**
   * Run the human randomness test demo
   */
  static runDemo(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         HUMAN RANDOMNESS TEST'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  The Challenge:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Humans are notoriously bad at generating random');
    lines.push('    sequences. We have biases we\'re not aware of.');
    lines.push('');

    // Simulate typical human sequence
    const humanLike: number[] = [];
    let prev = 5;
    for (let i = 0; i < 100; i++) {
      // Humans tend to avoid repetition and prefer certain numbers
      let next: number;
      if (Math.random() < 0.95) {
        // Avoid repetition (humans rarely repeat)
        do {
          next = Math.floor(Math.random() * 10);
        } while (next === prev);
      } else {
        next = prev;
      }

      // Bias towards middle numbers (humans avoid extremes)
      if (next === 0 || next === 9) {
        if (Math.random() < 0.7) {
          next = Math.floor(Math.random() * 6) + 2; // 2-7
        }
      }

      humanLike.push(next);
      prev = next;
    }

    // True random sequence
    const trueRandom: number[] = [];
    for (let i = 0; i < 100; i++) {
      trueRandom.push(crypto.randomBytes(1)[0] % 10);
    }

    // Analyze both
    const humanAnalysis = this.analyzeSequence(humanLike);
    const randomAnalysis = this.analyzeSequence(trueRandom);

    // Display sequences (first 50)
    lines.push(chalk.bold('  Sample Sequences (first 50 digits):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    "Human":  ${chalk.yellow(humanLike.slice(0, 50).join(''))}`);
    lines.push(`    Random:   ${chalk.cyan(trueRandom.slice(0, 50).join(''))}`);
    lines.push('');

    // Distribution comparison
    lines.push(chalk.bold('  Digit Distribution:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    for (let d = 0; d <= 9; d++) {
      const humanPct = humanAnalysis.distribution[d];
      const randomPct = randomAnalysis.distribution[d];
      const expected = 10;

      const humanBar = '█'.repeat(Math.round(humanPct / 2));
      const randomBar = '█'.repeat(Math.round(randomPct / 2));

      lines.push(`    ${d}: Human  ${chalk.yellow(humanBar.padEnd(15))} ${humanPct}%`);
      lines.push(`       Random ${chalk.cyan(randomBar.padEnd(15))} ${randomPct}%`);
    }

    lines.push('');

    // Bias detection
    lines.push(chalk.bold('  Bias Detection:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    // Repetition avoidance
    lines.push('');
    lines.push('    Consecutive Repetitions:');
    lines.push(`      Human:    ${chalk.yellow(humanAnalysis.repetitions.toString().padStart(3))} (expected ~10)`);
    lines.push(`      Random:   ${chalk.cyan(randomAnalysis.repetitions.toString().padStart(3))} (expected ~10)`);

    if (humanAnalysis.repetitions < 5) {
      lines.push(chalk.red('      ⚠ Human shows repetition avoidance bias!'));
    }

    lines.push('');

    // Pattern analysis
    if (humanAnalysis.patterns.length > 0) {
      lines.push('    Repeated Patterns (Human):');
      humanAnalysis.patterns.forEach(p => {
        lines.push(`      "${p.pattern}" appears ${chalk.yellow(p.count.toString())} times`);
      });
    }

    lines.push('');
    lines.push(chalk.bold('  Key Biases Humans Exhibit:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    1. Avoid repeating the same number');
    lines.push('    2. Prefer middle digits (3,4,5,6,7)');
    lines.push('    3. Avoid long runs (1,2,3,4,5)');
    lines.push('    4. Create alternating patterns');
    lines.push('    5. Underuse extreme values (0, 9)');

    return lines.join('\n');
  }
}

/**
 * Algorithm Complexity Race
 *
 * Visualize the growth of different complexities
 */
export class ComplexityRace {
  /**
   * Run algorithms of different complexities and compare
   */
  static race(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         ALGORITHM COMPLEXITY RACE'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  The Race: Watch algorithms compete as input grows'));
    lines.push(chalk.gray('  ' + '─'.repeat(55)));
    lines.push('');

    // Define complexity functions with actual implementations
    const algorithms = [
      {
        name: 'O(1) - Constant',
        color: chalk.green,
        run: (_n: number) => {
          return 1; // Always constant
        }
      },
      {
        name: 'O(log n) - Logarithmic',
        color: chalk.cyan,
        run: (n: number) => {
          let count = 0;
          let i = n;
          while (i > 1) { i = Math.floor(i / 2); count++; }
          return count;
        }
      },
      {
        name: 'O(n) - Linear',
        color: chalk.blue,
        run: (n: number) => {
          let count = 0;
          for (let i = 0; i < n; i++) count++;
          return count;
        }
      },
      {
        name: 'O(n log n) - Linearithmic',
        color: chalk.yellow,
        run: (n: number) => {
          let count = 0;
          for (let i = 0; i < n; i++) {
            let j = n;
            while (j > 1) { j = Math.floor(j / 2); count++; }
          }
          return count;
        }
      },
      {
        name: 'O(n²) - Quadratic',
        color: chalk.magenta,
        run: (n: number) => {
          let count = 0;
          for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) count++;
          }
          return count;
        }
      },
      {
        name: 'O(2^n) - Exponential',
        color: chalk.red,
        run: (n: number) => {
          return Math.pow(2, Math.min(n, 25)); // Cap to avoid overflow
        }
      }
    ];

    // Race header
    const inputSizes = [4, 8, 16, 32, 64, 128];

    lines.push('    ' + 'n'.padEnd(6) + algorithms.map(a =>
      a.name.split(' ')[0].padStart(12)
    ).join(' '));
    lines.push('    ' + '─'.repeat(6 + algorithms.length * 13));

    // Run race
    inputSizes.forEach(n => {
      const results = algorithms.map(a => {
        const start = performance.now();
        const ops = a.run(Math.min(n, 25)); // Cap n for O(2^n)
        const time = performance.now() - start;
        return { ops, time };
      });

      let line = `    ${n.toString().padEnd(6)}`;
      results.forEach((r, i) => {
        const opsStr = r.ops > 1e9 ? r.ops.toExponential(1) :
                       r.ops > 1e6 ? (r.ops / 1e6).toFixed(1) + 'M' :
                       r.ops > 1e3 ? (r.ops / 1e3).toFixed(1) + 'K' :
                       r.ops.toString();
        line += algorithms[i].color(opsStr.padStart(12));
      });
      lines.push(line);
    });

    lines.push('');

    // Visual race
    lines.push(chalk.bold('  Visual Race (progress bar = operations):'));
    lines.push(chalk.gray('  ' + '─'.repeat(55)));
    lines.push('');

    const n = 16;
    algorithms.forEach(algo => {
      const ops = algo.run(n);
      const maxOps = Math.pow(2, 16);
      const barWidth = Math.min(40, Math.ceil((Math.log10(ops + 1) / Math.log10(maxOps + 1)) * 40));
      const bar = '█'.repeat(barWidth) + '░'.repeat(40 - barWidth);
      lines.push(`    ${algo.name.padEnd(25)} [${algo.color(bar)}]`);
    });

    lines.push('');

    // Time comparison
    lines.push(chalk.bold('  Time Comparison (1 billion ops/sec):'));
    lines.push(chalk.gray('  ' + '─'.repeat(55)));
    lines.push('');

    const opsPerSec = 1e9;
    const bigN = 64;

    lines.push(`    For n = ${bigN}:`);
    algorithms.forEach(algo => {
      const ops = algo.run(bigN);
      const time = ops / opsPerSec;
      lines.push(`    ${algo.name.padEnd(25)} ${Visualization.timeEstimate(time)}`);
    });

    lines.push('');
    lines.push(chalk.bold('  Key Insight:'));
    lines.push(chalk.gray('  ' + '─'.repeat(55)));
    lines.push(`    ${chalk.green('O(1), O(log n), O(n)')} - Practical for any input size`);
    lines.push(`    ${chalk.yellow('O(n log n), O(n²)')} - Practical for moderate inputs`);
    lines.push(`    ${chalk.red('O(2^n), O(n!)')} - Only practical for tiny inputs`);
    lines.push('');
    lines.push('    Cryptographic security relies on this exponential gap!');

    return lines.join('\n');
  }
}

/**
 * P=NP Challenge
 *
 * Generate hard instances and show verification is easy
 */
export class PNPChallenge {
  /**
   * Generate a subset sum problem instance
   */
  static generateSubsetSum(size: number): {
    numbers: number[];
    target: number;
    solution?: number[];
  } {
    // Generate random numbers
    const numbers: number[] = [];
    for (let i = 0; i < size; i++) {
      numbers.push(Math.floor(Math.random() * 100) + 1);
    }

    // Pick a random subset for the solution
    const solutionIndices: number[] = [];
    for (let i = 0; i < size; i++) {
      if (Math.random() > 0.5) {
        solutionIndices.push(i);
      }
    }

    if (solutionIndices.length === 0) {
      solutionIndices.push(0);
    }

    const target = solutionIndices.reduce((sum, i) => sum + numbers[i], 0);
    const solution = solutionIndices.map(i => numbers[i]);

    return { numbers, target, solution };
  }

  /**
   * Verify a subset sum solution
   */
  static verifySubsetSum(numbers: number[], target: number, solution: number[]): boolean {
    // Check all solution elements are in numbers
    const numCounts = new Map<number, number>();
    numbers.forEach(n => numCounts.set(n, (numCounts.get(n) || 0) + 1));

    const solCounts = new Map<number, number>();
    solution.forEach(n => solCounts.set(n, (solCounts.get(n) || 0) + 1));

    for (const [n, count] of solCounts.entries()) {
      if ((numCounts.get(n) || 0) < count) return false;
    }

    // Check sum
    const sum = solution.reduce((a, b) => a + b, 0);
    return sum === target;
  }

  /**
   * Brute force subset sum (for small inputs)
   */
  static bruteForceSubsetSum(numbers: number[], target: number): {
    found: boolean;
    solution?: number[];
    attempts: number;
    time: number;
  } {
    const start = performance.now();
    const n = numbers.length;
    let attempts = 0;

    // Try all 2^n subsets
    for (let mask = 0; mask < Math.pow(2, n); mask++) {
      attempts++;
      let sum = 0;
      const subset: number[] = [];

      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          sum += numbers[i];
          subset.push(numbers[i]);
        }
      }

      if (sum === target) {
        return {
          found: true,
          solution: subset,
          attempts,
          time: performance.now() - start
        };
      }
    }

    return {
      found: false,
      attempts,
      time: performance.now() - start
    };
  }

  /**
   * Run the P=NP challenge demo
   */
  static runDemo(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         P vs NP CHALLENGE'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  The Subset Sum Problem (NP-Complete):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Given a set of numbers and a target sum,');
    lines.push('    find a subset that adds up to the target.');
    lines.push('');

    // Small example
    const small = this.generateSubsetSum(10);

    lines.push(chalk.bold('  Example Instance (n=10):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Numbers: [${chalk.cyan(small.numbers.join(', '))}]`);
    lines.push(`    Target:  ${chalk.yellow(small.target.toString())}`);
    lines.push('');

    // Verification (easy)
    lines.push(chalk.bold('  VERIFICATION (Easy - O(n)):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const verifyStart = performance.now();
    const isValid = this.verifySubsetSum(small.numbers, small.target, small.solution!);
    const verifyTime = performance.now() - verifyStart;

    lines.push(`    Given solution: [${chalk.green(small.solution!.join(', '))}]`);
    lines.push(`    Sum: ${small.solution!.join(' + ')} = ${chalk.cyan(small.solution!.reduce((a, b) => a + b, 0).toString())}`);
    lines.push(`    Valid: ${isValid ? chalk.green('YES ✓') : chalk.red('NO ✗')}`);
    lines.push(`    Time: ${chalk.green(verifyTime.toFixed(4) + ' ms')}`);
    lines.push('');

    // Finding (hard)
    lines.push(chalk.bold('  FINDING SOLUTION (Hard - O(2^n)):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const result = this.bruteForceSubsetSum(small.numbers, small.target);

    lines.push(`    Brute force attempts: ${chalk.yellow(result.attempts.toLocaleString())}`);
    lines.push(`    Maximum attempts: ${chalk.red(Math.pow(2, 10).toLocaleString())} (2^10)`);
    lines.push(`    Time: ${chalk.yellow(result.time.toFixed(4) + ' ms')}`);
    lines.push('');

    // Scaling comparison
    lines.push(chalk.bold('  Scaling Analysis:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    const sizes = [10, 20, 30, 40, 50, 64, 128, 256];
    lines.push('    n'.padEnd(8) + 'Verify (n ops)'.padEnd(20) + 'Solve (2^n ops)');
    lines.push('    ' + '─'.repeat(50));

    sizes.forEach(n => {
      const verifyOps = n;
      const solveOps = Math.pow(2, n);
      const verifyTime = verifyOps / 1e9;
      const solveTime = solveOps / 1e9;

      lines.push(
        `    ${n.toString().padEnd(8)}` +
        `${chalk.green(Visualization.timeEstimate(verifyTime).slice(0, 18).padEnd(20))}` +
        `${chalk.red(Visualization.timeEstimate(solveTime))}`
      );
    });

    lines.push('');
    lines.push(chalk.bold('  The P vs NP Question:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    Can every problem that\'s EASY TO VERIFY');
    lines.push('    also be EASY TO SOLVE?');
    lines.push('');
    lines.push(`    ${chalk.cyan('P')}: Problems solvable in polynomial time`);
    lines.push(`    ${chalk.yellow('NP')}: Problems verifiable in polynomial time`);
    lines.push('');
    lines.push('    If P = NP:');
    lines.push(chalk.red('      • All cryptography breaks'));
    lines.push(chalk.red('      • Digital signatures become forgeable'));
    lines.push(chalk.red('      • Secure communication becomes impossible'));
    lines.push('');
    lines.push('    Most experts believe P ≠ NP, but it\'s unproven.');
    lines.push('    This is one of the Millennium Prize Problems ($1M)!');

    return lines.join('\n');
  }
}

/**
 * Proof of Work Demonstration
 */
export class ProofOfWork {
  /**
   * Mine a block with given difficulty
   */
  static mine(data: string, difficulty: number): {
    nonce: number;
    hash: string;
    attempts: number;
    time: number;
  } {
    const target = '0'.repeat(difficulty);
    const start = performance.now();
    let nonce = 0;

    while (true) {
      const input = data + nonce.toString();
      const hash = crypto.createHash('sha256').update(input).digest('hex');

      if (hash.startsWith(target)) {
        return {
          nonce,
          hash,
          attempts: nonce + 1,
          time: performance.now() - start
        };
      }

      nonce++;

      // Safety limit
      if (nonce > 10000000) {
        return { nonce: -1, hash: '', attempts: nonce, time: performance.now() - start };
      }
    }
  }

  /**
   * Verify proof of work
   */
  static verify(data: string, nonce: number, difficulty: number): boolean {
    const input = data + nonce.toString();
    const hash = crypto.createHash('sha256').update(input).digest('hex');
    return hash.startsWith('0'.repeat(difficulty));
  }

  /**
   * Demonstrate proof of work
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         PROOF OF WORK DEMONSTRATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  What is Proof of Work?'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Find a nonce such that SHA256(data + nonce)');
    lines.push('    starts with a certain number of zeros.');
    lines.push('');
    lines.push('    Used in Bitcoin mining and spam prevention.');
    lines.push('');

    const data = 'Block #12345: Alice pays Bob 10 coins';

    lines.push(chalk.bold('  Mining Simulation:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Data: "${chalk.cyan(data)}"`);
    lines.push('');

    // Mine with increasing difficulty
    [1, 2, 3, 4, 5].forEach(difficulty => {
      const result = this.mine(data, difficulty);

      if (result.nonce >= 0) {
        lines.push(`    Difficulty ${difficulty} (${difficulty} leading zeros):`);
        lines.push(`      Nonce:    ${chalk.yellow(result.nonce.toString())}`);
        lines.push(`      Hash:     ${chalk.green(result.hash.slice(0, difficulty))}${chalk.gray(result.hash.slice(difficulty, 32))}...`);
        lines.push(`      Attempts: ${chalk.cyan(result.attempts.toLocaleString())}`);
        lines.push(`      Time:     ${chalk.cyan(result.time.toFixed(2))} ms`);
        lines.push('');
      }
    });

    // Verification
    lines.push(chalk.bold('  Verification (always instant):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));

    const proof = this.mine(data, 4);
    const verifyStart = performance.now();
    const isValid = this.verify(data, proof.nonce, 4);
    const verifyTime = performance.now() - verifyStart;

    lines.push(`    Check: SHA256("${data}${proof.nonce}")`);
    lines.push(`    Result: ${isValid ? chalk.green('VALID ✓') : chalk.red('INVALID ✗')}`);
    lines.push(`    Time: ${chalk.green(verifyTime.toFixed(4))} ms`);
    lines.push('');

    lines.push(chalk.bold('  The Asymmetry:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    Mining (finding):   ${chalk.red('HARD')} - O(2^difficulty)`);
    lines.push(`    Verification:       ${chalk.green('EASY')} - O(1)`);
    lines.push('');
    lines.push('    This asymmetry is fundamental to blockchain security!');

    return lines.join('\n');
  }
}

export default {
  CrackTheRNG,
  HumanRandomnessTest,
  ComplexityRace,
  PNPChallenge,
  ProofOfWork
};
