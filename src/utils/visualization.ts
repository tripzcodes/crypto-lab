/**
 * Visualization Utilities
 * ASCII art graphs, color-coded output, and progress bars
 */

import chalk from 'chalk';

export class Visualization {
  // Security level colors
  static readonly SECURITY_COLORS = {
    critical: chalk.red.bold,
    weak: chalk.yellow,
    moderate: chalk.cyan,
    strong: chalk.green,
    quantum: chalk.magenta.bold,
  };

  /**
   * Draw an ASCII histogram
   */
  static histogram(data: number[], options: {
    title?: string;
    width?: number;
    height?: number;
    showValues?: boolean;
  } = {}): string {
    const { title = 'Histogram', width = 60, height = 15, showValues = true } = options;
    const lines: string[] = [];

    const max = Math.max(...data);
    const min = Math.min(...data);
    const buckets = Math.min(width, data.length);
    const bucketSize = Math.ceil(data.length / buckets);

    // Create buckets
    const histogram: number[] = [];
    for (let i = 0; i < buckets; i++) {
      const start = i * bucketSize;
      const end = Math.min(start + bucketSize, data.length);
      const sum = data.slice(start, end).reduce((a, b) => a + b, 0);
      histogram.push(sum / (end - start));
    }

    const histMax = Math.max(...histogram);

    // Title
    lines.push(chalk.bold.cyan(`\n  ${title}`));
    lines.push(chalk.gray('  ' + '─'.repeat(width + 4)));

    // Draw bars
    for (let row = height; row > 0; row--) {
      const threshold = (row / height) * histMax;
      let line = '  │';
      for (let col = 0; col < histogram.length; col++) {
        if (histogram[col] >= threshold) {
          const intensity = histogram[col] / histMax;
          if (intensity > 0.8) line += chalk.green('█');
          else if (intensity > 0.6) line += chalk.cyan('▓');
          else if (intensity > 0.4) line += chalk.blue('▒');
          else line += chalk.gray('░');
        } else {
          line += ' ';
        }
      }
      line += '│';
      if (row === height && showValues) {
        line += chalk.gray(` ${histMax.toFixed(2)}`);
      }
      lines.push(line);
    }

    // X-axis
    lines.push('  └' + '─'.repeat(histogram.length) + '┘');
    lines.push(chalk.gray(`   0${' '.repeat(histogram.length - 6)}${data.length}`));

    return lines.join('\n');
  }

  /**
   * Draw a complexity growth curve
   */
  static complexityCurve(
    functions: { name: string; fn: (n: number) => number; color: chalk.Chalk }[],
    options: { maxN?: number; height?: number; width?: number } = {}
  ): string {
    const { maxN = 20, height = 20, width = 60 } = options;
    const lines: string[] = [];

    lines.push(chalk.bold.cyan('\n  Complexity Growth Comparison'));
    lines.push(chalk.gray('  ' + '─'.repeat(width + 10)));

    // Calculate values
    const allValues: number[][] = functions.map(f => {
      const vals: number[] = [];
      for (let n = 1; n <= maxN; n++) {
        vals.push(Math.min(f.fn(n), 1e15)); // Cap at a large value
      }
      return vals;
    });

    const maxVal = Math.max(...allValues.flat());
    const logMax = Math.log10(maxVal + 1);

    // Create grid
    const grid: string[][] = Array(height).fill(null).map(() =>
      Array(width).fill(' ')
    );

    // Plot each function
    functions.forEach((f, fi) => {
      const values = allValues[fi];
      values.forEach((v, n) => {
        const x = Math.floor((n / maxN) * (width - 1));
        const logV = Math.log10(v + 1);
        const y = height - 1 - Math.floor((logV / logMax) * (height - 1));
        if (y >= 0 && y < height && x >= 0 && x < width) {
          grid[y][x] = f.color('●');
        }
      });
    });

    // Render grid
    for (let y = 0; y < height; y++) {
      const label = y === 0 ? `10^${Math.floor(logMax)}` :
                    y === height - 1 ? '1' : '';
      lines.push(`  ${label.padStart(6)} │${grid[y].join('')}│`);
    }

    lines.push(`  ${''.padStart(6)} └${'─'.repeat(width)}┘`);
    lines.push(`  ${''.padStart(6)}  1${' '.repeat(width - 4)}n=${maxN}`);

    // Legend
    lines.push('');
    lines.push('  ' + chalk.bold('Legend:'));
    functions.forEach(f => {
      lines.push(`    ${f.color('●')} ${f.name}`);
    });

    return lines.join('\n');
  }

