# Crypto Entropy Lab

**Advanced Cryptographic Random Number Generator Research Platform**

A comprehensive educational CLI tool that explores randomness from practical implementation through computational complexity theory. Learn cryptography by doing - from basic PRNGs to zero-knowledge proofs.

```
  ██████╗██████╗ ██╗   ██╗██████╗ ████████╗ ██████╗
 ██╔════╝██╔══██╗╚██╗ ██╔╝██╔══██╗╚══██╔══╝██╔═══██╗
 ██║     ██████╔╝ ╚████╔╝ ██████╔╝   ██║   ██║   ██║
 ██║     ██╔══██╗  ╚██╔╝  ██╔═══╝    ██║   ██║   ██║
 ╚██████╗██║  ██║   ██║   ██║        ██║   ╚██████╔╝
  ╚═════╝╚═╝  ╚═╝   ╚═╝   ╚═╝        ╚═╝    ╚═════╝

 ███████╗███╗   ██╗████████╗██████╗  ██████╗ ██████╗ ██╗   ██╗
 ██╔════╝████╗  ██║╚══██╔══╝██╔══██╗██╔═══██╗██╔══██╗╚██╗ ██╔╝
 █████╗  ██╔██╗ ██║   ██║   ██████╔╝██║   ██║██████╔╝ ╚████╔╝
 ██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗██║   ██║██╔═══╝   ╚██╔╝
 ███████╗██║ ╚████║   ██║   ██║  ██║╚██████╔╝██║        ██║
 ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═╝        ╚═╝

 ██╗      █████╗ ██████╗
 ██║     ██╔══██╗██╔══██╗
 ██║     ███████║██████╔╝
 ██║     ██╔══██║██╔══██╗
 ███████╗██║  ██║██████╔╝
 ╚══════╝╚═╝  ╚═╝╚═════╝
```

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the full demonstration
npm start demo

