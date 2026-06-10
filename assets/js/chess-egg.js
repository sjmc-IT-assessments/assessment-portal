// chess-egg.js — secret Easter egg, unlocked after completing an exam
(function () {
    'use strict';

    // ─── Riddles ──────────────────────────────────────────────────────────────
    const RIDDLES = [
        {
            q: 'I have cities, but no houses live there. Mountains, but no trees grow there. Water, but no fish swim there. Roads, but no cars drive there. What am I?',
            a: ['map', 'a map']
        },
        {
            q: 'The more you take, the more you leave behind. What am I?',
            a: ['footsteps', 'steps', 'foot steps']
        },
        {
            q: 'I speak without a mouth and hear without ears. I have no body, but I come alive with the wind. What am I?',
            a: ['echo', 'an echo']
        },
        {
            q: 'I can fill a room but take up no space. What am I?',
            a: ['light']
        },
        {
            q: 'I have a head and a tail, but no body. What am I?',
            a: ['a coin', 'coin']
        },
        {
            q: 'The more I dry, the wetter I get. What am I?',
            a: ['a towel', 'towel']
        },
        {
            q: 'What can travel around the world while staying in a corner?',
            a: ['a stamp', 'stamp', 'postage stamp', 'a postage stamp']
        },
        {
            q: "I'm tall when I'm young and short when I'm old. What am I?",
            a: ['a candle', 'candle']
        }
    ];

    // ─── Chess data ───────────────────────────────────────────────────────────
    const SYMBOLS = {
        wp: '♙', wr: '♖', wn: '♘', wb: '♗', wq: '♕', wk: '♔',
        bp: '♟', br: '♜', bn: '♞', bb: '♝', bq: '♛', bk: '♚'
    };

    const PIECE_VAL = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

    const PAWN_TBL = [
         0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0
    ];

    const KNIGHT_TBL = [
        -50,-40,-30,-30,-30,-30,-40,-50,
        -40,-20,  0,  0,  0,  0,-20,-40,
        -30,  0, 10, 15, 15, 10,  0,-30,
        -30,  5, 15, 20, 20, 15,  5,-30,
        -30,  0, 15, 20, 20, 15,  0,-30,
        -30,  5, 10, 15, 15, 10,  5,-30,
        -40,-20,  0,  5,  5,  0,-20,-40,
        -50,-40,-30,-30,-30,-30,-40,-50
    ];

    function posBonus(type, sq, color) {
        const f = sq.charCodeAt(0) - 97;
        const r = parseInt(sq[1]) - 1;
        const i = color === 'w' ? (7 - r) * 8 + f : r * 8 + f;
        if (type === 'p') return PAWN_TBL[i];
        if (type === 'n') return KNIGHT_TBL[i];
        return 0;
    }

    function evaluate(chess) {
        if (chess.in_checkmate()) return chess.turn() === 'w' ? -99999 : 99999;
        if (chess.in_draw() || chess.in_stalemate() || chess.in_threefold_repetition()) return 0;
        let score = 0;
        chess.board().forEach((row, ri) => {
            row.forEach((p, fi) => {
                if (!p) return;
                const sq = String.fromCharCode(97 + fi) + (8 - ri);
                const v = PIECE_VAL[p.type] + posBonus(p.type, sq, p.color);
                score += p.color === 'w' ? v : -v;
            });
        });
        return score;
    }

    function minimax(chess, depth, alpha, beta, maximizing) {
        if (depth === 0 || chess.game_over()) return evaluate(chess);
        const moves = chess.moves();
        // Captures first — better alpha-beta pruning
        moves.sort((a, b) => (b.includes('x') ? 1 : 0) - (a.includes('x') ? 1 : 0));
        let best = maximizing ? -Infinity : Infinity;
        for (const m of moves) {
            chess.move(m);
            const val = minimax(chess, depth - 1, alpha, beta, !maximizing);
            chess.undo();
            if (maximizing) { if (val > best) best = val; if (val > alpha) alpha = val; }
            else            { if (val < best) best = val; if (val < beta)  beta  = val; }
            if (beta <= alpha) break;
        }
        return best;
    }

    function getBestMove(chess, depth, easy) {
        const moves = chess.moves();
        if (!moves.length) return null;
        // Basic mode: ~40% of the time just pick a random move
        if (easy && Math.random() < 0.4) return moves[Math.floor(Math.random() * moves.length)];
        let best = null, bestVal = Infinity;
        for (const m of moves) {
            chess.move(m);
            const val = minimax(chess, depth - 1, -Infinity, Infinity, true);
            chess.undo();
            if (val < bestVal) { bestVal = val; best = m; }
        }
        return best;
    }

    // ─── State ────────────────────────────────────────────────────────────────
    let game       = null;
    let selected   = null;
    let targets    = [];
    let lastMove   = null;
    let difficulty = 'basic';
    let aiThinking = false;
    let riddleIdx  = 0;

    const $ = id => document.getElementById(id);

    // ─── Boot ─────────────────────────────────────────────────────────────────
    function init() {
        injectStyles();
        buildModals();
        addTrigger();
    }

    // ─── Tiny trigger ─────────────────────────────────────────────────────────
    function addTrigger() {
        const el = document.createElement('div');
        el.className = 'egg-trigger';
        el.textContent = '♟';
        el.setAttribute('aria-hidden', 'true');
        el.addEventListener('click', showOath);
        document.body.appendChild(el);
    }

    // ─── Modals ───────────────────────────────────────────────────────────────
    function buildModals() {
        document.body.insertAdjacentHTML('beforeend', `
            <div id="egg-oath" class="egg-overlay" style="display:none">
                <div class="egg-modal">
                    <div class="egg-icon">♟</div>
                    <h3>Before you proceed…</h3>
                    <p>I solemnly swear that I have completed my exam and carefully read through all of my answers.</p>
                    <div class="egg-btn-row">
                        <button class="egg-btn-yes" id="egg-promise">I Promise ✓</button>
                        <button class="egg-btn-no"  id="egg-notyet">Not Yet</button>
                    </div>
                </div>
            </div>

            <div id="egg-riddle" class="egg-overlay" style="display:none">
                <div class="egg-modal">
                    <div class="egg-icon">🔐</div>
                    <h3>Unlock the board</h3>
                    <p id="egg-riddle-q"></p>
                    <input id="egg-riddle-inp" class="egg-riddle-inp" type="text"
                           placeholder="Your answer…" autocomplete="off">
                    <p id="egg-riddle-err" class="egg-riddle-err" style="display:none">
                        Not quite — try again!
                    </p>
                    <div class="egg-btn-row">
                        <button class="egg-btn-yes" id="egg-riddle-sub">Submit ↵</button>
                    </div>
                </div>
            </div>
        `);

        $('egg-promise').addEventListener('click', () => {
            $('egg-oath').style.display = 'none';
            showRiddle();
        });
        $('egg-notyet').addEventListener('click', () => {
            $('egg-oath').style.display = 'none';
        });
        $('egg-riddle-sub').addEventListener('click', checkAnswer);
        $('egg-riddle-inp').addEventListener('keydown', e => { if (e.key === 'Enter') checkAnswer(); });
    }

    function showOath() { $('egg-oath').style.display = 'flex'; }

    function showRiddle() {
        riddleIdx = Math.floor(Math.random() * RIDDLES.length);
        $('egg-riddle-q').textContent = RIDDLES[riddleIdx].q;
        $('egg-riddle-inp').value = '';
        $('egg-riddle-err').style.display = 'none';
        $('egg-riddle').style.display = 'flex';
        setTimeout(() => $('egg-riddle-inp').focus(), 80);
    }

    function checkAnswer() {
        const ans = $('egg-riddle-inp').value.trim().toLowerCase();
        if (RIDDLES[riddleIdx].a.includes(ans)) {
            $('egg-riddle').style.display = 'none';
            launchChess();
        } else {
            $('egg-riddle-err').style.display = 'block';
            $('egg-riddle-inp').value = '';
            $('egg-riddle-inp').focus();
        }
    }

    // ─── Chess launch ─────────────────────────────────────────────────────────
    function launchChess() {
        if (typeof Chess === 'undefined') {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js';
            s.onload = openPanel;
            document.head.appendChild(s);
        } else {
            openPanel();
        }
    }

    function openPanel() {
        game = new Chess();
        selected = null; targets = []; lastMove = null; aiThinking = false;

        const grid = document.querySelector('.assessments-grid');
        if (grid) grid.style.display = 'none';

        let panel = $('egg-panel');
        if (!panel) {
            panel = document.createElement('div');
            panel.id = 'egg-panel';
            const host = $('gradeContent') || document.querySelector('.container');
            host.appendChild(panel);
        }
        panel.style.display = 'block';
        renderPanel();
    }

    function closePanel() {
        const panel = $('egg-panel');
        if (panel) panel.style.display = 'none';
        const grid = document.querySelector('.assessments-grid');
        if (grid) grid.style.display = '';
    }

    // ─── Chess panel ──────────────────────────────────────────────────────────
    function renderPanel() {
        $('egg-panel').innerHTML = `
            <div class="egg-panel-inner">
                <div class="egg-panel-head">
                    <span class="egg-panel-label">Practice Mode</span>
                    <div class="egg-diff-row">
                        <button class="egg-diff-btn${difficulty === 'basic' ? ' active' : ''}" id="egg-d-basic">Basic</button>
                        <button class="egg-diff-btn${difficulty === 'hard'  ? ' active' : ''}" id="egg-d-hard">Hard Mode</button>
                    </div>
                </div>
                <div id="egg-status" class="egg-status">Your turn — you are White</div>
                <div id="egg-board" class="egg-board"></div>
                <div class="egg-panel-foot">
                    <button class="egg-new-btn" id="egg-new">New Game</button>
                    <button class="egg-back-btn" id="egg-back">← Back to Portal</button>
                </div>
            </div>
        `;
        $('egg-d-basic').addEventListener('click', () => setDiff('basic'));
        $('egg-d-hard').addEventListener('click',  () => setDiff('hard'));
        $('egg-new').addEventListener('click', newGame);
        $('egg-back').addEventListener('click', closePanel);
        drawBoard();
    }

    function setDiff(d) {
        difficulty = d;
        $('egg-d-basic').classList.toggle('active', d === 'basic');
        $('egg-d-hard').classList.toggle('active',  d === 'hard');
        newGame();
    }

    function newGame() {
        game = new Chess();
        selected = null; targets = []; lastMove = null; aiThinking = false;
        $('egg-status').textContent = 'Your turn — you are White';
        drawBoard();
    }

    function drawBoard() {
        const board = $('egg-board');
        if (!board) return;
        board.innerHTML = '';
        const pos = game.board();

        for (let r = 0; r < 8; r++) {
            for (let f = 0; f < 8; f++) {
                const sq = String.fromCharCode(97 + f) + (8 - r);
                const piece = pos[r][f];
                const light = (r + f) % 2 === 0;

                const cell = document.createElement('div');
                cell.className = `egg-sq ${light ? 'sq-light' : 'sq-dark'}`;
                cell.dataset.sq = sq;

                if (sq === selected) cell.classList.add('sq-selected');
                if (lastMove && (sq === lastMove.from || sq === lastMove.to))
                    cell.classList.add('sq-last');
                if (targets.includes(sq))
                    cell.classList.add(piece ? 'sq-capture' : 'sq-dot');

                if (piece) {
                    cell.textContent = SYMBOLS[piece.color + piece.type] || '';
                    cell.dataset.pieceColor = piece.color;
                }

                cell.addEventListener('click', () => onSquareClick(sq));
                board.appendChild(cell);
            }
        }
    }

    function onSquareClick(sq) {
        if (aiThinking || game.game_over() || game.turn() !== 'w') return;

        // Execute a pending move
        if (selected && targets.includes(sq)) {
            const mv = game.move({ from: selected, to: sq, promotion: 'q' });
            if (mv) {
                lastMove = mv;
                selected = null; targets = [];
                drawBoard();
                updateStatus();
                if (!game.game_over()) scheduleAI();
            }
            return;
        }

        // Select a white piece
        const r = 8 - parseInt(sq[1]);
        const f = sq.charCodeAt(0) - 97;
        const piece = game.board()[r][f];

        if (piece && piece.color === 'w') {
            selected = sq;
            targets = game.moves({ square: sq, verbose: true }).map(m => m.to);
        } else {
            selected = null; targets = [];
        }
        drawBoard();
    }

    function scheduleAI() {
        aiThinking = true;
        $('egg-status').textContent = 'Thinking…';
        const delay = difficulty === 'hard' ? 500 : 280;
        setTimeout(() => {
            const depth = difficulty === 'hard' ? 3 : 2;
            const mv = getBestMove(game, depth, difficulty === 'basic');
            if (mv) { const r = game.move(mv); if (r) lastMove = r; }
            aiThinking = false;
            selected = null; targets = [];
            drawBoard();
            updateStatus();
        }, delay);
    }

    function updateStatus() {
        const el = $('egg-status');
        if (!el) return;
        if (game.in_checkmate())
            el.textContent = game.turn() === 'w' ? '💀 Checkmate — AI wins!' : '🎉 Checkmate — You win!';
        else if (game.in_stalemate() || game.in_draw())
            el.textContent = '🤝 Draw';
        else if (game.in_check())
            el.textContent = game.turn() === 'w' ? '⚠️ You are in check!' : '⚠️ AI is in check';
        else
            el.textContent = game.turn() === 'w' ? 'Your turn' : 'AI\'s turn…';
    }

    // ─── Styles ───────────────────────────────────────────────────────────────
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
/* Trigger */
.egg-trigger {
    position: fixed; bottom: 14px; right: 18px;
    font-size: 15px; color: #0a2b72; opacity: 0.18;
    cursor: pointer; user-select: none; z-index: 50;
    transition: opacity 0.2s;
}
.egg-trigger:hover { opacity: 0.6; }

/* Modal overlay */
.egg-overlay {
    position: fixed; inset: 0;
    background: rgba(10, 22, 60, 0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 9000; padding: 16px;
}
.egg-modal {
    background: #fff; border-radius: 14px;
    padding: 34px 30px; max-width: 400px; width: 100%;
    text-align: center;
    box-shadow: 0 24px 60px rgba(0,0,0,0.22);
    animation: egg-pop 0.18s ease;
}
@keyframes egg-pop {
    from { transform: scale(0.93); opacity: 0; }
    to   { transform: scale(1);    opacity: 1; }
}
.egg-icon  { font-size: 40px; margin-bottom: 12px; line-height: 1; }
.egg-modal h3 { margin: 0 0 10px; font-size: 1.2rem; color: #0a2b72; }
.egg-modal p  { margin: 0 0 22px; color: #475569; line-height: 1.65; font-size: 0.93rem; }
.egg-btn-row  { display: flex; gap: 10px; justify-content: center; }
.egg-btn-yes {
    background: #0a2b72; color: #fff; border: none;
    padding: 10px 24px; border-radius: 8px; font-size: 0.93rem;
    font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.egg-btn-yes:hover { background: #1e40af; }
.egg-btn-no {
    background: #f1f5f9; color: #64748b; border: none;
    padding: 10px 24px; border-radius: 8px; font-size: 0.93rem;
    cursor: pointer;
}
.egg-btn-no:hover { background: #e2e8f0; }
.egg-riddle-inp {
    width: 100%; box-sizing: border-box;
    padding: 10px 13px; border: 2px solid #e2e8f0;
    border-radius: 8px; font-size: 1rem; margin-bottom: 8px;
    transition: border-color 0.15s;
}
.egg-riddle-inp:focus { outline: none; border-color: #0a2b72; }
.egg-riddle-err { color: #ef4444; font-size: 0.83rem; margin: 0 0 12px; }

/* Chess panel */
#egg-panel { padding: 8px 0 20px; }
.egg-panel-inner {
    background: #fff; border-radius: 12px;
    padding: 16px 18px 18px; max-width: 380px;
    margin: 0 auto;
    box-shadow: 0 2px 14px rgba(0,0,0,0.09);
}
.egg-panel-head {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 8px; gap: 8px;
}
.egg-panel-label { font-size: 0.83rem; font-weight: 600; color: #334155; }
.egg-diff-row { display: flex; gap: 5px; }
.egg-diff-btn {
    padding: 3px 11px; border: 2px solid #e2e8f0;
    border-radius: 6px; background: #fff;
    font-size: 0.75rem; font-weight: 500; color: #64748b;
    cursor: pointer; transition: all 0.12s;
}
.egg-diff-btn.active {
    border-color: #0a2b72; background: #eff2ff; color: #0a2b72; font-weight: 700;
}
.egg-status {
    font-size: 0.8rem; color: #64748b;
    margin-bottom: 8px; min-height: 17px;
}

/* Board */
.egg-board {
    display: grid; grid-template-columns: repeat(8, 1fr);
    width: 100%; border: 2px solid #0a2b72;
    border-radius: 3px; overflow: hidden; user-select: none;
}
.egg-sq {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: clamp(1rem, 4.2vw, 1.5rem);
    cursor: pointer; position: relative; transition: background 0.08s;
}
.sq-light { background: #eef2fa; }
.sq-dark  { background: #0a2b72; }
.sq-selected  { background: #f59e0b !important; }
.sq-last { outline: 2px solid #86efac; outline-offset: -2px; }
.sq-dot::after {
    content: ''; position: absolute;
    width: 30%; height: 30%; border-radius: 50%;
    background: rgba(0,0,0,0.2); pointer-events: none;
    top: 50%; left: 50%; transform: translate(-50%,-50%);
}
.sq-capture { outline: 3px solid #ef4444; outline-offset: -3px; }
[data-piece-color="w"] {
    color: #ffffff;
    -webkit-text-stroke: 1.5px #0a2b72;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.35));
}
[data-piece-color="b"] {
    color: #fde68a;
    -webkit-text-stroke: 1.5px #1e293b;
    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));
}

/* Panel footer */
.egg-panel-foot {
    display: flex; justify-content: space-between;
    align-items: center; margin-top: 10px;
}
.egg-new-btn {
    background: #0a2b72; color: #fff; border: none;
    padding: 6px 16px; border-radius: 7px;
    font-size: 0.8rem; font-weight: 600; cursor: pointer;
}
.egg-new-btn:hover { background: #1e40af; }
.egg-back-btn {
    background: none; color: #94a3b8; border: none;
    font-size: 0.78rem; cursor: pointer; text-decoration: underline; padding: 0;
}
.egg-back-btn:hover { color: #475569; }
        `;
        document.head.appendChild(style);
    }

    // ─── Start ────────────────────────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
