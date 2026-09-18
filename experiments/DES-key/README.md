# Integration README

**Group:** DES Key Generation

**Experiment ID:** EXP-DES-KEY

**Experiment Name:** Key Generation in the DES Algorithm

**Folder:** `/experiments/DES-key/`

**Entry File:**
```
index.html
```

**Navigation Title:**
```
Key Generation in DES Algorithm
```

**Short Description:**
```
Demonstrate generation of the 16 DES round-keys from a 64-bit key via PC-1,
per-round left shifts, and PC-2.
```

**Required Libraries:**
```
None
```

**Input:**
```
64-bit DES key, entered as 16 hexadecimal digits (0-9, A-F)
```

**Output:**
```
16 round keys (K1 ... K16), each 48 bits, shown in binary and hexadecimal,
plus the intermediate PC-1 output and per-round C/D states.
```

**Expected Navigation Link:**
```
/experiments/DES-key/
```

## Files in this module

| File | Purpose |
|---|---|
| `index.html` | Experiment page: aim, theory, procedure, simulation, quiz, references |
| `style.css` | Module-scoped styles; theme colors exposed as CSS custom properties on `#exp-des-key` so the integration shell can override them without editing this file |
| `script.js` | DES key-schedule engine (PC-1, PC-2, shift schedule) + all UI wiring + quiz logic |

## Notes for the integration team

- The module is fully self-contained: it does not read or write any global state, does not
  assume any particular page shell, and only touches elements inside `#exp-des-key`.
- `script.js` exposes its core functions on `window.DESKeySchedule` (for reuse by other
  DES-related experiments, e.g. DES encryption/decryption, if useful) but does not require
  or depend on anything outside this folder.
- A console self-test runs on page load, checking the computed K1 for the classic textbook
  key `133457799BBCDFF1` against its known value. See `docs/test-vectors.md` at the repo root
  for the full set of test cases and expected outputs.
- No external libraries or CDN dependencies are used.