# Or run specific modules
npm start entropy compare
npm start oneway avalanche
npm start security dh
```

## Modules

### Module 1: Entropy & Random Number Generators

Explores different sources of randomness and PRNG implementations.

```bash
crypto-lab entropy collect     # Collect entropy from multiple sources
crypto-lab entropy compare     # Compare RNG implementations
crypto-lab entropy visualize   # Visual demonstration of randomness
crypto-lab entropy stats       # Statistical analysis
crypto-lab entropy predictability # LCG predictability demo
```

**What you'll learn:**
- How computers generate "randomness"
- The difference between PRNG and CSPRNG
- Why Math.random() is dangerous for cryptography
- Statistical tests for randomness (chi-square, runs test, entropy)

**Implementations:**
- **Linear Congruential Generator (LCG)**: Classic weak PRNG
- **Mersenne Twister**: Better quality but still predictable
- **ChaCha20 CSPRNG**: Cryptographically secure stream cipher
- **Entropy Collection**: Timestamp, process info, system metrics

### Module 2: One-Way Functions & Reversibility

Demonstrates the fundamental difference between reversible math and cryptographic one-way functions.

```bash
crypto-lab oneway reversible  # Reversible math operations
crypto-lab oneway hash        # One-way hash functions
crypto-lab oneway rainbow     # Rainbow table attack
crypto-lab oneway avalanche   # Avalanche effect visualization
crypto-lab oneway timing      # Forward vs reverse timing
```

**What you'll learn:**
- Why some operations can be reversed (addition, XOR) and others can't (hashing)
- How rainbow tables work and how to defend against them
- The avalanche effect: why one bit change scrambles everything
- The asymmetry that makes cryptography possible

### Module 3: Computational Complexity Analysis

Implements attack strategies and visualizes time complexity.

```bash
crypto-lab complexity bruteforce  # Brute force complexity
crypto-lab complexity birthday    # Birthday paradox attack
crypto-lab complexity prediction  # PRNG prediction attack
crypto-lab complexity cracktime   # Time-to-crack estimates
crypto-lab complexity pvsnp       # P vs NP and cryptography
```

**What you'll learn:**
- Why O(2^n) makes brute force infeasible
- The birthday paradox and collision attacks
- How to predict weak PRNGs
- Time estimates from "microseconds" to "heat death of universe"
- Why P != NP is crucial for cryptography

### Module 4: Provable Security Demonstrations

Implements cryptographic primitives with provable security properties.

```bash
crypto-lab security dh           # Diffie-Hellman key exchange
crypto-lab security dlog         # Discrete logarithm problem
crypto-lab security reduction    # Security reductions explained
crypto-lab security reduction-sim # Reduction simulation
crypto-lab security elgamal      # El Gamal encryption
```

**What you'll learn:**
- How Diffie-Hellman establishes shared secrets
- Why discrete logarithm is hard
- What "provable security" really means
- How reduction proofs work

### Module 5: Advanced Theoretical Concepts

Explores the theoretical foundations of cryptography.

```bash
crypto-lab theory kolmogorov   # Kolmogorov complexity
crypto-lab theory halting      # Halting problem
crypto-lab theory zkp          # Zero-knowledge proofs
crypto-lab theory primality    # Miller-Rabin primality test
crypto-lab theory randomized   # Randomized algorithms
```

**What you'll learn:**
- How to measure "true randomness" (you can't fully!)
- Why some problems are undecidable
- How to prove knowledge without revealing it
- Probabilistic algorithms with bounded error

### Module 6: Interactive Challenges

Educational games demonstrating cryptographic concepts.

```bash
crypto-lab challenge crack-rng        # Try to predict the RNG
crypto-lab challenge human-random     # Human randomness test
crypto-lab challenge complexity-race  # O(n) vs O(2^n) race
crypto-lab challenge pnp              # P vs NP challenge
crypto-lab challenge pow              # Proof of work demo
```

## Theoretical Foundations

### Why Do One-Way Functions Exist?

One-way functions are functions that are:
1. **Easy to compute**: f(x) takes polynomial time
2. **Hard to invert**: Finding x from f(x) takes exponential time

**The honest answer: We don't know if they truly exist!**

The existence of one-way functions is equivalent to P != NP. No one has proven P != NP, so no one has proven one-way functions exist. However:

- Every candidate one-way function has resisted attack for decades
- If one-way functions don't exist, P = NP, which would have bizarre consequences
- Most cryptographers believe they exist based on overwhelming evidence

**Candidates:**
- Integer factorization: Easy to multiply, hard to factor
- Discrete logarithm: Easy to exponentiate, hard to find the exponent
- Hash functions: Designed to be one-way

### The P vs NP Connection

```
  P: Problems solvable in polynomial time
  NP: Problems verifiable in polynomial time

  P ⊆ NP (clearly true)
  P = NP? (the million dollar question)
```

**If P = NP:**
- All encryption becomes breakable in polynomial time
- Digital signatures become forgeable
- Cryptocurrencies become worthless
- Most of computer science needs rewriting

**If P != NP:**
- One-way functions exist
- Public-key cryptography is fundamentally secure
- Some problems are inherently hard
- The universe maintains its secrets

### Computational vs Information-Theoretic Security

**Computational Security:**
- "Secure against efficient adversaries"
- Based on hardness assumptions (factoring, discrete log)
- Could be broken with enough computation
- All practical cryptography uses this

**Information-Theoretic Security:**
- "Secure against ANY adversary, even with infinite compute"
- One-time pad achieves this
- Key must be as long as message
- Impractical for most applications

**Example:**
```
AES-256: Computationally secure
  - Would take 2^256 operations to brute force
  - "Secure" but not provably unbreakable

One-Time Pad: Information-theoretically secure
  - Given ciphertext, every plaintext is equally likely
  - Provably perfect secrecy
  - Requires perfectly random key as long as message
