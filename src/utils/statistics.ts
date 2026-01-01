/**
 * Statistical Analysis Utilities
 * Chi-square tests, frequency analysis, and randomness metrics
 */

import chalk from 'chalk';

export class Statistics {
  /**
   * Calculate mean of an array
   */
  static mean(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  /**
   * Calculate variance
   */
  static variance(data: number[]): number {
    const m = this.mean(data);
    return data.reduce((sum, x) => sum + Math.pow(x - m, 2), 0) / data.length;
  }

  /**
   * Calculate standard deviation
   */
  static stdDev(data: number[]): number {
    return Math.sqrt(this.variance(data));
  }

  /**
   * Chi-square test for uniform distribution
   * Returns { statistic, pValue, degreesOfFreedom, isRandom }
   */
  static chiSquareUniformity(data: number[], numBuckets: number = 10): {
    statistic: number;
    pValue: number;
    degreesOfFreedom: number;
    isRandom: boolean;
    buckets: number[];
    expected: number;
  } {
    // Create buckets
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const buckets = new Array(numBuckets).fill(0);

    // Fill buckets
    data.forEach(value => {
      const bucketIndex = Math.min(
        Math.floor(((value - min) / range) * numBuckets),
        numBuckets - 1
      );
      buckets[bucketIndex]++;
    });

    // Expected frequency
    const expected = data.length / numBuckets;

    // Calculate chi-square statistic
    const statistic = buckets.reduce((sum, observed) => {
      return sum + Math.pow(observed - expected, 2) / expected;
    }, 0);

    const degreesOfFreedom = numBuckets - 1;

    // Approximate p-value using chi-square distribution
    // Using Wilson-Hilferty approximation
    const pValue = this.chiSquarePValue(statistic, degreesOfFreedom);

    return {
      statistic,
      pValue,
      degreesOfFreedom,
      isRandom: pValue > 0.05, // 95% confidence level
      buckets,
      expected
    };
  }

  /**
   * Approximate chi-square p-value
   */
  private static chiSquarePValue(chiSquare: number, df: number): number {
    // Wilson-Hilferty approximation
    if (df <= 0) return 1;
    const x = chiSquare / df;
    const z = Math.pow(x, 1/3) - (1 - 2/(9*df));
    const denom = Math.sqrt(2/(9*df));
    const standardized = z / denom;

    // Approximate using normal CDF
    return 1 - this.normalCDF(standardized);
  }

  /**
   * Normal CDF approximation
   */
  private static normalCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  /**
   * Runs test for randomness (Wald-Wolfowitz)
   */
  static runsTest(data: number[]): {
    runs: number;
    expectedRuns: number;
    zScore: number;
    isRandom: boolean;
  } {
    const median = this.median(data);
    const signs = data.map(x => x >= median ? 1 : 0);

    // Count runs
    let runs = 1;
    for (let i = 1; i < signs.length; i++) {
      if (signs[i] !== signs[i - 1]) runs++;
    }

    // Count positives and negatives
    const n1 = signs.filter(s => s === 1).length;
    const n2 = signs.filter(s => s === 0).length;
    const n = n1 + n2;

    // Expected runs and variance
    const expectedRuns = (2 * n1 * n2) / n + 1;
    const variance = (2 * n1 * n2 * (2 * n1 * n2 - n)) / (n * n * (n - 1));
    const zScore = (runs - expectedRuns) / Math.sqrt(variance);

    return {
      runs,
      expectedRuns,
      zScore,
      isRandom: Math.abs(zScore) < 1.96 // 95% confidence
    };
  }

  /**
   * Calculate median
   */
  static median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Entropy calculation (Shannon entropy)
   */
  static shannonEntropy(data: Uint8Array): number {
    const freq = new Map<number, number>();
    data.forEach(byte => freq.set(byte, (freq.get(byte) || 0) + 1));

    let entropy = 0;
    freq.forEach(count => {
      const p = count / data.length;
      entropy -= p * Math.log2(p);
    });

    return entropy;
  }

  /**
   * Serial correlation coefficient
   */
  static serialCorrelation(data: number[]): number {
    if (data.length < 2) return 0;

    const mean = this.mean(data);
    let num = 0;
    let den = 0;

    for (let i = 0; i < data.length - 1; i++) {
      num += (data[i] - mean) * (data[i + 1] - mean);
    }
    for (let i = 0; i < data.length; i++) {
      den += Math.pow(data[i] - mean, 2);
    }

    return num / den;
  }

  /**
   * Monte Carlo Pi estimation (tests uniform distribution in 2D)
   */
  static monteCarloPi(data: number[]): {
    estimate: number;
    error: number;
    pointsInCircle: number;
    totalPoints: number;
  } {
    let inCircle = 0;
    const pairs = Math.floor(data.length / 2);

    for (let i = 0; i < pairs; i++) {
      const x = data[i * 2] * 2 - 1; // Map to [-1, 1]
      const y = data[i * 2 + 1] * 2 - 1;
      if (x * x + y * y <= 1) inCircle++;
    }

    const estimate = (inCircle / pairs) * 4;
    const error = Math.abs(estimate - Math.PI);

    return {
      estimate,
      error,
      pointsInCircle: inCircle,
      totalPoints: pairs
    };
  }

  /**
   * Bit frequency test
   */
  static bitFrequencyTest(data: Uint8Array): {
    ones: number;
    zeros: number;
    ratio: number;
    isBalanced: boolean;
  } {
    let ones = 0;
    let zeros = 0;

    data.forEach(byte => {
      for (let i = 0; i < 8; i++) {
        if ((byte >> i) & 1) ones++;
        else zeros++;
      }
    });

    const ratio = ones / (ones + zeros);
    const totalBits = ones + zeros;
    const expectedRatio = 0.5;
    const tolerance = 3 / Math.sqrt(totalBits); // 3 sigma

    return {
      ones,
      zeros,
      ratio,
      isBalanced: Math.abs(ratio - expectedRatio) < tolerance
    };
  }

  /**
   * Generate full statistical report
   */
  static fullReport(data: number[]): string {
    const lines: string[] = [];
    const byteData = new Uint8Array(data.map(d => Math.floor(d * 256) % 256));

    lines.push(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold.cyan('       STATISTICAL RANDOMNESS ANALYSIS REPORT'));
    lines.push(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    // Basic statistics
    lines.push(chalk.bold('  Basic Statistics:'));
    lines.push(`    Sample size:  ${chalk.cyan(data.length.toString())}`);
    lines.push(`    Mean:         ${chalk.cyan(this.mean(data).toFixed(6))}`);
    lines.push(`    Std Dev:      ${chalk.cyan(this.stdDev(data).toFixed(6))}`);
    lines.push(`    Min:          ${chalk.cyan(Math.min(...data).toFixed(6))}`);
    lines.push(`    Max:          ${chalk.cyan(Math.max(...data).toFixed(6))}`);
    lines.push('');

    // Chi-square test
    const chiSquare = this.chiSquareUniformity(data, 10);
    lines.push(chalk.bold('  Chi-Square Uniformity Test:'));
    lines.push(`    Statistic:    ${chalk.cyan(chiSquare.statistic.toFixed(4))}`);
    lines.push(`    p-value:      ${chalk.cyan(chiSquare.pValue.toFixed(4))}`);
    lines.push(`    Result:       ${chiSquare.isRandom ?
      chalk.green('✓ PASS - Uniformly distributed') :
      chalk.red('✗ FAIL - Non-uniform distribution')}`);
    lines.push('');

    // Runs test
    const runs = this.runsTest(data);
    lines.push(chalk.bold('  Runs Test (Sequence Independence):'));
    lines.push(`    Observed:     ${chalk.cyan(runs.runs.toString())} runs`);
    lines.push(`    Expected:     ${chalk.cyan(runs.expectedRuns.toFixed(1))} runs`);
    lines.push(`    Z-score:      ${chalk.cyan(runs.zScore.toFixed(4))}`);
    lines.push(`    Result:       ${runs.isRandom ?
      chalk.green('✓ PASS - Values appear independent') :
      chalk.red('✗ FAIL - Sequential patterns detected')}`);
    lines.push('');

    // Serial correlation
    const correlation = this.serialCorrelation(data);
    lines.push(chalk.bold('  Serial Correlation:'));
    lines.push(`    Coefficient:  ${chalk.cyan(correlation.toFixed(6))}`);
    lines.push(`    Result:       ${Math.abs(correlation) < 0.05 ?
      chalk.green('✓ PASS - Low correlation') :
      chalk.red('✗ FAIL - High correlation detected')}`);
    lines.push('');

    // Shannon entropy
    const entropy = this.shannonEntropy(byteData);
    lines.push(chalk.bold('  Shannon Entropy:'));
    lines.push(`    Entropy:      ${chalk.cyan(entropy.toFixed(4))} bits/byte`);
    lines.push(`    Maximum:      ${chalk.cyan('8.0000')} bits/byte`);
    lines.push(`    Result:       ${entropy > 7.5 ?
      chalk.green('✓ HIGH - Good randomness') :
      entropy > 6.5 ?
        chalk.yellow('◐ MODERATE - Acceptable') :
        chalk.red('✗ LOW - Poor randomness')}`);
    lines.push('');

    // Bit frequency
    const bitFreq = this.bitFrequencyTest(byteData);
    lines.push(chalk.bold('  Bit Frequency Test:'));
    lines.push(`    Ones:         ${chalk.cyan(bitFreq.ones.toString())}`);
    lines.push(`    Zeros:        ${chalk.cyan(bitFreq.zeros.toString())}`);
    lines.push(`    Ratio:        ${chalk.cyan(bitFreq.ratio.toFixed(4))} (expected 0.5)`);
    lines.push(`    Result:       ${bitFreq.isBalanced ?
      chalk.green('✓ PASS - Balanced distribution') :
      chalk.red('✗ FAIL - Imbalanced bits')}`);
    lines.push('');

    // Monte Carlo Pi
    if (data.length >= 100) {
      const pi = this.monteCarloPi(data);
      lines.push(chalk.bold('  Monte Carlo π Estimation:'));
      lines.push(`    Estimate:     ${chalk.cyan(pi.estimate.toFixed(6))}`);
      lines.push(`    Actual π:     ${chalk.cyan(Math.PI.toFixed(6))}`);
      lines.push(`    Error:        ${chalk.cyan(pi.error.toFixed(6))}`);
      lines.push(`    Result:       ${pi.error < 0.1 ?
        chalk.green('✓ PASS - Good 2D uniformity') :
        chalk.yellow('◐ MODERATE - Some clustering')}`);
    }

    // Overall assessment
    const tests = [
      chiSquare.isRandom,
      runs.isRandom,
      Math.abs(correlation) < 0.05,
      entropy > 7.5,
      bitFreq.isBalanced
    ];
    const passedTests = tests.filter(t => t).length;

    lines.push('');
    lines.push(chalk.bold('  ═══════════════════════════════════════════════'));
    lines.push(chalk.bold(`  OVERALL ASSESSMENT: ${passedTests}/5 tests passed`));
    if (passedTests >= 4) {
      lines.push(chalk.green.bold('  ✓ HIGH QUALITY RANDOMNESS'));
    } else if (passedTests >= 3) {
      lines.push(chalk.yellow.bold('  ◐ ACCEPTABLE RANDOMNESS'));
    } else {
      lines.push(chalk.red.bold('  ✗ POOR RANDOMNESS - NOT SUITABLE FOR CRYPTO'));
    }
    lines.push(chalk.bold('  ═══════════════════════════════════════════════\n'));

    return lines.join('\n');
  }
}

export default Statistics;
