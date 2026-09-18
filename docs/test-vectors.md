# Test Vectors & Expected Outputs — DES Key Generation

These test cases were used to verify `experiments/DES-key/script.js` and can be
reused by anyone checking the module (integration testing, faculty demo, etc.).
All values were produced by the module's own `generateKeySchedule()` and
cross-checked against the classic textbook example (key `133457799BBCDFF1`),
which appears in Stallings' *Cryptography and Network Security* and is the
standard worked example for the DES key schedule.

## Test 1 — Classic textbook key

**Input key (hex):** `133457799BBCDFF1`

**PC-1 output (56 bits):**
```
11110000110011001010101011110101010101100110011110001111
```

**C0:** `1111000011001100101010101111`
**D0:** `0101010101100110011110001111`

**All 16 round keys:**

| Round | Shift | Round key (hex) |
|---|---|---|
| K1  | 1 | `1B02EFFC7072` |
| K2  | 1 | `79AED9DBC9E5` |
| K3  | 2 | `55FC8A42CF99` |
| K4  | 2 | `72ADD6DB351D` |
| K5  | 2 | `7CEC07EB53A8` |
| K6  | 2 | `63A53E507B2F` |
| K7  | 2 | `EC84B7F618BC` |
| K8  | 2 | `F78A3AC13BFB` |
| K9  | 1 | `E0DBEBEDE781` |
| K10 | 2 | `B1F347BA464F` |
| K11 | 2 | `215FD3DED386` |
| K12 | 2 | `7571F59467E9` |
| K13 | 2 | `97C5D1FABA41` |
| K14 | 2 | `5F43B7F2E73A` |
| K15 | 2 | `BF918D3D3F0A` |
| K16 | 1 | `CB3D8B0E17F5` |

K1 (binary) is independently verified against the published textbook value:
```
000110 110000 001011 101111 111111 000111 000001 110010
```
This matches the module's computed K1 bit-for-bit, confirming PC-1, the
split into C0/D0, the first left-shift, and PC-2 are all implemented correctly.

## Test 2 — All-zero key (edge case)

**Input key (hex):** `0000000000000000`

**Expected:** every round key is `000000000000` (48 zero bits), since PC-1
and PC-2 are pure bit-selection permutations — an all-zero input can only
ever select zero bits, regardless of the shift schedule.

**Result:** matches expected for all 16 rounds.

## Test 3 — All-ones key (edge case)

**Input key (hex):** `FFFFFFFFFFFFFFFF`

**Expected:** every round key is `FFFFFFFFFFFF` (48 one bits), for the same
reason as Test 2.

**Result:** matches expected for all 16 rounds.

## Test 4 — Invalid input handling

| Input | Expected behavior |
|---|---|
| `""` (empty) | "Generate Round Keys" shows inline error, does not crash |
| `"133457799BBCDFF"` (15 hex digits) | Rejected — must be exactly 16 hex digits |
| `"133457799BBCDFFG"` (invalid hex char `G`) | Rejected by input filtering / validation |
| `"133457799bbcdff1"` (lowercase) | Accepted — input is case-insensitive |

## How to re-run these checks

Open a browser console on `experiments/DES-key/index.html` and run:

```js
window.DESKeySchedule.generateKeySchedule("133457799BBCDFF1")
```

The page also runs a self-test automatically on load and logs
`PASS`/`FAIL` to the console for the Test 1 key.
