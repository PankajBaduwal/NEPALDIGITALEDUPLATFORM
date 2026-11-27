'use strict';

// ═══════════════════════════════════════════════════════════
// SMART BOARD GAMES — MATH TUG OF WAR (गणितको डोरी तान्ने खेल)
// Real-time simultaneous two-team classroom competition for Classes 1–5+.
// Rules & question generation live in TugEngine (tug-engine.js).
// ═══════════════════════════════════════════════════════════
(() => {
  if (typeof GamesHub === 'undefined' || typeof TugEngine === 'undefined') return;
  const { h } = GamesHub;
  const TE = TugEngine;

  const SETTINGS_KEY = 'gm_tugofwar_settings_v1';

  const STRINGS = {
    en: {
      title: 'Math Tug of War',
      subtitle: 'Solve math questions to pull the rope to your side!',
      setupTitle: 'Match Setup',
      teamA: 'Team A',
      teamB: 'Team B',
      grade: 'Class / Grade',
      topic: 'Math Topic',
      difficulty: 'Difficulty',
      mode: 'Game Mode',
      answerStyle: 'Answer Input',
      questionSync: 'Questions',
      duration: 'Match Time',
      pullStrength: 'Pull Strength',
      rounds: 'Rounds',
      startGame: 'Start Game',
      easy: 'Easy',
      medium: 'Medium',
      hard: 'Hard',
      simultaneous: 'Two-Team Simultaneous',
      turnbased: 'Turn-Based',
      teacher: 'Teacher Challenge',
      quick: 'Quick Battle (60s)',
      keypad: 'Numeric Keypad',
      choice: 'Multiple Choice',
      different: 'Different per Team',
      same: 'Same Question',
      score: 'Score',
      streak: 'Streak',
      correct: 'Correct! Pull!',
      incorrect: 'Try next! Ans:',
      submit: 'Pull!',
      clear: 'C',
      back: '⌫',
      winLine: 'WIN',
      center: 'CENTER',
      paused: 'Match Paused',
      resume: 'Resume Match',
      restart: 'Restart',
      endMatch: 'End Match',
      youWin: 'Wins the Match!',
      draw: "It's a Draw!",
      reasonBoundary: 'Pulled the rope past the winning boundary!',
      reasonTimer: 'Time expired — winner decided by rope position!',
      reasonTimerDraw: 'Time expired — rope is exactly at the centre!',
      reasonEnded: 'Match ended by teacher.',
      playAgain: 'Play Again',
      nextRound: 'Next Round',
      changeSetup: 'Match Setup',
      exitGame: 'All Games',
      roundBoard: 'Classroom Scoreboard',
      roundLabel: 'Round',
      statsCorrect: 'Correct',
      statsWrong: 'Incorrect',
      statsAttempted: 'Attempted',
      statsStreak: 'Best Streak',
      finalRope: 'Final Rope Position',
      yourTurn: 'Your Turn!',
      waitTurn: 'Wait for turn...',
      sharedQ: 'Shared Class Question',
      classPrefix: 'Class',
      langLabel: 'नेपाली',
    },
    ne: {
      title: 'गणितको डोरी तान्ने खेल',
      subtitle: 'सही गणित प्रश्न मिलाएर डोरी आफ्नो तर्फ तान्नुहोस्!',
      setupTitle: 'खेल सेटिङ',
      teamA: 'समूह A',
      teamB: 'समूह B',
      grade: 'कक्षा (Class)',
      topic: 'गणित विषय',
      difficulty: 'कठिनाइ स्तर',
      mode: 'खेल मोड',
      answerStyle: 'उत्तर माध्यम',
      questionSync: 'प्रश्न प्रकार',
      duration: 'समय',
      pullStrength: 'तान्ने शक्ति',
      rounds: 'राउन्ड',
      startGame: 'खेल सुरु गर्नुहोस्',
      easy: 'सजिलो',
      medium: 'मध्यम',
      hard: 'कठिन',
      simultaneous: 'दुवै समूह सँगै (Simultaneous)',
      turnbased: 'पालैपालो (Turn-Based)',
      teacher: 'शिक्षक चुनौती',
      quick: 'छिटो खेल (६० से.)',
      keypad: 'अङ्क किप्याड',
      choice: 'बहुवैकल्पिक',
      different: 'फरक-फरक प्रश्न',
      same: 'एउटै प्रश्न',
      score: 'अङ्क',
      streak: 'लगातार',
      correct: 'सही उत्तर! तान्नुहोस्!',
      incorrect: 'फेरि प्रयास! उत्तर:',
      submit: 'तान्नुहोस्!',
      clear: 'C',
      back: '⌫',
      winLine: 'जित',
      center: 'केन्द्र',
      paused: 'खेल रोकिएको छ',
      resume: 'जारी राख्नुहोस्',
      restart: 'फेरि सुरु',
      endMatch: 'खेल समाप्त',
      youWin: 'ले खेल जित्यो!',
      draw: 'खेल बराबरी भयो!',
      reasonBoundary: 'डोरी जित्ने रेखा पार गरियो!',
      reasonTimer: 'समय सकियो — डोरीको स्थान अनुसार विजेता!',
      reasonTimerDraw: 'समय सकियो — डोरी ठीक केन्द्रमा छ!',
      reasonEnded: 'शिक्षकद्वारा खेल समाप्त।',
      playAgain: 'फेरि खेल्नुहोस्',
      nextRound: 'अर्को राउन्ड',
      changeSetup: 'सेटिङ बदल्नुहोस्',
      exitGame: 'बाहिर निस्कनुहोस्',
      roundBoard: 'कक्षा अङ्क तालिका',
      roundLabel: 'राउन्ड',
      statsCorrect: 'सही उत्तर',
      statsWrong: 'गलत उत्तर',
      statsAttempted: 'कुल प्रयास',
      statsStreak: 'उत्कृष्ट लगातार',
      finalRope: 'अन्तिम डोरी स्थान',
      yourTurn: 'तपाईंको पालो!',
      waitTurn: 'पालो पर्खनुहोस्...',
      sharedQ: 'साझा कक्षा प्रश्न',
      classPrefix: 'कक्षा',
      langLabel: 'English',
    },
  };

  const store = {
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };

  const fmtTime = (sec) => {
    const s = Math.max(0, Math.floor(sec));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  };

  GamesHub.register('tugofwar', (ctx) => {
    const { session, body } = ctx;
    const saved = store.get(SETTINGS_KEY) || {};

    const cfg = {
      lang: saved.lang === 'ne' ? 'ne' : 'en',
      teamAName: saved.teamAName || 'Team A',
      teamBName: saved.teamBName || 'Team B',
      grade: [1, 2, 3, 4, 5].includes(saved.grade) ? saved.grade : 2,
      topic: saved.topic || 'mixed',
      difficulty: ['easy', 'medium', 'hard'].includes(saved.difficulty) ? saved.difficulty : 'medium',
      mode: ['simultaneous', 'turnbased', 'teacher', 'quick'].includes(saved.mode) ? saved.mode : 'simultaneous',
      answerStyle: ['keypad', 'choice'].includes(saved.answerStyle) ? saved.answerStyle : 'keypad',
      questionSync: saved.questionSync === 'same' ? 'same' : 'different',
      durationSeconds: [60, 90, 120, 180].includes(saved.durationSeconds) ? saved.durationSeconds : 120,
      pullStrength: [5, 10, 12.5, 15].includes(saved.pullStrength) ? saved.pullStrength : 10,
      totalRounds: [1, 3, 5].includes(saved.totalRounds) ? saved.totalRounds : 3,
      sound: saved.sound !== false,
    };

    const saveCfg = () => store.set(SETTINGS_KEY, cfg);
    const T = (k) => (STRINGS[cfg.lang] && STRINGS[cfg.lang][k]) || STRINGS.en[k] || k;
    const fmtNum = (n) => (cfg.lang === 'ne' ? TE.toNp(n) : String(n));

    let match = null;
    let timerHandle = null;
    let audio = null;
    let roundNumber = 1;
    let roundWins = [0, 0, 0]; // [teamA, teamB, draws]
    let teamInputs = ['', ''];
    let lastPullSide = null; // 0 | 1 | null

    ctx.setHelp([
      'Two teams compete side-by-side! Team A (Blue) is on the left and Team B (Red) is on the right.',
      'In Simultaneous mode, both teams solve their own questions at the same time — no waiting for turns!',
      'Each correct answer pulls the rope toward your team. Pull the rope past the winning boundary to win!',
      'Multi-touch ready: two students can tap the Smart Board simultaneously without interfering.',
      'Use the top controls to Pause, toggle Sound, switch English / नेपाली, or go Full Screen.',
    ]);

    function tone(freqs, dur = 0.11, type = 'sine') {
      if (!cfg.sound) return;
      try {
        audio = audio || new (window.AudioContext || window.webkitAudioContext)();
        let t = audio.currentTime;
        freqs.forEach((f) => {
          const o = audio.createOscillator();
          const g = audio.createGain();
          o.type = type;
          o.frequency.value = f;
          g.gain.setValueAtTime(0.0001, t);
          g.gain.exponentialRampToValueAtTime(0.09, t + 0.015);
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
          o.connect(g);
          g.connect(audio.destination);
          o.start(t);
          o.stop(t + dur + 0.02);
          t += dur * 0.85;
        });
      } catch (e) { /* audio blocked */ }
    }

    const playGood = () => tone([523.25, 659.25, 783.99], 0.09, 'triangle');
    const playBad = () => tone([240, 190], 0.12, 'sawtooth');
    const playWin = () => tone([523.25, 659.25, 783.99, 1046.5], 0.14, 'triangle');

    function stopTimer() {
      if (timerHandle) {
        session.clearInterval(timerHandle);
        timerHandle = null;
      }
    }

    session.onDispose(() => {
      stopTimer();
      if (audio) {
        try { audio.close(); } catch (e) { /* ignore */ }
        audio = null;
      }
    });

    function toggleFullscreen() {
      const target = document.getElementById('games-overlay') || document.documentElement;
      if (!document.fullscreenElement) {
        target.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 1. SETUP SCREEN
    // ═══════════════════════════════════════════════════════════
    function renderSetup() {
      stopTimer();
      match = null;
      ctx.setPhase('idle');
      ctx.setHud([
        h('button', {
          type: 'button',
          class: 'gm-btn gm-ghost gm-btn-sm',
          text: T('langLabel'),
          on: { click: () => { cfg.lang = cfg.lang === 'en' ? 'ne' : 'en'; saveCfg(); renderSetup(); } },
        }),
        h('button', {
          type: 'button',
          class: 'gm-btn gm-ghost gm-btn-sm',
          text: cfg.sound ? '🔊 Sound On' : '🔇 Muted',
          on: { click: () => { cfg.sound = !cfg.sound; saveCfg(); renderSetup(); } },
        }),
      ]);

      const chipGroup = (label, options, val, onPick) =>
        h('div', { class: 'gm-tug-cfg-row' }, [
          h('span', { class: 'gm-tug-cfg-lbl', text: label }),
          h('div', { class: 'gm-tug-cfg-chips' }, options.map((o) =>
            h('button', {
              type: 'button',
              class: 'gm-chip',
              'aria-pressed': String(o.value === val),
              text: o.label,
              on: {
                click: () => {
                  onPick(o.value);
                  saveCfg();
                  renderSetup();
                },
              },
            })
          )),
        ]);

      const gradeTopics = TE.TOPICS_BY_GRADE[cfg.grade] || TE.TOPICS_BY_GRADE[1];
      if (!gradeTopics.some((t) => t.id === cfg.topic)) cfg.topic = 'mixed';

      const scoreboardBanner = (roundWins[0] + roundWins[1] + roundWins[2] > 0)
        ? h('div', { class: 'gm-tug-scoreboard-mini' }, [
            h('strong', { text: `${T('roundBoard')}: ` }),
            h('span', { class: 'gm-tug-sb-a', text: `${cfg.teamAName}: ${fmtNum(roundWins[0])}` }),
            h('span', { text: '  |  ' }),
            h('span', { class: 'gm-tug-sb-b', text: `${cfg.teamBName}: ${fmtNum(roundWins[1])}` }),
            roundWins[2] > 0 ? h('span', { text: `  |  Draws: ${fmtNum(roundWins[2])}` }) : null,
          ])
        : null;

      const setupCard = h('div', { class: 'gm-tug-setup' }, [
        h('div', { class: 'gm-tug-setup-hero' }, [
          h('div', { class: 'gm-tug-setup-badge', text: '🪢 Class 1–5 Interactive Smart Board Game' }),
          h('h2', { class: 'gm-tug-setup-title', text: T('title') }),
          h('p', { class: 'gm-tug-setup-sub', text: T('subtitle') }),
          scoreboardBanner,
        ]),

        h('div', { class: 'gm-tug-setup-grid' }, [
          // Team Names
          h('div', { class: 'gm-tug-setup-teams' }, [
            h('label', { class: 'gm-tug-name-box team-a' }, [
              h('span', { text: `${T('teamA')} (Blue)` }),
              h('input', {
                type: 'text',
                class: 'gm-input',
                value: cfg.teamAName,
                maxlength: '18',
                on: { input: (e) => { cfg.teamAName = e.target.value || 'Team A'; saveCfg(); } },
              }),
            ]),
            h('div', { class: 'gm-tug-vs', text: 'VS' }),
            h('label', { class: 'gm-tug-name-box team-b' }, [
              h('span', { text: `${T('teamB')} (Red)` }),
              h('input', {
                type: 'text',
                class: 'gm-input',
                value: cfg.teamBName,
                maxlength: '18',
                on: { input: (e) => { cfg.teamBName = e.target.value || 'Team B'; saveCfg(); } },
              }),
            ]),
          ]),

          chipGroup(
            T('grade'),
            [1, 2, 3, 4, 5].map((g) => ({ value: g, label: `${T('classPrefix')} ${fmtNum(g)}` })),
            cfg.grade,
            (v) => { cfg.grade = v; cfg.topic = 'mixed'; }
          ),

          chipGroup(
            T('topic'),
            gradeTopics.map((t) => ({ value: t.id, label: cfg.lang === 'ne' ? t.ne : t.en })),
            cfg.topic,
            (v) => { cfg.topic = v; }
          ),

          chipGroup(
            T('difficulty'),
            [
              { value: 'easy', label: T('easy') },
              { value: 'medium', label: T('medium') },
              { value: 'hard', label: T('hard') },
            ],
            cfg.difficulty,
            (v) => { cfg.difficulty = v; }
          ),

          chipGroup(
            T('mode'),
            [
              { value: 'simultaneous', label: T('simultaneous') },
              { value: 'turnbased', label: T('turnbased') },
              { value: 'teacher', label: T('teacher') },
              { value: 'quick', label: T('quick') },
            ],
            cfg.mode,
            (v) => { cfg.mode = v; }
          ),

          chipGroup(
            T('answerStyle'),
            [
              { value: 'keypad', label: `🔢 ${T('keypad')}` },
              { value: 'choice', label: `🅰️ ${T('choice')}` },
            ],
            cfg.answerStyle,
            (v) => { cfg.answerStyle = v; }
          ),

          chipGroup(
            T('questionSync'),
            [
              { value: 'different', label: T('different') },
              { value: 'same', label: T('same') },
            ],
            cfg.questionSync,
            (v) => { cfg.questionSync = v; }
          ),

          chipGroup(
            T('duration'),
            [
              { value: 60, label: '1:00' },
              { value: 90, label: '1:30' },
              { value: 120, label: '2:00' },
              { value: 180, label: '3:00' },
            ],
            cfg.durationSeconds,
            (v) => { cfg.durationSeconds = v; }
          ),

          chipGroup(
            T('pullStrength'),
            [
              { value: 5, label: '5 (10 pulls)' },
              { value: 10, label: '10 (5 pulls)' },
              { value: 12.5, label: '12.5 (4 pulls)' },
              { value: 15, label: '15 (Fast)' },
            ],
            cfg.pullStrength,
            (v) => { cfg.pullStrength = v; }
          ),
        ]),

        h('div', { class: 'gm-tug-setup-actions' }, [
          h('button', {
            type: 'button',
            class: 'gm-btn gm-primary gm-tug-start-btn',
            text: `🪢 ${T('startGame')}`,
            on: { click: () => { roundNumber = 1; startMatch(); } },
          }),
        ]),
      ]);

      body.replaceChildren(setupCard);
    }

    // ═══════════════════════════════════════════════════════════
    // 2. START & LIVE MATCH RENDERING
    // ═══════════════════════════════════════════════════════════
    function startMatch() {
      stopTimer();
      teamInputs = ['', ''];
      lastPullSide = null;
      match = TE.createMatch({
        teamAName: cfg.teamAName,
        teamBName: cfg.teamBName,
        grade: cfg.grade,
        topic: cfg.topic,
        difficulty: cfg.difficulty,
        mode: cfg.mode,
        answerStyle: cfg.answerStyle,
        questionSync: cfg.questionSync,
        durationSeconds: cfg.durationSeconds,
        pullStrength: cfg.pullStrength,
        totalRounds: cfg.totalRounds,
        roundNumber,
      });

      ctx.setPhase('playing');
      startTimerLoop();
      renderMatch();
    }

    function startTimerLoop() {
      stopTimer();
      timerHandle = session.setInterval(() => {
        if (!match || match.status !== 'playing') return;
        match.timeLeft = Math.max(0, match.timeLeft - 1);
        updateHud();
        if (match.timeLeft === 0) {
          TE.finishByTimer(match);
          onMatchFinished();
        }
      }, 1000);
    }

    function updateHud() {
      if (!match) return;
      const timerCls = match.timeLeft <= 15 ? 'gm-tug-hud-timer danger' : 'gm-tug-hud-timer';
      ctx.setHud([
        h('span', { class: 'gm-tag', text: `${T('classPrefix')} ${fmtNum(cfg.grade)} · ${T(cfg.difficulty)}` }),
        h('span', { class: 'gm-tag', text: `${T('roundLabel')} ${fmtNum(roundNumber)}` }),
        h('span', { class: timerCls, text: `⏱ ${fmtNum(fmtTime(match.timeLeft))}` }),
        h('button', {
          type: 'button',
          class: 'gm-btn gm-ghost gm-btn-sm',
          text: match.status === 'paused' ? `▶ ${T('resume')}` : '⏸ Pause',
          on: { click: togglePause },
        }),
        h('button', {
          type: 'button',
          class: 'gm-btn gm-ghost gm-btn-sm',
          text: T('langLabel'),
          on: { click: () => { cfg.lang = cfg.lang === 'en' ? 'ne' : 'en'; saveCfg(); renderMatch(); } },
        }),
        h('button', {
          type: 'button',
          class: 'gm-btn gm-ghost gm-btn-sm',
          text: cfg.sound ? '🔊' : '🔇',
          'aria-label': 'Toggle sound',
          on: { click: () => { cfg.sound = !cfg.sound; saveCfg(); updateHud(); } },
        }),
        h('button', {
          type: 'button',
          class: 'gm-btn gm-ghost gm-btn-sm',
          text: '⛶',
          'aria-label': 'Full screen',
          on: { click: toggleFullscreen },
        }),
        h('button', {
          type: 'button',
          class: 'gm-btn gm-ghost gm-btn-sm',
          text: T('endMatch'),
          on: {
            click: () => {
              if (!match || match.status === 'finished') return;
              TE.forceEndMatch(match);
              onMatchFinished();
            },
          },
        }),
      ]);
    }

    function togglePause() {
      if (!match || match.status === 'finished') return;
      match.status = match.status === 'paused' ? 'playing' : 'paused';
      renderMatch();
    }

    function handleAnswerSubmit(teamId, rawVal) {
      if (!match || match.status !== 'playing') return;
      const team = match.teams[teamId];
      if (!team || !team.currentQuestion) return;
      const qId = team.currentQuestion.id;
      const val = String(rawVal == null ? '' : rawVal).trim();
      if (!val) return;

      const res = TE.submitAnswer(match, teamId, qId, val);
      if (!res.accepted) return;

      teamInputs[teamId] = '';

      if (res.correct) {
        lastPullSide = teamId;
        playGood();
      } else {
        lastPullSide = null;
        playBad();
      }

      if (res.finished) {
        onMatchFinished();
      } else {
        renderMatch();
      }
    }

    function onMatchFinished() {
      stopTimer();
      ctx.setPhase('result');
      if (match.winner === 0) roundWins[0] += 1;
      else if (match.winner === 1) roundWins[1] += 1;
      else roundWins[2] += 1;
      playWin();
      renderMatch();
    }

    // ── Build Central SVG Tug-of-War Arena ──
    function buildArena() {
      const ratio = match.ropePosition / match.boundary; // -1 .. +1
      const shiftX = ratio * 125; // pixel shift inside SVG viewBox 0..600

      const advText =
        match.ropePosition < 0
          ? `← ${match.teams[0].name} (+${fmtNum(Math.abs(match.ropePosition))})`
          : match.ropePosition > 0
          ? `${match.teams[1].name} (+${fmtNum(Math.abs(match.ropePosition))}) →`
          : T('center');

      const svgHtml = `
        <svg viewBox="0 0 600 290" class="gm-tug-svg" aria-label="Tug of war arena">
          <defs>
            <linearGradient id="tugSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#EFF6FF"/>
              <stop offset="100%" stop-color="#F8FAFC"/>
            </linearGradient>
            <linearGradient id="tugGround" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#D1FAE5"/>
              <stop offset="100%" stop-color="#A7F3D0"/>
            </linearGradient>
          </defs>

          <!-- Backdrop -->
          <rect x="0" y="0" width="600" height="220" rx="16" fill="url(#tugSky)"/>
          <rect x="0" y="218" width="600" height="72" rx="12" fill="url(#tugGround)"/>
          <line x1="0" y1="218" x2="600" y2="218" stroke="#34D399" stroke-width="3"/>

          <!-- Left Winning Boundary (x = 175) -->
          <line x1="175" y1="35" x2="175" y2="245" stroke="#2563EB" stroke-width="3" stroke-dasharray="6,5"/>
          <rect x="135" y="18" width="80" height="24" rx="12" fill="#2563EB"/>
          <text x="175" y="34" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="800">${T('winLine')} ◀</text>

          <!-- Center Line (x = 300) -->
          <line x1="300" y1="48" x2="300" y2="245" stroke="#64748B" stroke-width="2" stroke-dasharray="4,4"/>
          <text x="300" y="42" text-anchor="middle" fill="#475569" font-size="10" font-weight="800">${T('center')}</text>

          <!-- Right Winning Boundary (x = 425) -->
          <line x1="425" y1="35" x2="425" y2="245" stroke="#DC2626" stroke-width="3" stroke-dasharray="6,5"/>
          <rect x="385" y="18" width="80" height="24" rx="12" fill="#DC2626"/>
          <text x="425" y="34" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="800">▶ ${T('winLine')}</text>

          <!-- Moving Rope & Characters Group -->
          <g class="gm-tug-mover ${lastPullSide === 0 ? 'pull-left' : lastPullSide === 1 ? 'pull-right' : ''}"
             style="transform: translateX(${shiftX}px); transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);">

            <!-- Horizontal Rope -->
            <line x1="70" y1="164" x2="530" y2="164" stroke="#92400E" stroke-width="9" stroke-linecap="round"/>
            <line x1="70" y1="164" x2="530" y2="164" stroke="#D97706" stroke-width="4" stroke-dasharray="10,8" stroke-linecap="round"/>

            <!-- Center Knot / Flag Ribbon on Rope (at x=300 in group coords) -->
            <polygon points="300,164 291,196 300,190 309,196" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>
            <circle cx="300" cy="164" r="9" fill="#EF4444" stroke="#FFFFFF" stroke-width="2.5"/>

            <!-- TEAM A CHARACTERS (BLUE - LEFT) -->
            <g transform="translate(80, 118)">
              <!-- Player A2 (Back) -->
              <circle cx="22" cy="16" r="14" fill="#FDE68A" stroke="#1E3A8A" stroke-width="2"/>
              <path d="M16 14 Q22 10 28 14" stroke="#1E293B" stroke-width="2" fill="none"/>
              <circle cx="18" cy="17" r="2" fill="#1E293B"/><circle cx="26" cy="17" r="2" fill="#1E293B"/>
              <rect x="10" y="30" width="24" height="36" rx="8" fill="#2563EB"/>
              <line x1="16" y1="66" x2="8" y2="98" stroke="#1E3A8A" stroke-width="6" stroke-linecap="round"/>
              <line x1="28" y1="66" x2="36" y2="98" stroke="#1E3A8A" stroke-width="6" stroke-linecap="round"/>
              <line x1="28" y1="42" x2="48" y2="46" stroke="#1D4ED8" stroke-width="5" stroke-linecap="round"/>
            </g>
            <g transform="translate(132, 114)">
              <!-- Player A1 (Anchor) -->
              <circle cx="24" cy="16" r="15" fill="#FCD34D" stroke="#1E3A8A" stroke-width="2"/>
              <circle cx="20" cy="17" r="2" fill="#1E293B"/><circle cx="28" cy="17" r="2" fill="#1E293B"/>
              <path d="M19 22 Q24 26 29 22" stroke="#1E293B" stroke-width="2" fill="none"/>
              <rect x="11" y="31" width="26" height="38" rx="9" fill="#1D4ED8"/>
              <line x1="18" y1="69" x2="8" y2="102" stroke="#1E3A8A" stroke-width="6.5" stroke-linecap="round"/>
              <line x1="30" y1="69" x2="38" y2="102" stroke="#1E3A8A" stroke-width="6.5" stroke-linecap="round"/>
              <line x1="30" y1="44" x2="54" y2="50" stroke="#2563EB" stroke-width="5.5" stroke-linecap="round"/>
            </g>

            <!-- TEAM B CHARACTERS (RED - RIGHT) -->
            <g transform="translate(422, 114)">
              <!-- Player B1 (Anchor) -->
              <circle cx="24" cy="16" r="15" fill="#FCD34D" stroke="#7F1D1D" stroke-width="2"/>
              <circle cx="20" cy="17" r="2" fill="#1E293B"/><circle cx="28" cy="17" r="2" fill="#1E293B"/>
              <path d="M19 22 Q24 26 29 22" stroke="#1E293B" stroke-width="2" fill="none"/>
              <rect x="11" y="31" width="26" height="38" rx="9" fill="#DC2626"/>
              <line x1="18" y1="69" x2="10" y2="102" stroke="#7F1D1D" stroke-width="6.5" stroke-linecap="round"/>
              <line x1="30" y1="69" x2="40" y2="102" stroke="#7F1D1D" stroke-width="6.5" stroke-linecap="round"/>
              <line x1="18" y1="44" x2="-6" y2="50" stroke="#EF4444" stroke-width="5.5" stroke-linecap="round"/>
            </g>
            <g transform="translate(476, 118)">
              <!-- Player B2 (Back) -->
              <circle cx="22" cy="16" r="14" fill="#FDE68A" stroke="#7F1D1D" stroke-width="2"/>
              <circle cx="18" cy="17" r="2" fill="#1E293B"/><circle cx="26" cy="17" r="2" fill="#1E293B"/>
              <rect x="10" y="30" width="24" height="36" rx="8" fill="#B91C1C"/>
              <line x1="16" y1="66" x2="8" y2="98" stroke="#7F1D1D" stroke-width="6" stroke-linecap="round"/>
              <line x1="28" y1="66" x2="36" y2="98" stroke="#7F1D1D" stroke-width="6" stroke-linecap="round"/>
              <line x1="16" y1="42" x2="-4" y2="46" stroke="#DC2626" stroke-width="5" stroke-linecap="round"/>
            </g>
          </g>
        </svg>
      `;

      const pct = Math.max(0, Math.min(100, ((match.ropePosition + match.boundary) / (match.boundary * 2)) * 100));

      return h('div', { class: 'gm-tug-arena' }, [
        h('div', { class: 'gm-tug-arena-top' }, [
          h('span', { class: 'gm-tug-adv', text: advText }),
        ]),
        h('div', { class: 'gm-tug-svg-wrap', html: svgHtml }),
        h('div', { class: 'gm-tug-meter-wrap', 'aria-label': `Rope position ${match.ropePosition}` }, [
          h('div', { class: 'gm-tug-meter-track' }, [
            h('div', { class: 'gm-tug-meter-center' }),
            h('div', { class: 'gm-tug-meter-marker', style: `left: ${pct}%` }),
          ]),
        ]),
      ]);
    }

    // ── Build Independent Team Panel ──
    function buildTeamPanel(teamId) {
      const team = match.teams[teamId];
      const isA = teamId === 0;
      const cls = isA ? 'gm-tug-team team-a' : 'gm-tug-team team-b';
      const q = team.currentQuestion;
      const isTurnLocked = match.cfg.mode === 'turnbased' && match.turn !== teamId;
      const isMatchDisabled = match.status !== 'playing' || isTurnLocked;

      const feedbackEl = team.lastFeedback
        ? h('div', {
            class: `gm-tug-fb ${team.lastFeedback.ok ? 'ok' : 'bad'}`,
            text: team.lastFeedback.ok
              ? `✓ ${T('correct')}${team.lastFeedback.combo ? ` 🔥 ${fmtNum(team.streak)}x!` : ''}`
              : `✗ ${T('incorrect')} ${fmtNum(team.lastFeedback.answer)}`,
          })
        : h('div', { class: 'gm-tug-fb idle', text: isTurnLocked ? T('waitTurn') : (match.cfg.mode === 'turnbased' ? T('yourTurn') : '⚡ Ready!') });

      const promptText = cfg.lang === 'ne' ? q.promptNe : q.promptEn;

      // Render either Multiple Choice or Numeric Keypad
      let controlsEl;
      if (match.cfg.answerStyle === 'choice' || q.type === 'choice') {
        const opts = q.options || ['0', '1', '2', '3'];
        controlsEl = h('div', { class: 'gm-tug-choices' }, opts.map((opt) => {
          const label = cfg.lang === 'ne' && q.optionsNe && q.optionsNe[opt]
            ? q.optionsNe[opt]
            : fmtNum(opt);
          return h('button', {
            type: 'button',
            class: 'gm-tug-choice-btn',
            disabled: isMatchDisabled,
            text: label,
            on: {
              pointerdown: (e) => {
                if (isMatchDisabled) return;
                e.preventDefault();
                handleAnswerSubmit(teamId, opt);
              },
              click: (e) => {
                // keyboard Enter/Space support without double firing pointerdown
                if (e.detail === 0 && !isMatchDisabled) handleAnswerSubmit(teamId, opt);
              },
            },
          });
        }));
      } else {
        const displayEl = h('div', {
          class: 'gm-tug-keypad-disp',
          text: teamInputs[teamId] ? fmtNum(teamInputs[teamId]) : '?',
        });

        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];
        const padGrid = h('div', { class: 'gm-tug-keypad-grid' }, keys.map((k) => {
          const isBack = k === 'back';
          const lbl = isBack ? T('back') : (k === '.' ? '.' : fmtNum(k));
          return h('button', {
            type: 'button',
            class: `gm-tug-key ${isBack ? 'fn' : ''}`,
            disabled: isMatchDisabled,
            text: lbl,
            on: {
              pointerdown: (e) => {
                if (isMatchDisabled) return;
                e.preventDefault();
                if (isBack) teamInputs[teamId] = teamInputs[teamId].slice(0, -1);
                else if (teamInputs[teamId].length < 7) {
                  if (k === '.' && teamInputs[teamId].includes('.')) return;
                  teamInputs[teamId] += k;
                }
                displayEl.textContent = teamInputs[teamId] ? fmtNum(teamInputs[teamId]) : '?';
              },
              click: (e) => {
                if (e.detail !== 0 || isMatchDisabled) return;
                if (isBack) teamInputs[teamId] = teamInputs[teamId].slice(0, -1);
                else if (teamInputs[teamId].length < 7) teamInputs[teamId] += k;
                displayEl.textContent = teamInputs[teamId] ? fmtNum(teamInputs[teamId]) : '?';
              },
            },
          });
        }));

        const submitBtn = h('button', {
          type: 'button',
          class: 'gm-tug-submit-btn',
          disabled: isMatchDisabled,
          text: `✓ ${T('submit')}`,
          on: {
            pointerdown: (e) => {
              if (isMatchDisabled) return;
              e.preventDefault();
              handleAnswerSubmit(teamId, teamInputs[teamId]);
            },
            click: (e) => {
              if (e.detail === 0 && !isMatchDisabled) handleAnswerSubmit(teamId, teamInputs[teamId]);
            },
          },
        });

        const clearBtn = h('button', {
          type: 'button',
          class: 'gm-tug-clear-btn',
          disabled: isMatchDisabled,
          text: T('clear'),
          on: {
            pointerdown: (e) => {
              if (isMatchDisabled) return;
              e.preventDefault();
              teamInputs[teamId] = '';
              displayEl.textContent = '?';
            },
          },
        });

        controlsEl = h('div', { class: 'gm-tug-keypad' }, [
          h('div', { class: 'gm-tug-keypad-top' }, [displayEl, clearBtn]),
          padGrid,
          submitBtn,
        ]);
      }

      return h('section', { class: `${cls} ${isTurnLocked ? 'turn-locked' : ''}`, 'aria-label': team.name }, [
        h('div', { class: 'gm-tug-team-head' }, [
          h('div', { class: 'gm-tug-team-name', text: team.name }),
          h('div', { class: 'gm-tug-team-badges' }, [
            team.streak >= 2 ? h('span', { class: 'gm-tug-streak', text: `🔥 ${fmtNum(team.streak)}` }) : null,
            h('span', { class: 'gm-tug-score', text: `${T('score')}: ${fmtNum(team.score)}` }),
          ]),
        ]),
        feedbackEl,
        h('div', { class: 'gm-tug-qbox' }, [
          h('span', { class: 'gm-tug-qnum', text: `Q${fmtNum(team.questionNumber)}` }),
          h('div', { class: 'gm-tug-qtext', text: promptText }),
          q.visual ? h('div', { class: 'gm-tug-qvisual', text: q.visual }) : null,
        ]),
        controlsEl,
      ]);
    }

    // ── Build Winner Overlay ──
    function buildWinnerOverlay() {
      const tA = match.teams[0], tB = match.teams[1];
      let headline = T('draw');
      let winCls = 'draw';
      if (match.winner === 0) { headline = `🏆 ${tA.name} ${T('youWin')}`; winCls = 'team-a'; }
      else if (match.winner === 1) { headline = `🏆 ${tB.name} ${T('youWin')}`; winCls = 'team-b'; }

      const reason =
        match.winReason === 'boundary'
          ? T('reasonBoundary')
          : match.winReason === 'timer'
          ? match.winner === 'draw' ? T('reasonTimerDraw') : T('reasonTimer')
          : T('reasonEnded');

      return h('div', { class: 'gm-tug-winner-backdrop' }, [
        h('div', { class: `gm-tug-winner-card ${winCls}` }, [
          h('div', { class: 'gm-tug-winner-title', text: headline }),
          h('p', { class: 'gm-tug-winner-reason', text: reason }),

          h('div', { class: 'gm-tug-winner-stats' }, [
            h('div', { class: 'gm-tug-stat-col team-a' }, [
              h('h4', { text: tA.name }),
              h('div', { class: 'big', text: fmtNum(tA.score) }),
              h('div', { text: `${T('statsCorrect')}: ${fmtNum(tA.correctCount)}` }),
              h('div', { text: `${T('statsWrong')}: ${fmtNum(tA.wrongCount)}` }),
              h('div', { text: `${T('statsStreak')}: ${fmtNum(tA.bestStreak)}` }),
            ]),
            h('div', { class: 'gm-tug-stat-mid' }, [
              h('div', { text: T('finalRope') }),
              h('strong', { text: fmtNum(match.ropePosition) }),
              h('div', { class: 'sb-round', text: `${T('roundBoard')}: ${fmtNum(roundWins[0])} - ${fmtNum(roundWins[1])}` }),
            ]),
            h('div', { class: 'gm-tug-stat-col team-b' }, [
              h('h4', { text: tB.name }),
              h('div', { class: 'big', text: fmtNum(tB.score) }),
              h('div', { text: `${T('statsCorrect')}: ${fmtNum(tB.correctCount)}` }),
              h('div', { text: `${T('statsWrong')}: ${fmtNum(tB.wrongCount)}` }),
              h('div', { text: `${T('statsStreak')}: ${fmtNum(tB.bestStreak)}` }),
            ]),
          ]),

          h('div', { class: 'gm-tug-winner-actions' }, [
            h('button', {
              type: 'button',
              class: 'gm-btn gm-primary',
              text: `▶ ${T('nextRound')}`,
              on: { click: () => { roundNumber += 1; startMatch(); } },
            }),
            h('button', {
              type: 'button',
              class: 'gm-btn gm-ghost',
              text: `↻ ${T('playAgain')}`,
              on: { click: () => { startMatch(); } },
            }),
            h('button', {
              type: 'button',
              class: 'gm-btn gm-ghost',
              text: `⚙ ${T('changeSetup')}`,
              on: { click: () => { renderSetup(); } },
            }),
          ]),
        ]),
      ]);
    }

    function renderMatch() {
      updateHud();
      const stageChildren = [
        h('div', { class: 'gm-tug-board' }, [
          buildTeamPanel(0),
          buildArena(),
          buildTeamPanel(1),
        ]),
      ];

      if (match.status === 'paused') {
        stageChildren.push(
          h('div', { class: 'gm-tug-pause-backdrop' }, [
            h('div', { class: 'gm-tug-pause-card' }, [
              h('h3', { text: T('paused') }),
              h('div', { class: 'gm-tug-pause-btns' }, [
                h('button', { type: 'button', class: 'gm-btn gm-primary', text: `▶ ${T('resume')}`, on: { click: togglePause } }),
                h('button', { type: 'button', class: 'gm-btn gm-ghost', text: `↻ ${T('restart')}`, on: { click: startMatch } }),
                h('button', { type: 'button', class: 'gm-btn gm-ghost', text: T('changeSetup'), on: { click: renderSetup } }),
              ]),
            ]),
          ])
        );
      }

      if (match.status === 'finished') {
        stageChildren.push(buildWinnerOverlay());
      }

      body.replaceChildren(h('div', { class: 'gm-tug-root' }, stageChildren));
    }

    // Start at setup screen
    renderSetup();

    return {
      hasProgress: () => !!(match && (match.teams[0].attemptedCount > 0 || match.teams[1].attemptedCount > 0)),
      onRestart: () => {
        if (match) startMatch();
        else renderSetup();
      },
      unmount: () => {
        stopTimer();
      },
    };
  });
})();
