/* ==========================================================================
   DES Key Schedule (Round-Key Generation) — core engine + UI wiring
   Standard textbook DES tables (PC-1, PC-2, per-round left-shift schedule).
   No external libraries.
   ========================================================================== */

/* ---------------------------------------------------------------------- */
/* 1. Standard DES key-schedule tables                                     */
/* ---------------------------------------------------------------------- */

// Permuted Choice 1: 64-bit key -> 56-bit key (drops the 8 parity bits).
// Values are 1-indexed bit positions into the original 64-bit key.
const PC1 = [
  57, 49, 41, 33, 25, 17, 9,
  1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27,
  19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
  7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29,
  21, 13, 5, 28, 20, 12, 4,
];

// Permuted Choice 2: 56-bit (C_i || D_i) -> 48-bit round key.
const PC2 = [
  14, 17, 11, 24, 1, 5,
  3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8,
  16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32,
];

// Left-circular-shift amount applied to C and D before each round (1..16).
const SHIFT_SCHEDULE = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

// Bit positions (1-indexed, within the 64-bit key) that are parity bits —
// i.e. every 8th bit, and therefore absent from PC1's output list.
const PARITY_BIT_POSITIONS = [8, 16, 24, 32, 40, 48, 56, 64];

const SAMPLE_KEY_HEX = "133457799BBCDFF1";

/* ---------------------------------------------------------------------- */
/* 2. Bit-string helpers                                                   */
/* ---------------------------------------------------------------------- */

function hexToBits(hex) {
  hex = hex.trim().toUpperCase();
  let bits = "";
  for (const ch of hex) {
    const val = parseInt(ch, 16);
    bits += val.toString(2).padStart(4, "0");
  }
  return bits;
}

function bitsToHex(bits) {
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = bits.slice(i, i + 4).padEnd(4, "0");
    hex += parseInt(nibble, 2).toString(16).toUpperCase();
  }
  return hex;
}

// Apply a permutation/selection table (1-indexed positions into `bits`).
function permute(bits, table) {
  let out = "";
  for (const pos of table) out += bits[pos - 1];
  return out;
}

function leftShift(bits, amount) {
  return bits.slice(amount) + bits.slice(0, amount);
}

function isValidHexKey(hex) {
  return /^[0-9A-Fa-f]{16}$/.test(hex.trim());
}

/* ---------------------------------------------------------------------- */
/* 3. Key-schedule computation                                             */
/* ---------------------------------------------------------------------- */

// Returns the full derivation trace for a 16-hex-digit (64-bit) key:
// { keyHex, keyBits, permutedKey56, rounds: [ {round, cPrev, dPrev, shift,
//   c, d, cd56, roundKeyBits48, roundKeyHex} , ... ] }
function generateKeySchedule(keyHex) {
  if (!isValidHexKey(keyHex)) {
    throw new Error("Key must be exactly 16 hexadecimal digits (64 bits).");
  }
  const keyBits = hexToBits(keyHex.trim());
  const permutedKey56 = permute(keyBits, PC1);

  let c = permutedKey56.slice(0, 28);
  let d = permutedKey56.slice(28, 56);

  const rounds = [];
  for (let i = 0; i < 16; i++) {
    const shift = SHIFT_SCHEDULE[i];
    const cPrev = c;
    const dPrev = d;
    c = leftShift(c, shift);
    d = leftShift(d, shift);
    const cd56 = c + d;
    const roundKeyBits48 = permute(cd56, PC2);
    rounds.push({
      round: i + 1,
      cPrev,
      dPrev,
      shift,
      c,
      d,
      cd56,
      roundKeyBits48,
      roundKeyHex: bitsToHex(roundKeyBits48),
    });
  }

  return {
    keyHex: keyHex.trim().toUpperCase(),
    keyBits,
    permutedKey56,
    c0: permutedKey56.slice(0, 28),
    d0: permutedKey56.slice(28, 56),
    rounds,
  };
}

function randomKeyHex() {
  let hex = "";
  for (let i = 0; i < 16; i++) hex += Math.floor(Math.random() * 16).toString(16);
  return hex.toUpperCase();
}

/* ---------------------------------------------------------------------- */
/* 4. Quiz bank                                                            */
/* ---------------------------------------------------------------------- */
/* Fixed-answer MCQs; two extra questions are generated per current key    */
/* schedule state so their answers depend on what the user entered.        */

