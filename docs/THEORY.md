# Theoretical Foundations

This document provides a deep dive into the computer science theory underlying this cryptographic research platform.

## Table of Contents

1. [Entropy and Information Theory](#entropy-and-information-theory)
2. [One-Way Functions](#one-way-functions)
3. [Computational Complexity](#computational-complexity)
4. [The P vs NP Problem](#the-p-vs-np-problem)
5. [Provable Security](#provable-security)
6. [Randomness and Kolmogorov Complexity](#randomness-and-kolmogorov-complexity)
7. [Zero-Knowledge Proofs](#zero-knowledge-proofs)

---

## Entropy and Information Theory

### Shannon Entropy

Claude Shannon defined entropy in 1948 as a measure of information content:

```
H(X) = -Σ p(x) log₂ p(x)
```

For a uniform distribution over n outcomes: H = log₂(n) bits

**Interpretation:**
- Maximum entropy = maximum unpredictability = ideal randomness
- A fair coin has entropy of 1 bit
- A biased coin (70% heads) has entropy of 0.88 bits
- A deterministic source has entropy of 0 bits

### Min-Entropy

For cryptography, we care about the *worst case*, not average case:

```
H_∞(X) = -log₂(max_x p(x))
```

**Why min-entropy matters:**
- An adversary targets the most likely outcome
- Even if average entropy is high, one likely value ruins security
- CSPRNGs should have high min-entropy

### Sources of Entropy

| Source | Quality | Notes |
|--------|---------|-------|
| CPU timing | Low | Predictable patterns |
| Keyboard timing | Medium | User-dependent |
| Mouse movement | Medium | User-dependent |
| Disk I/O timing | Medium | Somewhat predictable |
| Thermal noise | High | Hardware-dependent |
| Quantum sources | Very High | True randomness |
| `/dev/urandom` | High | OS entropy pool |

---

## One-Way Functions

### Formal Definition

A function f: {0,1}* → {0,1}* is one-way if:

1. **Easy to compute**: There exists a polynomial-time algorithm that computes f(x) for all x
2. **Hard to invert**: For every PPT algorithm A:
   ```
   Pr[f(A(f(x))) = f(x)] ≤ negl(n)
   ```
   where x is chosen uniformly at random and negl(n) is negligible

### Candidate One-Way Functions

**Integer Factorization:**
```
f(p, q) = p × q
```
- Easy: Multiplication is O(n²) or better
- Hard: Best known factoring is sub-exponential O(exp(n^(1/3)))

**Discrete Logarithm:**
```
f(x) = g^x mod p
```
- Easy: Square-and-multiply is O(n³)
- Hard: Best known is sub-exponential (general) or O(√n) (BSGS)

**Cryptographic Hash Functions:**
```
f(x) = SHA-256(x)
```
- Easy: Compression function iterations
- Hard: No known efficient preimage attack

### The Existence Question

> **Theorem (Impagliazzo-Luby)**: One-way functions exist if and only if P ≠ NP.

This is one of the most important results in theoretical cryptography. It means:
- We can't prove one-way functions exist (without proving P ≠ NP)
- We can't prove they don't exist (without proving P = NP)
- All of cryptography rests on an unproven assumption

---

## Computational Complexity

### Complexity Classes

**P (Polynomial Time):**
- Problems solvable in O(n^k) for some constant k
- Examples: Sorting, matrix multiplication, primality testing

**NP (Nondeterministic Polynomial):**
- Problems where solutions are verifiable in polynomial time
- Examples: SAT, graph coloring, subset sum, factoring

**NP-Complete:**
- The "hardest" problems in NP
- If any NP-complete problem is in P, then P = NP
- Examples: SAT, 3-SAT, Hamiltonian path, subset sum

**NP-Hard:**
- At least as hard as NP-complete
- May not be in NP
- Example: Halting problem

### Key Relationships

```
P ⊆ NP ⊆ PSPACE ⊆ EXPTIME

NP-complete: The "apex" of NP
co-NP: Complements of NP problems
BPP: Bounded-error probabilistic polynomial
```

### Cryptographic Relevance

| Problem | Class | Cryptographic Use |
|---------|-------|-------------------|
| Integer Factoring | NP ∩ co-NP | RSA |
| Discrete Log | NP ∩ co-NP | Diffie-Hellman, ECDSA |
| Subset Sum | NP-complete | Knapsack cryptosystems |
| 3-Coloring | NP-complete | Zero-knowledge proofs |
| SAT | NP-complete | Proof systems |

---

## The P vs NP Problem

### The Question

> Does every problem whose solution can be verified quickly also be solved quickly?

Formally: Is every language in NP also in P?

### Why It Matters for Cryptography

**If P = NP:**
```
1. RSA broken in polynomial time
2. AES key recovery in polynomial time
3. Digital signatures forgeable
4. All public-key cryptography fails
5. Password hashing useless
6. Blockchain consensus broken
```

**If P ≠ NP:**
```
1. One-way functions exist
2. Pseudorandom generators exist
3. Secure encryption is possible
4. Digital signatures are possible
5. Zero-knowledge proofs are possible
6. Secure multi-party computation is possible
```

### Evidence for P ≠ NP

1. **50+ years of failure**: Brilliant minds have tried and failed to find polynomial algorithms
2. **Natural problems are hard**: NP-complete problems arise naturally in many domains
3. **Cryptographic constructions work**: If P = NP, we'd expect to see breaks
4. **Randomization doesn't help much**: BPP is believed to equal P
5. **Circuit lower bounds**: Some weak separations are proven

### The Philosophical Implications

> "If P = NP, then the world would be a profoundly different place than we usually assume it to be. There would be no special value in 'creative leaps,' no fundamental gap between solving a problem and recognizing the solution once it's found." - Scott Aaronson

---

## Provable Security

### What Does "Proven Secure" Mean?

It does NOT mean:
- ✗ The scheme is absolutely unbreakable
- ✗ No attack will ever work
- ✗ The math is definitely correct

It DOES mean:
- ✓ Security reduces to a well-studied hardness assumption
- ✓ Breaking the scheme implies solving a believed-hard problem
- ✓ The reduction is tight (preserving security level)

### Anatomy of a Security Proof

```
Theorem: Scheme S is (t, ε)-secure under assumption A.

Proof:
1. Assume adversary M breaks S with advantage ε in time t
2. Construct algorithm R that uses M to solve problem A
3. Show R runs in time t' related to t
4. Show R solves A with probability ε' related to ε
5. Since A is believed hard, conclude S is secure

The "tightness" is the relationship between (t, ε) and (t', ε')
```

### Common Hardness Assumptions

| Assumption | Description | Used In |
|------------|-------------|---------|
| Factoring | Large numbers are hard to factor | RSA |
| RSA | Computing e-th roots mod N is hard | RSA |
| CDH | Computing g^(ab) from g^a, g^b is hard | Diffie-Hellman |
| DDH | g^(ab) is indistinguishable from random | ElGamal, IND-CPA |
| LWE | Learning with errors is hard | Post-quantum crypto |
| SXDH | Symmetric XDH in bilinear groups | Pairing-based crypto |

### Security Definitions

**IND-CPA (Indistinguishability under Chosen Plaintext Attack):**
```
Experiment IND-CPA:
1. Adversary chooses m₀, m₁
2. Challenger encrypts mₓ for random bit b
3. Adversary outputs guess b'
4. Adversary wins if b' = b

Scheme is IND-CPA secure if advantage |Pr[b'=b] - 1/2| is negligible
```

**IND-CCA2 (Adaptive Chosen Ciphertext Attack):**
- Adversary can also request decryptions
- Except for the challenge ciphertext
- Stronger and harder to achieve

---

## Randomness and Kolmogorov Complexity

### Kolmogorov Complexity

The Kolmogorov complexity K(x) of string x is the length of the shortest program that outputs x.

**Examples:**
```
K("AAAA...A" 1000 times) ≈ O(log 1000) = O(10 bits)
  → "print 'A' repeated 1000 times"

K(random 1000 bits) ≈ 1000 bits
  → No compression possible; must output literally
```

### Incompressibility as Randomness

A string is **Kolmogorov random** if K(x) ≥ |x| - O(1).

**Key insight:** Most strings are Kolmogorov random!
- There are 2^n strings of length n
- Only 2^(n-1) programs of length < n
- Most strings can't be compressed

### The Uncomputability

> **Theorem**: Kolmogorov complexity is uncomputable.

Proof sketch (Chaitin):
- Assume K(x) is computable
- Find the first x with K(x) > n (for large n)
- This x was found by a program of length O(log n)
- But K(x) > n, contradiction!

### Practical Implications

- We can't measure "true randomness"
- We can only approximate with compression
- CSPRNGs produce "pseudo-random" strings that appear Kolmogorov random
- Statistical tests check for patterns, not true randomness

---

## Zero-Knowledge Proofs

### The Three Properties

1. **Completeness**: If the statement is true, an honest prover convinces an honest verifier
2. **Soundness**: If the statement is false, no cheating prover can convince the verifier (except with negligible probability)
3. **Zero-Knowledge**: The verifier learns nothing beyond the truth of the statement

### Interactive Proof System

```
Protocol for Graph 3-Coloring:

Prover knows: Valid 3-coloring of graph G
Verifier knows: Graph G

Repeat k times:
  1. Prover randomly permutes colors and commits to each vertex
  2. Verifier chooses random edge (u, v)
  3. Prover opens commitments for u and v
  4. Verifier checks colors are different

Soundness: If coloring is invalid, at least one edge has same color
           Probability of detection per round ≥ 1/|E|
           After k rounds: Pr[cheat] ≤ (1 - 1/|E|)^k

Zero-Knowledge: Each round reveals two random colors
                Random permutation means these reveal nothing about actual coloring
```

### Non-Interactive Zero-Knowledge (NIZK)

Using the Fiat-Shamir heuristic:
1. Prover generates commitment
2. Hash of commitment = verifier's "challenge"
3. Prover computes response
4. Single message, non-interactive

**Caveat:** Security proved in Random Oracle Model

### Applications

| Application | Use of ZKP |
|-------------|------------|
| Zcash | Prove transaction validity without revealing amounts |
| zkSNARKs | Succinct proofs of computation |
| Authentication | Prove identity without revealing password |
| Voting | Prove vote validity without revealing choice |
| Credentials | Prove attribute (age > 18) without revealing identity |

---

## Conclusion: The Beautiful Uncertainty

Cryptography is built on a foundation of uncertainty:

1. **We don't know if P ≠ NP** → We don't know if security is possible
2. **We don't know if one-way functions exist** → We don't know if encryption can work
3. **We can't compute Kolmogorov complexity** → We can't measure true randomness
4. **We can't solve the halting problem** → We can't verify all security properties

And yet, cryptography works. Every day, billions of transactions are secured by systems we can't prove are secure. This is either:
- A testament to the robustness of our assumptions
- An accident waiting to be discovered
- Both

The honest answer is: we don't know which. But after 50 years of the smartest people trying to break these assumptions, we have reasonable confidence. Not certainty—cryptography deals in probabilities, not absolutes—but enough confidence to build a digital civilization upon.

> "The universe is not only queerer than we suppose, but queerer than we can suppose." - J.B.S. Haldane

Perhaps the same is true of randomness, complexity, and the nature of computation itself.
