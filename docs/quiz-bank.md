# Quiz Bank — DES Key Generation

These questions are implemented live in `experiments/DES-key/script.js`
(`QUIZ_MCQS` and `buildComputedQuestions`). Listed here in readable form
for review/documentation purposes, per the submission checklist.

## Fixed multiple-choice questions

1. **What does Permuted Choice 1 (PC-1) do to the original 64-bit DES key?**
   - Drops the 8 parity bits and permutes the remaining 56 bits ✅
   - Expands the key from 56 bits to 64 bits
   - Encrypts the key using the S-boxes
   - Splits the key into 16 separate round keys directly

2. **How many bits does a single DES round key (Ki) contain?**
   - 56 bits
   - 64 bits
   - 48 bits ✅
   - 32 bits

3. **Every round, C and D (28 bits each) are combined and permuted by which table to produce the round key?**
   - PC-1
   - PC-2 ✅
   - The Expansion (E) table
   - The Initial Permutation (IP)

4. **In the DES key schedule, how many bit positions are the parity bits (dropped by PC-1)?**
   - Every 4th bit
   - Every 7th bit
   - Every 8th bit ✅
   - Every 16th bit

5. **How many round keys does the DES key schedule generate in total?**
   - 8
   - 12
   - 16 ✅
   - 32

6. **In rounds 1, 2, 9, and 16, C and D are left-shifted by how many bits?**
   - 0 bits
   - 1 bit ✅
   - 2 bits
   - 3 bits

7. **What are C0 and D0?**
   - The left and right 28-bit halves of the 56-bit key produced by PC-1 ✅
   - The two halves of the 64-bit plaintext block
   - The first and last round keys
   - The S-box outputs for round 1

## Computed questions (answer depends on the user's own key)

8. **"Using the key you entered (`<KEY>`), what is round key K5 in hexadecimal?"**
   Answer: read directly from the live simulation's round-key table for the
   user's current key (validated against `generateKeySchedule()`, not a
   fixed value).

9. **"Using the key you entered (`<KEY>`), how many bits was C/D left-shifted before producing round key K12?"**
   Answer: always `2`, per the standard DES shift schedule — but phrased so
   the user must locate round 12 in their own table to answer confidently.

For example, with the sample key `133457799BBCDFF1`:
- Q8 answer: `7CEC07EB53A8`
- Q9 answer: `2`
