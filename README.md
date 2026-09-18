# Key Generation in DES Algorithm — Virtual Lab Module

Group submission for the CSS Virtual Lab (Cryptography) assignment.

**Assigned experiment:** Key generation in DES algorithm — demonstrate generation
of the round-keys.

This repository contains only this group's self-contained experiment module,
built to the shared `experiment-template/` structure and folder conventions
specified by the integration team, so it can be dropped into the main
`cryptography-virtual-lab` application without modification.

## Structure

```
.
├── experiments/
│   └── DES-key/          # the actual experiment module (submission deliverable)
│       ├── index.html
│       ├── script.js
│       ├── style.css
│       └── README.md     # integration README (per the shared template format)
├── demo/
│   └── index.html        # standalone preview shell to view the module on its own
└── docs/
    ├── test-vectors.md   # test cases + expected outputs
    └── quiz-bank.md       # quiz questions, in readable form
```

## Running it

No build step or server required — everything is static HTML/CSS/JS with no
external libraries or CDN dependencies.

- **View the experiment directly:** open `experiments/DES-key/index.html` in a browser.
- **View it inside a demo shell** (mimics how it'll look once integrated): open `demo/index.html`.

## What it demonstrates

Given a 64-bit DES key (16 hex digits), the module walks through the full
key schedule used to derive DES's sixteen 48-bit round keys:

1. Highlighting the 8 parity bits in the original 64-bit key.
2. Applying **PC-1** to produce the 56-bit permuted key.
3. Splitting into 28-bit halves **C0** / **D0**.
4. Applying the per-round left-circular-shift schedule (1 or 2 bits) and
   **PC-2** across all 16 rounds, with a round-by-round detail view.
5. An interactive quiz (fixed MCQs + questions computed from the user's own key).

See `docs/test-vectors.md` for correctness verification against the standard
textbook test vector.
