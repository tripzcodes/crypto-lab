/**
 * Module 5: Advanced Theoretical Concepts
 *
 * Kolmogorov Complexity, Halting Problem, Zero-Knowledge Proofs,
 * and Probabilistic Algorithms
 */

import * as crypto from 'crypto';
import * as zlib from 'zlib';
import chalk from 'chalk';
import { Visualization } from '../utils/visualization';
import { ModularMath } from './provable-security';
import { CryptoRandom } from './entropy';

/**
 * Kolmogorov Complexity Estimator
 *
 * True Kolmogorov complexity is uncomputable, but we can estimate
 * using compression as a proxy
 */
export class KolmogorovComplexity {
  /**
   * Estimate complexity using compression ratio
   * Lower compression = higher complexity (more random)
   */
  static estimate(data: Buffer | string): {
    originalSize: number;
    compressedSize: number;
    ratio: number;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    interpretation: string;
  } {
    const buffer = typeof data === 'string' ? Buffer.from(data) : data;
    const compressed = zlib.deflateSync(buffer, { level: 9 });

    const originalSize = buffer.length;
    const compressedSize = compressed.length;
    const ratio = compressedSize / originalSize;

    let complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    let interpretation: string;

    if (ratio < 0.3) {
      complexity = 'LOW';
      interpretation = 'Highly structured/repetitive - simple to describe';
    } else if (ratio < 0.7) {
      complexity = 'MEDIUM';
      interpretation = 'Some structure detected - moderate complexity';
    } else {
      complexity = 'HIGH';
      interpretation = 'Incompressible - appears random/complex';
    }

    return { originalSize, compressedSize, ratio, complexity, interpretation };
  }

  /**
   * Compare complexity of different data types
   */
  static compare(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         KOLMOGOROV COMPLEXITY ESTIMATION'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  What is Kolmogorov Complexity?'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    The length of the shortest program that produces');
    lines.push('    a given string. Measures "true randomness."');
    lines.push('');
    lines.push('    K("AAAAAAAAAA") ≈ 10 (small: "print A 10 times")');
    lines.push('    K(random_string) ≈ length (no shorter description)');
    lines.push('');
    lines.push(chalk.yellow('    Note: True K is uncomputable! We estimate using compression.'));
    lines.push('');

    // Test various data types
    const samples: { name: string; data: Buffer }[] = [
      { name: 'Zeros (1KB)', data: Buffer.alloc(1024, 0) },
      { name: 'Pattern (1KB)', data: Buffer.from('abcdefgh'.repeat(128)) },
      { name: 'English text', data: Buffer.from('The quick brown fox jumps over the lazy dog. '.repeat(20)) },
      { name: 'JavaScript code', data: Buffer.from('function fibonacci(n) { return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2); }'.repeat(10)) },
      { name: 'Random bytes', data: crypto.randomBytes(1024) },
      { name: 'Counter sequence', data: Buffer.from(Array.from({ length: 1024 }, (_, i) => i % 256)) },
    ];

    lines.push(chalk.bold('  Complexity Analysis:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    samples.forEach(sample => {
      const result = this.estimate(sample.data);
      const color = result.complexity === 'LOW' ? chalk.green :
                   result.complexity === 'MEDIUM' ? chalk.yellow : chalk.red;

      const barWidth = 30;
      const filled = Math.floor(result.ratio * barWidth);
      const bar = chalk.blue('█'.repeat(filled)) + chalk.gray('░'.repeat(barWidth - filled));

      lines.push(`    ${chalk.bold(sample.name.padEnd(18))}`);
      lines.push(`      Original:   ${result.originalSize} bytes`);
      lines.push(`      Compressed: ${result.compressedSize} bytes`);
      lines.push(`      Ratio:      [${bar}] ${(result.ratio * 100).toFixed(1)}%`);
      lines.push(`      Complexity: ${color(result.complexity)}`);
      lines.push('');
    });

    lines.push(chalk.bold('  Key Insight:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Random data cannot be compressed because there\'s');
    lines.push('    no pattern to exploit. The description is as long');
    lines.push('    as the data itself - this is maximum complexity.');

    return lines.join('\n');
  }
}

/**
 * Halting Problem Simulator
 *
 * Demonstrates undecidability with random program generation
 */
export class HaltingProblem {
  private static programs = [
    { code: 'while (true) {}', halts: false, name: 'Infinite loop' },
    { code: 'for (let i = 0; i < 10; i++) {}', halts: true, name: 'Finite loop' },
    { code: 'let n = Math.random() > 0.5 ? 1 : Infinity; while (n > 0) n--;', halts: null, name: 'Random halt' },
    { code: 'let n = 27; while (n !== 1) { n = n % 2 === 0 ? n/2 : 3*n + 1; }', halts: true, name: 'Collatz (27)' },
  ];