```

### Reduction Proofs and Provable Security

A reduction proof shows: "If you can break scheme A, you can solve hard problem B."

```
Break Diffie-Hellman → Solve Discrete Log
Break RSA Encryption → Factor Large Numbers
Break Digital Signatures → Find Hash Collisions
```

**This means:**
- Security of A is *at least* as hard as problem B
- We don't prove A is secure absolutely
- We prove security *relative to* a hardness assumption

**Typical reduction structure:**
1. Assume adversary A breaks scheme S with advantage ε
2. Construct algorithm B that uses A as a subroutine
3. Show B solves hard problem P with related advantage
4. Since P is believed hard, ε must be negligible
5. Therefore S is secure (under the hardness assumption)

### The Philosophical Question: Does Randomness Exist?

**Deterministic Universe View:**
> "Everything follows physical laws. Given perfect knowledge of initial conditions, the future is determined. 'Randomness' is just our ignorance."

**Quantum Mechanics View:**
> "Quantum events are fundamentally random. The universe is inherently probabilistic. No hidden variables can predict outcomes."

**Practical View:**
> "For cryptography, it doesn't matter! If we can't predict it efficiently, it's 'random enough' for security purposes."

**What we can say:**
- Kolmogorov complexity is uncomputable - we can't measure "true" randomness
- CSPRNGs produce output indistinguishable from random to efficient observers
- Physical entropy sources (thermal noise, quantum events) provide unpredictability
- Cryptographic security doesn't require philosophical certainty about randomness

## Architecture

```
src/
├── index.ts                    # CLI entry point
├── modules/
│   ├── entropy.ts              # RNG implementations
│   ├── one-way-functions.ts    # Hashing, reversibility
│   ├── complexity.ts           # Attack simulations
│   ├── provable-security.ts    # DH, El Gamal, reductions
│   ├── advanced-theory.ts      # Kolmogorov, ZKP, etc.
│   └── challenges.ts           # Interactive games
└── utils/
    ├── visualization.ts        # ASCII graphs, colors
    └── statistics.ts           # Chi-square, entropy tests
```

## Key Concepts Demonstrated

| Concept | Module | Command |
|---------|--------|---------|
| PRNG vs CSPRNG | 1 | `entropy compare` |
| Chi-Square Test | 1 | `entropy stats` |
| Avalanche Effect | 2 | `oneway avalanche` |
| Rainbow Tables | 2 | `oneway rainbow` |
| Birthday Attack | 3 | `complexity birthday` |
| Time Complexity | 3 | `complexity bruteforce` |
| Diffie-Hellman | 4 | `security dh` |
| Discrete Log | 4 | `security dlog` |
| Zero-Knowledge | 5 | `theory zkp` |
| Miller-Rabin | 5 | `theory primality` |
| Proof of Work | 6 | `challenge pow` |

## Educational Goals

After using this tool, you should understand:

1. **Randomness**: Why true randomness is hard, how PRNGs work, and when to use CSPRNGs
2. **One-Way Functions**: The asymmetry between computing and inverting
3. **Complexity**: Why exponential time makes brute force impossible
4. **Provable Security**: What "mathematically proven secure" actually means
5. **P vs NP**: Why this open problem underlies all cryptography
6. **Practical Attacks**: Rainbow tables, birthday attacks, state recovery

## Further Reading

### Books
- *Introduction to Modern Cryptography* by Katz and Lindell
- *A Graduate Course in Applied Cryptography* by Boneh and Shoup (free online)
- *Cryptography Made Simple* by Smart

### Papers
- "New Directions in Cryptography" - Diffie and Hellman (1976)
- "A Mathematical Theory of Communication" - Shannon (1948)
- "How to Construct Random Functions" - Goldreich, Goldwasser, Micali (1984)

### Online Resources
- [Cryptopals Challenges](https://cryptopals.com/)
- [Dan Boneh's Cryptography Course](https://crypto.stanford.edu/~dabo/courses/OnlineCrypto/)
- [The Complexity Zoo](https://complexityzoo.net/)

## License

MIT License - Use this for education and research.

## Contributing

Contributions welcome! Areas that could use expansion:
- More attack simulations
- Elliptic curve cryptography module
- Post-quantum cryptography demonstrations
- Interactive web interface

---

*"Anyone can build a cryptographic system that he himself cannot break. This does not mean that the system is secure."* - Bruce Schneier