const QUIZ_MCQS = [
  {
    q: "What does Permuted Choice 1 (PC-1) do to the original 64-bit DES key?",
    options: [
      "Drops the 8 parity bits and permutes the remaining 56 bits",
      "Expands the key from 56 bits to 64 bits",
      "Encrypts the key using the S-boxes",
      "Splits the key into 16 separate round keys directly",
    ],
    answer: 0,
  },
  {
    q: "How many bits does a single DES round key (Kᵢ) contain?",
    options: ["56 bits", "64 bits", "48 bits", "32 bits"],
    answer: 2,
  },
  {
    q: "Every round, C and D (28 bits each) are combined and permuted by which table to produce the round key?",
    options: ["PC-1", "PC-2", "The Expansion (E) table", "The Initial Permutation (IP)"],
    answer: 1,
  },
  {
    q: "In the DES key schedule, how many bit positions are the parity bits (dropped by PC-1)?",
    options: ["Every 4th bit", "Every 7th bit", "Every 8th bit", "Every 16th bit"],
    answer: 2,
  },
  {
    q: "How many round keys does the DES key schedule generate in total?",
    options: ["8", "12", "16", "32"],
    answer: 2,
  },
  {
    q: "In rounds 1, 2, 9, and 16, C and D are left-shifted by how many bits?",
    options: ["0 bits", "1 bit", "2 bits", "3 bits"],
    answer: 1,
  },
  {
    q: "What are C₀ and D₀?",
    options: [
      "The left and right 28-bit halves of the 56-bit key produced by PC-1",
      "The two halves of the 64-bit plaintext block",
      "The first and last round keys",
      "The S-box outputs for round 1",
    ],
    answer: 0,
  },
];

// Feedback comment shown alongside the score, based on percentage correct.
function scoreComment(correct, total) {
  const pct = (correct / total) * 100;
  if (pct === 100) return "Perfect score! You've fully grasped the DES key schedule.";
  if (pct >= 80) return "Excellent work — you have a strong understanding of the DES key schedule.";
  if (pct >= 60) return "Good effort. Revisit PC-1, PC-2, and the shift schedule to firm up the parts you missed.";
  if (pct >= 40) return "Fair attempt — re-read the Theory section, then try generating a new key and retake the quiz.";
  return "Needs improvement — work through the Theory and Procedure sections again before retrying the quiz.";
}

// Build 2 questions whose correct answer depends on the current schedule.
function buildComputedQuestions(schedule) {
  const r5 = schedule.rounds[4];
  const r12 = schedule.rounds[11];
  return [
    {
      q: `Using the key you entered (${schedule.keyHex}), what is round key K5 in hexadecimal?`,
      type: "text",
      answer: r5.roundKeyHex,
    },
    {
      q: `Using the key you entered (${schedule.keyHex}), how many bits was C/D left-shifted before producing round key K12?`,
      type: "text",
      answer: String(r12.shift),
    },
  ];
}

/* ---------------------------------------------------------------------- */
/* 5. Known-answer self-test (runs once on load, logs to console)          */
/* ---------------------------------------------------------------------- */

function runSelfTest() {
  // Classic textbook test vector for key 133457799BBCDFF1.
  const expectedK1 = "000110110000001011101111111111000111000001110010";
  const schedule = generateKeySchedule(SAMPLE_KEY_HEX);
  const ok = schedule.rounds[0].roundKeyBits48 === expectedK1;
  console.log(
    ok
      ? "[DES key-schedule self-test] PASS: K1 matches known textbook value."
      : "[DES key-schedule self-test] FAIL: K1 does not match expected value."
  );
  return ok;
}