  /**
   * Draw an ASCII progress bar
   */
  static progressBar(current: number, total: number, options: {
    width?: number;
    showPercent?: boolean;
    label?: string;
  } = {}): string {
    const { width = 40, showPercent = true, label = '' } = options;
    const percent = Math.min(current / total, 1);
    const filled = Math.floor(percent * width);
    const empty = width - filled;

    let bar = chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
    let result = `  [${bar}]`;

    if (showPercent) {
      result += chalk.cyan(` ${(percent * 100).toFixed(1)}%`);
    }
    if (label) {
      result = chalk.bold(label) + ' ' + result;
    }

    return result;
  }

  /**
   * Security level indicator
   */
  static securityLevel(bits: number): string {
    let level: string;
    let color: chalk.Chalk;
    let bar: string;

    if (bits < 40) {
      level = 'CRITICAL - Easily Breakable';
      color = this.SECURITY_COLORS.critical;
      bar = '█░░░░';
    } else if (bits < 80) {
      level = 'WEAK - Vulnerable to Attack';
      color = this.SECURITY_COLORS.weak;
      bar = '██░░░';
    } else if (bits < 128) {
      level = 'MODERATE - Short-term Security';
      color = this.SECURITY_COLORS.moderate;
      bar = '███░░';
    } else if (bits < 256) {
      level = 'STRONG - Long-term Security';
      color = this.SECURITY_COLORS.strong;
      bar = '████░';
    } else {
      level = 'QUANTUM-RESISTANT';
      color = this.SECURITY_COLORS.quantum;
      bar = '█████';
    }

    return `  Security: ${color(`[${bar}]`)} ${color(level)} (${bits} bits)`;
  }

  /**
   * Time estimate display
   */
  static timeEstimate(seconds: number): string {
    const SECOND = 1;
    const MINUTE = 60;
    const HOUR = 3600;
    const DAY = 86400;
    const YEAR = 31536000;
    const UNIVERSE_AGE = 4.32e17; // ~13.7 billion years in seconds

    if (seconds < MINUTE) {
      return chalk.red(`${seconds.toFixed(2)} seconds`);
    } else if (seconds < HOUR) {
      return chalk.yellow(`${(seconds / MINUTE).toFixed(1)} minutes`);
    } else if (seconds < DAY) {
      return chalk.yellow(`${(seconds / HOUR).toFixed(1)} hours`);
    } else if (seconds < YEAR) {
      return chalk.cyan(`${(seconds / DAY).toFixed(1)} days`);
    } else if (seconds < 1e9 * YEAR) {
      return chalk.green(`${(seconds / YEAR).toExponential(2)} years`);
    } else if (seconds < UNIVERSE_AGE) {
      return chalk.magenta(`${(seconds / YEAR).toExponential(2)} years (older than Earth)`);
    } else {
      const universeAges = seconds / UNIVERSE_AGE;
      return chalk.magenta.bold(`${universeAges.toExponential(2)} × age of universe`);
    }
  }

