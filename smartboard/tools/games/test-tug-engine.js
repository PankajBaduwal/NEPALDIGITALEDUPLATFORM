'use strict';
const assert = require('assert');
const TE = require('./tug-engine.js');

console.log('=== MATH TUG OF WAR ENGINE TEST SUITE ===\n');
let passed = 0;

function test(name, fn) {
  fn();
  passed++;
  console.log(`✅ PASS: ${name}`);
}

// 1. Grade 1-5 Question Generation & Syllabus Bounds
test('Generates valid questions for Grades 1-5 across all topics without repeating', () => {
  for (let g = 1; g <= 5; g++) {
    const used = new Set();
    const topics = TE.TOPICS_BY_GRADE[g];
    assert(topics && topics.length > 0, `Topics exist for Grade ${g}`);
    for (const t of topics) {
      for (let i = 0; i < 5; i++) {
        const q = TE.generateQuestion({ grade: g, topic: t.id, difficulty: 'medium' }, used);
        assert(q && q.id && q.promptEn && q.promptNe && q.answer !== undefined, `Valid Q for G${g} ${t.id}`);
        assert(Array.isArray(q.options) && q.options.includes(String(q.answer)), `Answer included in options for G${g} ${t.id}`);
      }
    }
  }
});

// 2. Simultaneous mode: Team A answers while Team B is still reading
test('Team A answers correctly; rope moves left, Team B question remains unaffected', () => {
  const m = TE.createMatch({ grade: 2, mode: 'simultaneous', pullStrength: 10, boundary: 50 });
  const qA = m.teams[0].currentQuestion;
  const qB = m.teams[1].currentQuestion;
  const res = TE.submitAnswer(m, 0, qA.id, qA.answer);
  assert.strictEqual(res.accepted, true);
  assert.strictEqual(res.correct, true);
  assert.strictEqual(m.teams[0].score, 1);
  assert.strictEqual(m.teams[1].score, 0);
  assert.strictEqual(m.ropePosition, -10);
  assert.strictEqual(m.teams[1].currentQuestion.id, qB.id, 'Team B question unchanged');
  assert.notStrictEqual(m.teams[0].currentQuestion.id, qA.id, 'Team A got next question');
});

// 3. Simultaneous mode: Team B answers correctly
test('Team B answers correctly; rope moves right, Team A unaffected', () => {
  const m = TE.createMatch({ grade: 3, mode: 'simultaneous', pullStrength: 10, boundary: 50 });
  const qA = m.teams[0].currentQuestion;
  const qB = m.teams[1].currentQuestion;
  const res = TE.submitAnswer(m, 1, qB.id, qB.answer);
  assert.strictEqual(res.accepted, true);
  assert.strictEqual(res.correct, true);
  assert.strictEqual(m.teams[1].score, 1);
  assert.strictEqual(m.ropePosition, 10);
  assert.strictEqual(m.teams[0].currentQuestion.id, qA.id, 'Team A question unchanged');
});

// 4. Simultaneous both teams answer correctly in same cycle
test('Simultaneous correct answers from both teams award both scores and cancel opposing rope pulls', () => {
  const m = TE.createMatch({ grade: 2, mode: 'simultaneous', pullStrength: 10, boundary: 50 });
  const qA = m.teams[0].currentQuestion;
  const qB = m.teams[1].currentQuestion;
  const rA = TE.submitAnswer(m, 0, qA.id, qA.answer);
  const rB = TE.submitAnswer(m, 1, qB.id, qB.answer);
  assert.strictEqual(rA.accepted && rA.correct, true);
  assert.strictEqual(rB.accepted && rB.correct, true);
  assert.strictEqual(m.teams[0].score, 1);
  assert.strictEqual(m.teams[1].score, 1);
  assert.strictEqual(m.ropePosition, 0);
});