/* ---------------------------------------------------------------------- */
/* 6. UI wiring                                                             */
/* ---------------------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  runSelfTest();

  const keyInput = document.getElementById("key-input");
  const generateBtn = document.getElementById("generate-btn");
  const sampleBtn = document.getElementById("sample-btn");
  const randomBtn = document.getElementById("random-btn");
  const errorBox = document.getElementById("key-error");

  const stagesSection = document.getElementById("stages-section");
  const keyBitsEl = document.getElementById("key-bits-display");
  const permutedKeyEl = document.getElementById("permuted-key-display");
  const c0El = document.getElementById("c0-display");
  const d0El = document.getElementById("d0-display");

  const roundsTableBody = document.querySelector("#rounds-table tbody");
  const roundDetail = document.getElementById("round-detail");
  const prevRoundBtn = document.getElementById("prev-round-btn");
  const nextRoundBtn = document.getElementById("next-round-btn");
  const roundIndicator = document.getElementById("round-indicator");

  let currentSchedule = null;
  let currentRoundIdx = 0;

  function renderParityHighlightedBits(bits) {
    let html = "";
    for (let i = 0; i < bits.length; i++) {
      const pos = i + 1;
      const isParity = PARITY_BIT_POSITIONS.includes(pos);
      html += `<span class="bit${isParity ? " bit-parity" : ""}" title="bit ${pos}${
        isParity ? " (parity, dropped by PC-1)" : ""
      }">${bits[i]}</span>`;
    }
    return html;
  }

  function renderPlainBits(bits) {
    return bits
      .split("")
      .map((b) => `<span class="bit">${b}</span>`)
      .join("");
  }

  function renderRoundsTable(schedule) {
    roundsTableBody.innerHTML = "";
    schedule.rounds.forEach((r) => {
      const tr = document.createElement("tr");
      tr.dataset.round = r.round;
      tr.innerHTML = `
        <td>${r.round}</td>
        <td>${r.shift}</td>
        <td class="mono">${r.roundKeyHex}</td>
        <td><button type="button" class="link-btn view-round-btn" data-round="${r.round}">View</button></td>
      `;
      roundsTableBody.appendChild(tr);
    });
  }

  function renderRoundDetail(idx) {
    const r = currentSchedule.rounds[idx];
    roundIndicator.textContent = `Round ${r.round} of 16`;
    roundDetail.innerHTML = `
      <h4>Round ${r.round} &mdash; left shift by ${r.shift} bit${r.shift > 1 ? "s" : ""}</h4>
      <div class="bit-row"><span class="bit-label">C${r.round - 1}</span><div class="bit-string">${renderPlainBits(
      r.cPrev
    )}</div></div>
      <div class="bit-row"><span class="bit-label">D${r.round - 1}</span><div class="bit-string">${renderPlainBits(
      r.dPrev
    )}</div></div>
      <div class="shift-arrow">&#8595; left-shift ${r.shift} &#8595;</div>
      <div class="bit-row"><span class="bit-label">C${r.round}</span><div class="bit-string">${renderPlainBits(
      r.c
    )}</div></div>
      <div class="bit-row"><span class="bit-label">D${r.round}</span><div class="bit-string">${renderPlainBits(
      r.d
    )}</div></div>
      <div class="bit-row"><span class="bit-label">C${r.round}||D${r.round}</span><div class="bit-string">${renderPlainBits(
      r.cd56
    )}</div></div>
      <div class="shift-arrow">&#8595; PC-2 (56 &rarr; 48 bits) &#8595;</div>
      <div class="bit-row"><span class="bit-label">K${r.round}</span><div class="bit-string">${renderPlainBits(
      r.roundKeyBits48
    )}</div></div>
      <p class="round-hex">K${r.round} (hex): <span class="mono">${r.roundKeyHex}</span></p>
    `;

    document.querySelectorAll("#rounds-table tbody tr").forEach((tr) => {
      tr.classList.toggle("active-row", Number(tr.dataset.round) === r.round);
    });

    prevRoundBtn.disabled = idx === 0;
    nextRoundBtn.disabled = idx === currentSchedule.rounds.length - 1;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.hidden = !msg;
  }

  function runGeneration() {
    const raw = keyInput.value;
    if (!isValidHexKey(raw)) {
      showError("Please enter exactly 16 hexadecimal digits (0-9, A-F) for the 64-bit key.");
      stagesSection.hidden = true;
      return;
    }
    showError("");

    currentSchedule = generateKeySchedule(raw);
    currentRoundIdx = 0;

    keyBitsEl.innerHTML = renderParityHighlightedBits(currentSchedule.keyBits);
    permutedKeyEl.innerHTML = renderPlainBits(currentSchedule.permutedKey56);
    c0El.innerHTML = renderPlainBits(currentSchedule.c0);
    d0El.innerHTML = renderPlainBits(currentSchedule.d0);

    renderRoundsTable(currentSchedule);
    renderRoundDetail(0);

    stagesSection.hidden = false;
    stagesSection.scrollIntoView({ behavior: "smooth", block: "start" });

    renderQuiz(currentSchedule);
  }

  generateBtn.addEventListener("click", runGeneration);

  sampleBtn.addEventListener("click", () => {
    keyInput.value = SAMPLE_KEY_HEX;
    runGeneration();
  });

  randomBtn.addEventListener("click", () => {
    keyInput.value = randomKeyHex();
    runGeneration();
  });

  keyInput.addEventListener("input", () => {
    keyInput.value = keyInput.value.toUpperCase().replace(/[^0-9A-F]/g, "").slice(0, 16);
  });

  roundsTableBody.addEventListener("click", (e) => {
    const btn = e.target.closest(".view-round-btn");
    if (!btn) return;
    currentRoundIdx = Number(btn.dataset.round) - 1;
    renderRoundDetail(currentRoundIdx);
    roundDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  prevRoundBtn.addEventListener("click", () => {
    if (currentRoundIdx > 0) {
      currentRoundIdx--;
      renderRoundDetail(currentRoundIdx);
    }
  });

  nextRoundBtn.addEventListener("click", () => {
    if (currentRoundIdx < 15) {
      currentRoundIdx++;
      renderRoundDetail(currentRoundIdx);
    }
  });

  /* ---------------------------- Quiz ---------------------------------- */

  const quizForm = document.getElementById("quiz-form");
  const quizResult = document.getElementById("quiz-result");
  const quizComment = document.getElementById("quiz-comment");

  function renderQuiz(schedule) {
    const computed = buildComputedQuestions(schedule);
    const all = [...QUIZ_MCQS.map((q, i) => ({ ...q, id: `mcq-${i}` })), ...computed.map((q, i) => ({ ...q, id: `calc-${i}` }))];

    quizForm.innerHTML = "";
    quizResult.hidden = true;
    quizResult.textContent = "";
    quizComment.hidden = true;
    quizComment.textContent = "";

    all.forEach((item, qIdx) => {
      const fieldset = document.createElement("fieldset");
      fieldset.className = "quiz-question";
      const legend = document.createElement("legend");
      legend.textContent = `${qIdx + 1}. ${item.q}`;
      fieldset.appendChild(legend);

      if (item.type === "text") {
        const input = document.createElement("input");
        input.type = "text";
        input.name = item.id;
        input.className = "quiz-text-input";
        input.autocomplete = "off";
        fieldset.appendChild(input);
      } else {
        item.options.forEach((opt, oIdx) => {
          const label = document.createElement("label");
          label.className = "quiz-option";
          label.innerHTML = `<input type="radio" name="${item.id}" value="${oIdx}"> ${opt}`;
          fieldset.appendChild(label);
        });
      }
      quizForm.appendChild(fieldset);
    });

    quizForm.dataset.questions = JSON.stringify(all.map((item) => ({ id: item.id, type: item.type || "mcq", answer: item.answer })));
  }

  document.getElementById("quiz-submit-btn").addEventListener("click", () => {
    const meta = JSON.parse(quizForm.dataset.questions || "[]");
    if (meta.length === 0) return;

    let correct = 0;
    meta.forEach((item) => {
      if (item.type === "text") {
        const input = quizForm.querySelector(`input[name="${item.id}"]`);
        const val = (input.value || "").trim().toUpperCase();
        if (val === String(item.answer).toUpperCase()) {
          correct++;
          input.classList.add("correct");
          input.classList.remove("incorrect");
        } else {
          input.classList.add("incorrect");
          input.classList.remove("correct");
        }
      } else {
        const checked = quizForm.querySelector(`input[name="${item.id}"]:checked`);
        const labels = quizForm.querySelectorAll(`input[name="${item.id}"]`);
        labels.forEach((radio) => {
          const wrap = radio.closest("label");
          wrap.classList.remove("correct", "incorrect");
          if (Number(radio.value) === item.answer) wrap.classList.add("correct-answer");
        });
        if (checked && Number(checked.value) === item.answer) {
          correct++;
          checked.closest("label").classList.add("correct");
        } else if (checked) {
          checked.closest("label").classList.add("incorrect");
        }
      }
    });

    quizResult.hidden = false;
    quizResult.textContent = `You scored ${correct} / ${meta.length}.`;
    quizComment.textContent = scoreComment(correct, meta.length);
    quizComment.hidden = false;
  });

  // Expose for manual testing in the browser console / test harness.
  window.DESKeySchedule = {
    generateKeySchedule,
    hexToBits,
    bitsToHex,
    permute,
    leftShift,
    isValidHexKey,
    randomKeyHex,
    runSelfTest,
    PC1,
    PC2,
    SHIFT_SCHEDULE,
  };
});
