# Entropy Math Library

Lightweight, zero-dependency TypeScript library for random number generation and entropy simulation.

## Features

- **Zero dependencies** - Pure TypeScript
- **Multiple PRNGs** - LCG, Mersenne Twister, ChaCha20, XorShift128+
- **Entropy collection** - Timer-based entropy gathering
- **Statistical tests** - Chi-square, runs test, entropy measurement
- **Hash functions** - FNV-1a, MurmurHash3
- **Utilities** - Hex conversion, secure compare, shuffle, pick

## Usage

```typescript
import {
  LCG,
  MersenneTwister,
  ChaCha20,
  XorShift128Plus,
  Stats,
  randomBytes,
  random,
  shuffle
} from './lib';

// Fast PRNG (not secure)
const lcg = new LCG(12345);
console.log(lcg.next());        // 0.0 - 1.0
console.log(lcg.nextInt(100));  // 0 - 99
console.log(lcg.nextBytes(16)); // Uint8Array

// Better quality PRNG
const mt = new MersenneTwister();
console.log(mt.next());

// Cryptographically secure
const chacha = new ChaCha20();
console.log(chacha.nextBytes(32));

// Very fast, good quality
const xs = new XorShift128Plus();
console.log(xs.next());

// Secure random bytes
const bytes = randomBytes(32);

// Random float [0, 1)
const r = random();

// Shuffle array
const arr = [1, 2, 3, 4, 5];
shuffle(arr);

// Statistical analysis
const samples = Array.from({ length: 1000 }, () => chacha.next());
console.log(Stats.assess(samples));
// { score: 100, quality: 'excellent' }
```

## PRNGs Comparison

| Generator | Speed | Quality | Secure | Use Case |
|-----------|-------|---------|--------|----------|
| LCG | Very Fast | Poor | No | Games, simulations |
| MersenneTwister | Fast | Good | No | Scientific computing |
| XorShift128+ | Very Fast | Good | No | General purpose |
| ChaCha20 | Moderate | Excellent | Yes | Cryptography |

## Statistical Tests

```typescript
import { Stats } from './lib';

const data = [...]; // array of numbers 0-1

// Individual tests
Stats.chiSquare(data);  // { statistic, pass }
Stats.runsTest(data);   // { runs, expected, pass }
Stats.entropy(bytes);   // bits per byte (max 8.0)

// Overall assessment
Stats.assess(data);     // { score: 0-100, quality }
```

## Hash Functions

```typescript
import { fnv1a, murmur3 } from './lib';

const data = new Uint8Array([1, 2, 3, 4]);

fnv1a(data);      // Fast, simple hash
murmur3(data);    // Better distribution
```

## API Reference

### Classes

- `Entropy` - Entropy pool with timing-based collection
- `LCG` - Linear Congruential Generator
- `MersenneTwister` - MT19937 implementation
- `ChaCha20` - Cryptographic stream cipher PRNG
- `XorShift128Plus` - Fast xorshift variant

### Functions

- `randomBytes(n)` - Get n cryptographically random bytes
- `randomInt(max)` - Random integer [0, max)
- `random()` - Random float [0, 1)
- `shuffle(arr)` - Fisher-Yates shuffle in place
- `pick(arr)` - Random element from array
- `toHex(bytes)` - Bytes to hex string
- `fromHex(hex)` - Hex string to bytes
- `secureCompare(a, b)` - Constant-time comparison
- `fnv1a(data)` - FNV-1a hash
- `murmur3(data)` - MurmurHash3

### Stats

- `Stats.mean(data)` - Arithmetic mean
- `Stats.variance(data)` - Population variance
- `Stats.stdDev(data)` - Standard deviation
- `Stats.entropy(bytes)` - Shannon entropy
- `Stats.chiSquare(data)` - Chi-square uniformity test
- `Stats.runsTest(data)` - Runs test for independence
- `Stats.assess(data)` - Overall quality assessment
