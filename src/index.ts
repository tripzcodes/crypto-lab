#!/usr/bin/env node
/**
 * Crypto Entropy Lab - Advanced Cryptographic Research Platform
 *
 * A comprehensive educational tool exploring randomness, cryptography,
 * and computational complexity theory.
 */

import { Command } from 'commander';
import chalk from 'chalk';

// Module imports
import {
  EntropyCollector,
  LCG,
  MersenneTwister,
  ChaCha20CSPRNG,
  CryptoRandom,
  RNGAnalyzer
} from './modules/entropy';

import {
  ReversibleMath,
  HashFunctions,
  RainbowTableAttack,
  AvalancheEffect,
  TimingComparison
} from './modules/one-way-functions';

import {
  BruteForceAttack,
  BirthdayAttack,
  PatternPredictionAttack,
  CrackTimeEstimator
} from './modules/complexity';

import {
  DiffieHellman,
  DiscreteLogProblem,
  SecurityReduction,
  ElGamal
} from './modules/provable-security';

import {
  KolmogorovComplexity,
  HaltingProblem,
  ZeroKnowledgeProof,
  MillerRabinPrimality,
  RandomizedAlgorithms
} from './modules/advanced-theory';

import {
  CrackTheRNG,
  HumanRandomnessTest,
  ComplexityRace,
  PNPChallenge,
  ProofOfWork
} from './modules/challenges';

import { Visualization } from './utils/visualization';
import { Statistics } from './utils/statistics';

const program = new Command();

// Banner
function showBanner(): void {
  console.log(chalk.cyan(`
  ╔═══════════════════════════════════════════════════════════════════════╗
  ║                                                                       ║
  ║   ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗                   ║
  ║  ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗                  ║
  ║  ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║                  ║
  ║  ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║                  ║
  ║  ╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝                  ║
  ║   ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝                   ║
  ║                                                                       ║
  ║   ███████╗███╗   ██╗████████╗██████╗  ██████╗ ██████╗ ██╗   ██╗      ║
  ║   ██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██╔═══██╗██╔══██╗╚██╗ ██╔╝      ║
  ║   █████╗  ██╔██╗ ██║   ██║   ██████╔╝██║   ██║██████╔╝ ╚████╔╝       ║
  ║   ██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗██║   ██║██╔═══╝   ╚██╔╝        ║
  ║   ███████╗██║ ╚████║   ██║   ██║  ██║╚██████╔╝██║        ██║         ║
  ║   ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝        ╚═╝         ║
  ║                                                                       ║
  ║   ██╗      █████╗ ██████╗                                             ║
  ║   ██║     ██╔══██╗██╔══██╗                                            ║
  ║   ██║     ███████║██████╔╝                                            ║
  ║   ██║     ██╔══██║██╔══██╗                                            ║
  ║   ███████╗██║  ██║██████╔╝                                            ║
  ║   ╚══════╝╚═╝  ╚═╝╚═════╝                                             ║
  ║                                                                       ║
  ║           Advanced Cryptographic Research Platform                    ║
  ║                     v1.0.0                                            ║
  ╚═══════════════════════════════════════════════════════════════════════╝
`));
}

program
  .name('crypto-lab')
  .description('Advanced Cryptographic Random Number Generator Research Platform')
  .version('1.0.0');

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 1: ENTROPY & RANDOM NUMBER GENERATORS
// ═══════════════════════════════════════════════════════════════════════════

const entropyCmd = program
  .command('entropy')
  .description('Module 1: Entropy & Random Number Generators');

entropyCmd
  .command('collect')
  .description('Collect and analyze entropy from multiple sources')
  .action(() => {
    showBanner();
    const collector = new EntropyCollector();
    console.log(collector.displayReport());
  });

entropyCmd
  .command('compare')
  .description('Compare different RNG implementations')
  .option('-n, --samples <number>', 'Number of samples', '10000')
  .action(async (options) => {
    showBanner();
    console.log(await RNGAnalyzer.compare(parseInt(options.samples)));
  });

entropyCmd
  .command('visualize')
  .description('Visual demonstration of randomness quality')
  .action(() => {
    showBanner();
    console.log(RNGAnalyzer.visualDemo());
  });