  /**
   * Binary visualization of data
   */
  static binaryVisualization(data: Uint8Array, bytesPerRow: number = 8): string {
    const lines: string[] = [];
    lines.push(chalk.bold.cyan('\n  Binary Visualization'));
    lines.push(chalk.gray('  ' + '─'.repeat(bytesPerRow * 9 + 4)));

    for (let i = 0; i < Math.min(data.length, 64); i += bytesPerRow) {
      let binLine = '  ';
      let hexLine = '  ';

      for (let j = 0; j < bytesPerRow && i + j < data.length; j++) {
        const byte = data[i + j];
        const binary = byte.toString(2).padStart(8, '0');
        binLine += binary.split('').map(b =>
          b === '1' ? chalk.green('1') : chalk.gray('0')
        ).join('') + ' ';
        hexLine += chalk.cyan(byte.toString(16).padStart(2, '0')) + ' ';
      }

      lines.push(binLine);
      lines.push(hexLine);
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Avalanche effect visualization
   */
  static avalancheEffect(original: Uint8Array, modified: Uint8Array): string {
    const lines: string[] = [];
    lines.push(chalk.bold.cyan('\n  Avalanche Effect Visualization'));
    lines.push(chalk.gray('  ' + '─'.repeat(70)));

    let changedBits = 0;
    const totalBits = original.length * 8;

    for (let i = 0; i < Math.min(original.length, 32); i++) {
      const origBin = original[i].toString(2).padStart(8, '0');
      const modBin = modified[i].toString(2).padStart(8, '0');

      let origDisplay = '';
      let modDisplay = '';

      for (let j = 0; j < 8; j++) {
        if (origBin[j] !== modBin[j]) {
          changedBits++;
          origDisplay += chalk.red(origBin[j]);
          modDisplay += chalk.green(modBin[j]);
        } else {
          origDisplay += chalk.gray(origBin[j]);
          modDisplay += chalk.gray(modBin[j]);
        }
      }

      if (i < 8) {
        lines.push(`  Byte ${i.toString().padStart(2)}: ${origDisplay} → ${modDisplay}`);
      }
    }

    const changePercent = (changedBits / totalBits) * 100;
    lines.push('');
    lines.push(`  Total bits changed: ${chalk.yellow(changedBits.toString())} / ${totalBits} (${chalk.cyan(changePercent.toFixed(1) + '%')})`);
    lines.push(`  Expected (ideal): ${chalk.green('50%')}`);

    // Visual bar
    const barWidth = 50;
    const filledWidth = Math.round((changePercent / 100) * barWidth);
    const bar = chalk.green('█'.repeat(filledWidth)) + chalk.gray('░'.repeat(barWidth - filledWidth));
    lines.push(`  Change distribution: [${bar}]`);

    return lines.join('\n');
  }

  /**
   * Box drawing for information display
   */
  static box(title: string, content: string[], options: {
    width?: number;
    borderColor?: chalk.Chalk;
  } = {}): string {
    const { width = 60, borderColor = chalk.cyan } = options;
    const lines: string[] = [];

    const innerWidth = width - 4;

    lines.push(borderColor(`  ╔${'═'.repeat(innerWidth + 2)}╗`));
    lines.push(borderColor(`  ║ ${chalk.bold(title.padEnd(innerWidth))} ║`));
    lines.push(borderColor(`  ╠${'═'.repeat(innerWidth + 2)}╣`));

    content.forEach(line => {
      const plainLine = line.replace(/\x1b\[[0-9;]*m/g, '');
      const padding = innerWidth - plainLine.length;
      lines.push(borderColor(`  ║ `) + line + ' '.repeat(Math.max(0, padding)) + borderColor(` ║`));
    });

    lines.push(borderColor(`  ╚${'═'.repeat(innerWidth + 2)}╝`));

    return lines.join('\n');
  }

  /**
   * Create a side-by-side comparison
   */
  static sideBySide(left: { title: string; content: string[] }, right: { title: string; content: string[] }, options: {
    width?: number;
  } = {}): string {
    const { width = 35 } = options;
    const lines: string[] = [];

    lines.push(`  ${chalk.bold.cyan(left.title.padEnd(width))}  │  ${chalk.bold.cyan(right.title)}`);
    lines.push(`  ${'─'.repeat(width)}──┼──${'─'.repeat(width)}`);

    const maxLines = Math.max(left.content.length, right.content.length);
    for (let i = 0; i < maxLines; i++) {
      const l = left.content[i] || '';
      const r = right.content[i] || '';
      const lPlain = l.replace(/\x1b\[[0-9;]*m/g, '');
      const lPadding = width - lPlain.length;
      lines.push(`  ${l}${' '.repeat(Math.max(0, lPadding))}  │  ${r}`);
    }

    return lines.join('\n');
  }

  /**
   * Animated spinner for long operations
   */
  static spinner(message: string): { stop: () => void; update: (msg: string) => void } {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    let currentMessage = message;

    const interval = setInterval(() => {
      process.stdout.write(`\r  ${chalk.cyan(frames[i])} ${currentMessage}    `);
      i = (i + 1) % frames.length;
    }, 80);

    return {
      stop: () => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(currentMessage.length + 20) + '\r');
      },
      update: (msg: string) => {
        currentMessage = msg;
      }
    };
  }
}

export default Visualization;