  /**
   * Simulate running a program with timeout
   */
  static runWithTimeout(
    fn: () => void,
    timeoutMs: number
  ): { halted: boolean; time: number } {
    const start = performance.now();

    // Note: In JS we can't truly timeout sync code
    // This is a simplified demonstration
    try {
      fn();
      return { halted: true, time: performance.now() - start };
    } catch {
      return { halted: false, time: performance.now() - start };
    }
  }

  /**
   * Demonstrate the halting problem
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         THE HALTING PROBLEM'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  The Problem:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Can we write a program that decides, for any');
    lines.push('    program P and input I, whether P(I) halts?');
    lines.push('');
    lines.push(chalk.red.bold('    ANSWER: NO! (Proven by Turing, 1936)'));
    lines.push('');

    lines.push(chalk.bold('  The Proof (by contradiction):'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    Assume HALTS(P, I) exists and returns true/false');
    lines.push('');
    lines.push('    Construct PARADOX(P):');
    lines.push('      if HALTS(P, P):');
    lines.push('        loop forever');
    lines.push('      else:');
    lines.push('        return');
    lines.push('');
    lines.push('    Question: Does PARADOX(PARADOX) halt?');
    lines.push('');
    lines.push('    • If it halts → HALTS returns true → it loops forever ✗');
    lines.push('    • If it loops → HALTS returns false → it halts ✗');
    lines.push('');
    lines.push(chalk.yellow('    Contradiction! HALTS cannot exist.'));
    lines.push('');

    // Example programs
    lines.push(chalk.bold('  Example Programs:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    this.programs.forEach((prog, i) => {
      const haltStr = prog.halts === null ? chalk.yellow('UNKNOWN') :
                     prog.halts ? chalk.green('YES') : chalk.red('NO');
      lines.push(`    ${i + 1}. ${prog.name}`);
      lines.push(`       ${chalk.gray(prog.code)}`);
      lines.push(`       Halts? ${haltStr}`);
      lines.push('');
    });

    // The Collatz conjecture connection
    lines.push(chalk.bold('  Connection to Unsolved Problems:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    Collatz Conjecture (3n+1 problem):');
    lines.push('      Start with any positive integer n');
    lines.push('      If even: n → n/2');
    lines.push('      If odd:  n → 3n + 1');
    lines.push('      Conjecture: Always reaches 1');
    lines.push('');
    lines.push('    Example: 7 → 22 → 11 → 34 → 17 → 52 → 26 → 13 → ');
    lines.push('             40 → 20 → 10 → 5 → 16 → 8 → 4 → 2 → 1');
    lines.push('');
    lines.push(chalk.yellow('    Unproven for 80+ years! If we could solve the halting'));
    lines.push(chalk.yellow('    problem, we could trivially prove or disprove this.'));

    lines.push('');
    lines.push(chalk.bold('  Relevance to Cryptography:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Some security properties are undecidable:');
    lines.push('    • Whether code contains a vulnerability');
    lines.push('    • Whether an encryption is perfectly secure');
    lines.push('    • Whether a protocol leaks information');

    return lines.join('\n');
  }
}

/**
 * Zero-Knowledge Proof Demonstration
 *
 * Uses a simple commitment scheme and Sudoku-like puzzle
 */
export class ZeroKnowledgeProof {
  /**
   * Commitment scheme: commit to a value without revealing it
   */
  static commit(value: Buffer, nonce?: Buffer): {
    commitment: Buffer;
    opening: { value: Buffer; nonce: Buffer };
  } {
    const n = nonce ?? crypto.randomBytes(32);
    const data = Buffer.concat([n, value]);
    const commitment = crypto.createHash('sha256').update(data).digest();

    return {
      commitment,
      opening: { value, nonce: n }
    };
  }

  /**
   * Verify a commitment opening
   */
  static verify(commitment: Buffer, opening: { value: Buffer; nonce: Buffer }): boolean {
    const data = Buffer.concat([opening.nonce, opening.value]);
    const computed = crypto.createHash('sha256').update(data).digest();
    return commitment.equals(computed);
  }