entropyCmd
  .command('stats')
  .description('Statistical analysis of RNG output')
  .option('-g, --generator <type>', 'Generator type: lcg, mersenne, chacha, crypto', 'crypto')
  .option('-n, --samples <number>', 'Number of samples', '10000')
  .action((options) => {
    showBanner();
    const n = parseInt(options.samples);
    let gen: () => number;

    switch (options.generator) {
      case 'lcg':
        const lcg = new LCG();
        gen = () => lcg.next();
        break;
      case 'mersenne':
        const mt = new MersenneTwister();
        gen = () => mt.next();
        break;
      case 'chacha':
        const cc = new ChaCha20CSPRNG();
        gen = () => cc.next();
        break;
      default:
        gen = () => CryptoRandom.next();
    }

    const samples: number[] = [];
    for (let i = 0; i < n; i++) samples.push(gen());

    console.log(Statistics.fullReport(samples));
    console.log(Visualization.histogram(samples, { title: `${options.generator.toUpperCase()} Distribution` }));
  });

entropyCmd
  .command('predictability')
  .description('Demonstrate LCG predictability')
  .action(() => {
    showBanner();
    console.log(LCG.demonstratePredictability());
  });

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 2: ONE-WAY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

const oneWayCmd = program
  .command('oneway')
  .description('Module 2: One-Way Functions & Reversibility');

oneWayCmd
  .command('reversible')
  .description('Demonstrate reversible mathematical operations')
  .action(() => {
    showBanner();
    console.log(ReversibleMath.demonstrateReversibility());
  });

oneWayCmd
  .command('hash')
  .description('Demonstrate one-way hash functions')
  .action(() => {
    showBanner();
    console.log(HashFunctions.demonstrateOneWay());
  });

oneWayCmd
  .command('rainbow')
  .description('Rainbow table attack simulation')
  .action(async () => {
    showBanner();
    console.log(await RainbowTableAttack.demonstrate());
  });

oneWayCmd
  .command('avalanche')
  .description('Visualize the avalanche effect')
  .action(() => {
    showBanner();
    console.log(AvalancheEffect.visualize());
  });

oneWayCmd
  .command('timing')
  .description('Compare forward vs reverse computation timing')
  .action(async () => {
    showBanner();
    console.log(await TimingComparison.compare());
  });

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 3: COMPUTATIONAL COMPLEXITY
// ═══════════════════════════════════════════════════════════════════════════

const complexityCmd = program
  .command('complexity')
  .description('Module 3: Computational Complexity Analysis');

complexityCmd
  .command('bruteforce')
  .description('Visualize brute force complexity')
  .action(() => {
    showBanner();
    console.log(BruteForceAttack.visualizeComplexity());
  });

complexityCmd
  .command('birthday')
  .description('Demonstrate birthday paradox attack')
  .action(() => {
    showBanner();
    console.log(BirthdayAttack.demonstrate());
  });

complexityCmd
  .command('prediction')
  .description('PRNG pattern prediction attack')
  .action(() => {
    showBanner();
    console.log(PatternPredictionAttack.demonstrate());
  });

complexityCmd
  .command('cracktime')
  .description('Time to crack estimates')
  .action(() => {
    showBanner();
    console.log(CrackTimeEstimator.fullDemo());
  });

complexityCmd
  .command('pvsnp')
  .description('P vs NP and cryptography')
  .action(() => {
    showBanner();
    console.log(CrackTimeEstimator.demonstratePvsNP());
  });

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 4: PROVABLE SECURITY
// ═══════════════════════════════════════════════════════════════════════════

const securityCmd = program
  .command('security')
  .description('Module 4: Provable Security Demonstrations');

securityCmd
  .command('diffie-hellman')
  .alias('dh')
  .description('Diffie-Hellman key exchange demonstration')
  .action(() => {
    showBanner();
    console.log(DiffieHellman.demonstrate());
  });

securityCmd
  .command('dlog')
  .description('Discrete logarithm problem visualization')
  .action(() => {
    showBanner();
    console.log(DiscreteLogProblem.visualize());
  });

securityCmd
  .command('reduction')
  .description('Security reduction demonstration')
  .action(() => {
    showBanner();
    console.log(SecurityReduction.demonstrateReduction());
  });