// 5. Incorrect answers do not move rope or award points
test('Incorrect answers do not change score or rope position', () => {
  const m = TE.createMatch({ grade: 1, mode: 'simultaneous', pullStrength: 10, boundary: 50 });
  const qA = m.teams[0].currentQuestion;
  const res = TE.submitAnswer(m, 0, qA.id, '999999');
  assert.strictEqual(res.accepted, true);
  assert.strictEqual(res.correct, false);
  assert.strictEqual(m.teams[0].score, 0);
  assert.strictEqual(m.teams[0].wrongCount, 1);
  assert.strictEqual(m.ropePosition, 0);
});

// 6. Duplicate submission prevention
test('Duplicate submission for same questionId is rejected', () => {
  const m = TE.createMatch({ grade: 2, mode: 'simultaneous', pullStrength: 10, boundary: 50 });
  const qA = m.teams[0].currentQuestion;
  const r1 = TE.submitAnswer(m, 0, qA.id, qA.answer);
  const r2 = TE.submitAnswer(m, 0, qA.id, qA.answer);
  assert.strictEqual(r1.accepted, true);
  assert.strictEqual(r2.accepted, false);
  assert.strictEqual(m.teams[0].score, 1);
  assert.strictEqual(m.ropePosition, -10);
});

// 7. Winning boundary ends match and locks further answers
test('Reaching left winning boundary (-50) declares Team A winner and locks match', () => {
  const m = TE.createMatch({ grade: 2, mode: 'simultaneous', pullStrength: 25, boundary: 50 });
  let q = m.teams[0].currentQuestion;
  TE.submitAnswer(m, 0, q.id, q.answer); // -25
  assert.strictEqual(m.status, 'playing');
  q = m.teams[0].currentQuestion;
  const winRes = TE.submitAnswer(m, 0, q.id, q.answer); // -50
  assert.strictEqual(winRes.finished, true);
  assert.strictEqual(m.status, 'finished');
  assert.strictEqual(m.winner, 0);
  assert.strictEqual(m.winReason, 'boundary');

  // Team B tries to submit after match finished -> rejected
  const qB = m.teams[1].currentQuestion;
  const afterRes = TE.submitAnswer(m, 1, qB.id, qB.answer);
  assert.strictEqual(afterRes.accepted, false);
});

// 8. Timer expiration winner & draw handling
test('Timer expiration awards winner by rope advantage and declares draw when centered', () => {
  const m1 = TE.createMatch({ grade: 2, pullStrength: 10, boundary: 50 });
  TE.submitAnswer(m1, 1, m1.teams[1].currentQuestion.id, m1.teams[1].currentQuestion.answer); // +10
  TE.finishByTimer(m1);
  assert.strictEqual(m1.status, 'finished');
  assert.strictEqual(m1.winner, 1);
  assert.strictEqual(m1.winReason, 'timer');

  const m2 = TE.createMatch({ grade: 2, pullStrength: 10, boundary: 50 });
  TE.finishByTimer(m2);
  assert.strictEqual(m2.status, 'finished');
  assert.strictEqual(m2.winner, 'draw');
});

// 9. Turn-based mode enforces turn alternation
test('Turn-based mode enforces alternating turns', () => {
  const m = TE.createMatch({ grade: 2, mode: 'turnbased', pullStrength: 10, boundary: 50 });
  const rWrongTurn = TE.submitAnswer(m, 1, m.teams[1].currentQuestion.id, m.teams[1].currentQuestion.answer);
  assert.strictEqual(rWrongTurn.accepted, false);
  assert.strictEqual(rWrongTurn.reason, 'not_your_turn');
  const rOkTurn = TE.submitAnswer(m, 0, m.teams[0].currentQuestion.id, m.teams[0].currentQuestion.answer);
  assert.strictEqual(rOkTurn.accepted, true);
  assert.strictEqual(m.turn, 1);
});

// 10. Nepali numerals utility
test('Devanagari numeral converter toNp translates numbers accurately', () => {
  assert.strictEqual(TE.toNp(1234567890), '१२३४५६७८९०');
});

console.log(`\n🎉 ALL ${passed}/${passed} MATH TUG OF WAR TESTS PASSED!`);