  /**
   * Demonstrate ZKP concept with a simple color-blind test
   */
  static demonstrateColorBlind(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         ZERO-KNOWLEDGE PROOFS'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  What is a Zero-Knowledge Proof?'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Proving you know something WITHOUT revealing it.');
    lines.push('');
    lines.push('    Three properties:');
    lines.push(`      ${chalk.green('1. Completeness')}: Honest prover convinces verifier`);
    lines.push(`      ${chalk.green('2. Soundness')}: Cheating prover cannot fool verifier`);
    lines.push(`      ${chalk.green('3. Zero-Knowledge')}: Verifier learns nothing else`);
    lines.push('');

    // Classic example: Ali Baba's cave
    lines.push(chalk.bold('  Classic Example: The Color-Blind Test'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    Scenario:');
    lines.push('      Alice has two balls: one RED, one GREEN');
    lines.push('      Bob is color-blind and skeptical they\'re different');
    lines.push('      Alice wants to prove they\'re different colors');
    lines.push('      WITHOUT telling Bob which is which');
    lines.push('');

    lines.push('    Protocol:');
    lines.push('      1. Bob puts balls behind his back');
    lines.push('      2. Bob secretly swaps (or doesn\'t swap) them');
    lines.push('      3. Bob shows both balls');
    lines.push('      4. Alice says "swapped" or "not swapped"');
    lines.push('');

    // Simulate the protocol
    lines.push('    Simulation (20 rounds):');
    lines.push('');

    let correctCount = 0;
    for (let round = 1; round <= 20; round++) {
      const swapped = Math.random() > 0.5;
      // Alice always guesses correctly because she can see colors
      correctCount++;
      const mark = chalk.green('✓');
      const swapStr = swapped ? 'swapped' : 'same   ';
      if (round <= 5) {
        lines.push(`      Round ${round.toString().padStart(2)}: Bob ${swapStr} → Alice says "${swapped ? 'swapped' : 'same'}" ${mark}`);
      }
    }
    lines.push('      ...');
    lines.push(`      All 20 rounds correct!`);
    lines.push('');

    const cheatProb = Math.pow(0.5, 20);
    lines.push(`    Analysis:`);
    lines.push(`      Probability Alice is guessing: ${chalk.red((cheatProb * 100).toExponential(2) + '%')}`);
    lines.push(`      This is negligible - Alice must know the colors!`);
    lines.push('');
    lines.push(`    ${chalk.green('Zero-Knowledge')}: Bob learned balls are different,`);
    lines.push(`                  but not WHICH is red vs green!`);

    return lines.join('\n');
  }

  /**
   * Demonstrate ZKP with graph 3-coloring (NP-complete)
   */
  static demonstrateGraphColoring(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         ZKP: GRAPH 3-COLORING'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  Problem: Graph 3-Coloring (NP-Complete)'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    Given a graph, color vertices with 3 colors');
    lines.push('    such that no adjacent vertices share a color.');
    lines.push('');

    // Simple graph
    lines.push('    Example Graph:');
    lines.push('         ┌─────┐');
    lines.push('         │  A  │');
    lines.push('         └──┬──┘');
    lines.push('           / \\');
    lines.push('          /   \\');
    lines.push('       ┌─┴─┐ ┌─┴─┐');
    lines.push('       │ B │─│ C │');
    lines.push('       └───┘ └───┘');
    lines.push('');

    // Secret coloring (prover knows this)
    const colors = { A: 'RED', B: 'GREEN', C: 'BLUE' };
    const colorDisplay = {
      RED: chalk.red('RED'),
      GREEN: chalk.green('GREEN'),
      BLUE: chalk.blue('BLUE')
    };

    lines.push('    Prover\'s secret coloring:');
    lines.push(`      A = ${colorDisplay.RED}, B = ${colorDisplay.GREEN}, C = ${colorDisplay.BLUE}`);
    lines.push('');

    lines.push(chalk.bold('  ZKP Protocol:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');
    lines.push('    For each round:');
    lines.push('      1. Prover picks random permutation of colors');
    lines.push('      2. Prover commits to each vertex\'s new color');
    lines.push('      3. Verifier picks a random edge');
    lines.push('      4. Prover opens commitments for that edge');
    lines.push('      5. Verifier checks colors are different');
    lines.push('');

    // Simulate protocol
    lines.push('    Simulation:');
    lines.push('');

    const edges = [['A', 'B'], ['A', 'C'], ['B', 'C']];

    for (let round = 1; round <= 3; round++) {
      // Random permutation
      const perm = ['RED', 'GREEN', 'BLUE'].sort(() => Math.random() - 0.5);
      const permMap: { [k: string]: string } = { RED: perm[0], GREEN: perm[1], BLUE: perm[2] };

      // Permuted colors
      const permColors: { [k: string]: string } = {};
      for (const [v, c] of Object.entries(colors)) {
        permColors[v] = permMap[c];
      }

      // Random edge
      const edge = edges[Math.floor(Math.random() * edges.length)];
      const c1 = permColors[edge[0]];
      const c2 = permColors[edge[1]];

      const valid = c1 !== c2;

      lines.push(`      Round ${round}:`);
      lines.push(`        Permutation: R→${perm[0][0]}, G→${perm[1][0]}, B→${perm[2][0]}`);
      lines.push(`        Verifier asks about edge ${edge[0]}-${edge[1]}`);
      lines.push(`        Prover reveals: ${edge[0]}=${c1}, ${edge[1]}=${c2}`);
      lines.push(`        Result: ${valid ? chalk.green('✓ Different colors') : chalk.red('✗ Same color!')}`);
      lines.push('');
    }

    lines.push(chalk.bold('  Why is this Zero-Knowledge?'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    • Each round uses a RANDOM permutation');
    lines.push('    • Verifier only sees TWO colors per round');
    lines.push('    • These two random colors reveal nothing about');
    lines.push('      the actual coloring!');
    lines.push('');
    lines.push('    After many rounds, verifier is convinced prover');
    lines.push('    knows a valid 3-coloring, but learns nothing');
    lines.push('    about the coloring itself.');

    return lines.join('\n');
  }
}

/**
 * Miller-Rabin Primality Test
 *
 * Probabilistic algorithm with controllable error bounds
 */
export class MillerRabinPrimality {
  /**
   * Test if n is probably prime
   * @param n Number to test
   * @param k Number of rounds (error probability = 4^(-k))
   */
  static test(n: bigint, k: number = 20): {
    isProbablyPrime: boolean;
    confidence: number;
    witnesses: bigint[];
  } {
    const witnesses: bigint[] = [];

    // Handle small cases
    if (n < 2n) return { isProbablyPrime: false, confidence: 1, witnesses };
    if (n === 2n || n === 3n) return { isProbablyPrime: true, confidence: 1, witnesses };
    if (n % 2n === 0n) return { isProbablyPrime: false, confidence: 1, witnesses };

    // Write n - 1 as 2^r * d
    let r = 0n;
    let d = n - 1n;
    while (d % 2n === 0n) {
      r++;
      d /= 2n;
    }

    // Witness loop
    for (let i = 0; i < k; i++) {
      // Random a in [2, n-2]
      const bitLen = n.toString(2).length;
      let a: bigint;
      do {
        a = CryptoRandom.randomBigInt(bitLen);
      } while (a < 2n || a >= n - 2n);

      let x = ModularMath.modPow(a, d, n);

      if (x === 1n || x === n - 1n) {
        witnesses.push(a);
        continue;
      }

      let composite = true;
      for (let j = 0n; j < r - 1n; j++) {
        x = ModularMath.modPow(x, 2n, n);
        if (x === n - 1n) {
          composite = false;
          break;
        }
      }

      if (composite) {
        return {
          isProbablyPrime: false,
          confidence: 1,
          witnesses: [a] // a is a witness to compositeness
        };
      }

      witnesses.push(a);
    }

    const errorProbability = Math.pow(4, -k);
    return {
      isProbablyPrime: true,
      confidence: 1 - errorProbability,
      witnesses
    };
  }

  /**
   * Demonstrate probabilistic primality testing
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         MILLER-RABIN PRIMALITY TEST'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  What is a Probabilistic Algorithm?'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    An algorithm that uses randomness and may give');
    lines.push('    wrong answers, but with bounded probability.');
    lines.push('');
    lines.push('    Miller-Rabin:');
    lines.push('      • If it says "composite" → definitely composite');
    lines.push('      • If it says "prime" → probably prime');
    lines.push(`      • Error probability: ${chalk.yellow('≤ 4^(-k)')} for k rounds`);
    lines.push('');

    // Test some numbers
    const testNumbers = [
      { n: 561n, name: 'Carmichael number (composite)' },
      { n: 1009n, name: 'Prime' },
      { n: 104729n, name: 'Large prime' },
      { n: 1000003n, name: 'Large prime' },
      { n: 999961n, name: 'Composite (991 × 1009)' },
    ];

    lines.push(chalk.bold('  Testing Numbers:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    testNumbers.forEach(({ n, name }) => {
      const result5 = this.test(n, 5);
      const result20 = this.test(n, 20);

      const status5 = result5.isProbablyPrime ?
        chalk.green('PROBABLY PRIME') : chalk.red('COMPOSITE');
      const status20 = result20.isProbablyPrime ?
        chalk.green('PROBABLY PRIME') : chalk.red('COMPOSITE');

      lines.push(`    n = ${chalk.cyan(n.toString())} (${name})`);
      lines.push(`      5 rounds:  ${status5} (error ≤ ${(Math.pow(4, -5) * 100).toExponential(1)}%)`);
      lines.push(`      20 rounds: ${status20} (error ≤ ${(Math.pow(4, -20) * 100).toExponential(1)}%)`);
      lines.push('');
    });

    // Error probability analysis
    lines.push(chalk.bold('  Error Probability Analysis:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    const rounds = [1, 5, 10, 20, 40, 64];
    rounds.forEach(k => {
      const error = Math.pow(4, -k);
      const errorStr = error < 1e-10 ?
        error.toExponential(2) :
        (error * 100).toFixed(10) + '%';

      const bar = '█'.repeat(Math.min(40, Math.ceil(-Math.log10(error) * 3)));
      lines.push(`    ${k.toString().padStart(2)} rounds: ${chalk.cyan(errorStr.padEnd(20))} ${chalk.green(bar)}`);
    });

    lines.push('');
    lines.push(chalk.bold('  Practical Usage:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push(`    • 40 rounds: error < ${chalk.yellow('10^(-24)')}`);
    lines.push('      Less likely than hardware error during computation!');
    lines.push('    • Used in all practical prime generation');
    lines.push('    • RSA key generation uses this algorithm');

    return lines.join('\n');
  }
}

/**
 * Randomized Algorithm Examples
 */
export class RandomizedAlgorithms {
  /**
   * QuickSort with random pivot (Las Vegas algorithm)
   */
  static quickSort(arr: number[]): { sorted: number[]; comparisons: number } {
    let comparisons = 0;

    const sort = (a: number[]): number[] => {
      if (a.length <= 1) return a;

      // Random pivot
      const pivotIdx = Math.floor(Math.random() * a.length);
      const pivot = a[pivotIdx];

      const left: number[] = [];
      const right: number[] = [];

      for (let i = 0; i < a.length; i++) {
        if (i === pivotIdx) continue;
        comparisons++;
        if (a[i] <= pivot) left.push(a[i]);
        else right.push(a[i]);
      }

      return [...sort(left), pivot, ...sort(right)];
    };

    return { sorted: sort([...arr]), comparisons };
  }

  /**
   * Demonstrate Monte Carlo vs Las Vegas algorithms
   */
  static demonstrate(): string {
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('         RANDOMIZED ALGORITHMS'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    lines.push(chalk.bold('  Two Types of Randomized Algorithms:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    lines.push(`    ${chalk.green('Las Vegas')} (always correct, random runtime):`);
    lines.push('      • QuickSort with random pivot');
    lines.push('      • Randomized selection');
    lines.push('      • Always gives correct answer');
    lines.push('      • Runtime is a random variable');
    lines.push('');

    lines.push(`    ${chalk.yellow('Monte Carlo')} (may be wrong, bounded runtime):`);
    lines.push('      • Miller-Rabin primality test');
    lines.push('      • Monte Carlo π estimation');
    lines.push('      • May give wrong answer');
    lines.push('      • Error probability is bounded');
    lines.push('');

    // QuickSort demonstration
    lines.push(chalk.bold('  QuickSort Comparison Analysis:'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('');

    const sizes = [100, 1000, 10000];
    sizes.forEach(n => {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * n));
      const results: number[] = [];

      for (let trial = 0; trial < 10; trial++) {
        const { comparisons } = this.quickSort([...arr]);
        results.push(comparisons);
      }

      const avg = results.reduce((a, b) => a + b) / results.length;
      const expected = n * Math.log2(n) * 1.39; // Average case

      lines.push(`    n = ${n.toLocaleString().padEnd(6)}:`);
      lines.push(`      Average comparisons: ${chalk.cyan(Math.round(avg).toLocaleString())}`);
      lines.push(`      Expected (1.39n log n): ${chalk.green(Math.round(expected).toLocaleString())}`);
      lines.push('');
    });

    lines.push(chalk.bold('  Why Use Randomization?'));
    lines.push(chalk.gray('  ' + '─'.repeat(50)));
    lines.push('    1. Avoids worst-case inputs');
    lines.push('    2. Often simpler than deterministic algorithms');
    lines.push('    3. Can solve problems deterministic algorithms can\'t');
    lines.push('    4. Provides probabilistic proofs');

    return lines.join('\n');
  }
}

export default {
  KolmogorovComplexity,
  HaltingProblem,
  ZeroKnowledgeProof,
  MillerRabinPrimality,
  RandomizedAlgorithms
};