securityCmd
  .command('reduction-sim')
  .description('Simulate a security reduction')
  .action(async () => {
    showBanner();
    console.log(await SecurityReduction.simulateReduction());
  });

securityCmd
  .command('elgamal')
  .description('El Gamal encryption demonstration')
  .action(() => {
    showBanner();
    console.log(ElGamal.demonstrate());
  });

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 5: ADVANCED THEORY
// ═══════════════════════════════════════════════════════════════════════════

const theoryCmd = program
  .command('theory')
  .description('Module 5: Advanced Theoretical Concepts');

theoryCmd
  .command('kolmogorov')
  .description('Kolmogorov complexity estimation')
  .action(() => {
    showBanner();
    console.log(KolmogorovComplexity.compare());
  });

theoryCmd
  .command('halting')
  .description('Halting problem demonstration')
  .action(() => {
    showBanner();
    console.log(HaltingProblem.demonstrate());
  });

theoryCmd
  .command('zkp')
  .description('Zero-knowledge proof demonstration')
  .action(() => {
    showBanner();
    console.log(ZeroKnowledgeProof.demonstrateColorBlind());
    console.log(ZeroKnowledgeProof.demonstrateGraphColoring());
  });

theoryCmd
  .command('primality')
  .description('Miller-Rabin probabilistic primality test')
  .action(() => {
    showBanner();
    console.log(MillerRabinPrimality.demonstrate());
  });

theoryCmd
  .command('randomized')
  .description('Randomized algorithms demonstration')
  .action(() => {
    showBanner();
    console.log(RandomizedAlgorithms.demonstrate());
  });

// ═══════════════════════════════════════════════════════════════════════════
// MODULE 6: CHALLENGES
// ═══════════════════════════════════════════════════════════════════════════

const challengeCmd = program
  .command('challenge')
  .description('Module 6: Interactive Challenges');

challengeCmd
  .command('crack-rng')
  .description('Try to crack the RNG')
  .action(() => {
    showBanner();
    console.log(CrackTheRNG.runDemo());
  });

challengeCmd
  .command('human-random')
  .description('Human randomness test')
  .action(() => {
    showBanner();
    console.log(HumanRandomnessTest.runDemo());
  });

challengeCmd
  .command('complexity-race')
  .description('Algorithm complexity race')
  .action(() => {
    showBanner();
    console.log(ComplexityRace.race());
  });

challengeCmd
  .command('pnp')
  .description('P vs NP challenge')
  .action(() => {
    showBanner();
    console.log(PNPChallenge.runDemo());
  });

challengeCmd
  .command('pow')
  .description('Proof of work demonstration')
  .action(() => {
    showBanner();
    console.log(ProofOfWork.demonstrate());
  });

// ═══════════════════════════════════════════════════════════════════════════
// FULL DEMO
// ═══════════════════════════════════════════════════════════════════════════

program
  .command('demo')
  .description('Run a comprehensive demonstration of all modules')
  .action(async () => {
    showBanner();

    console.log(chalk.bold.cyan('\n  Starting comprehensive demonstration...\n'));
    console.log(chalk.gray('  This will showcase highlights from each module.\n'));

    // Module 1
    console.log(chalk.bold.yellow('\n  ══════════════════════════════════════════'));
    console.log(chalk.bold.yellow('  MODULE 1: ENTROPY & RNG'));
    console.log(chalk.bold.yellow('  ══════════════════════════════════════════'));
    console.log(LCG.demonstratePredictability());

    // Module 2
    console.log(chalk.bold.yellow('\n  ══════════════════════════════════════════'));
    console.log(chalk.bold.yellow('  MODULE 2: ONE-WAY FUNCTIONS'));
    console.log(chalk.bold.yellow('  ══════════════════════════════════════════'));
    console.log(AvalancheEffect.visualize());

    // Module 3
    console.log(chalk.bold.yellow('\n  ══════════════════════════════════════════'));
    console.log(chalk.bold.yellow('  MODULE 3: COMPUTATIONAL COMPLEXITY'));
    console.log(chalk.bold.yellow('  ══════════════════════════════════════════'));
    console.log(BirthdayAttack.demonstrate());

    // Module 4
    console.log(chalk.bold.yellow('\n  ══════════════════════════════════════════'));
    console.log(chalk.bold.yellow('  MODULE 4: PROVABLE SECURITY'));
    console.log(chalk.bold.yellow('  ══════════════════════════════════════════'));
    console.log(DiffieHellman.demonstrate());

    // Module 5
    console.log(chalk.bold.yellow('\n  ══════════════════════════════════════════'));
    console.log(chalk.bold.yellow('  MODULE 5: ADVANCED THEORY'));
    console.log(chalk.bold.yellow('  ══════════════════════════════════════════'));
    console.log(ZeroKnowledgeProof.demonstrateColorBlind());

    // Module 6
    console.log(chalk.bold.yellow('\n  ══════════════════════════════════════════'));
    console.log(chalk.bold.yellow('  MODULE 6: CHALLENGES'));
    console.log(chalk.bold.yellow('  ══════════════════════════════════════════'));
    console.log(ProofOfWork.demonstrate());

    console.log(chalk.bold.cyan('\n  ══════════════════════════════════════════'));
    console.log(chalk.bold.cyan('  DEMONSTRATION COMPLETE'));
    console.log(chalk.bold.cyan('  ══════════════════════════════════════════\n'));
    console.log('  Use "crypto-lab --help" to explore all commands.');
    console.log('  Use "crypto-lab <command> --help" for command details.\n');
  });

// ═══════════════════════════════════════════════════════════════════════════
// BENCHMARKS
// ═══════════════════════════════════════════════════════════════════════════

program
  .command('benchmark')
  .description('Run performance benchmarks')
  .action(async () => {
    showBanner();

    console.log(chalk.bold.cyan('\n  ═══════════════════════════════════════════════'));
    console.log(chalk.bold.cyan('           PERFORMANCE BENCHMARKS'));
    console.log(chalk.bold.cyan('  ═══════════════════════════════════════════════\n'));

    // RNG benchmarks
    console.log(chalk.bold('  Random Number Generator Speeds:'));
    console.log(chalk.gray('  ' + '─'.repeat(50)));

    const generators = [
      { name: 'Math.random()', gen: () => Math.random() },
      { name: 'LCG', gen: new LCG().next.bind(new LCG()) },
      { name: 'Mersenne Twister', gen: new MersenneTwister().next.bind(new MersenneTwister()) },
      { name: 'ChaCha20', gen: new ChaCha20CSPRNG().next.bind(new ChaCha20CSPRNG()) },
      { name: 'crypto.randomBytes', gen: () => CryptoRandom.next() }
    ];

    const iterations = 1000000;

    for (const g of generators) {
      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        g.gen();
      }
      const elapsed = performance.now() - start;
      const opsPerSec = (iterations / elapsed) * 1000;

      console.log(`    ${g.name.padEnd(20)} ${chalk.cyan((opsPerSec / 1e6).toFixed(2))} M ops/sec`);
    }

    console.log('');

    // Hash benchmarks
    console.log(chalk.bold('  Hash Function Speeds:'));
    console.log(chalk.gray('  ' + '─'.repeat(50)));

    const hashFunctions = [
      { name: 'MD5', hash: (b: Buffer) => HashFunctions.md5(b) },
      { name: 'SHA-256', hash: (b: Buffer) => HashFunctions.sha256(b) },
      { name: 'SHA-512', hash: (b: Buffer) => HashFunctions.sha512(b) },
      { name: 'BLAKE2b', hash: (b: Buffer) => HashFunctions.blake2b(b) }
    ];

    const hashIterations = 100000;
    const testData = Buffer.alloc(64, 'x');

    for (const h of hashFunctions) {
      const start = performance.now();
      for (let i = 0; i < hashIterations; i++) {
        h.hash(testData);
      }
      const elapsed = performance.now() - start;
      const opsPerSec = (hashIterations / elapsed) * 1000;

      console.log(`    ${h.name.padEnd(20)} ${chalk.cyan((opsPerSec / 1e3).toFixed(2))} K hashes/sec`);
    }

    console.log('');
  });

// Default action - show help if no command provided
program.action(() => {
  showBanner();
  program.help();
});

program.parse(process.argv);
