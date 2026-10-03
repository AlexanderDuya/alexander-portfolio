/* =========================
   TRANSFER DEMO
========================= */
(() => {
  const range = document.getElementById("amountRange");
  const out = document.getElementById("amount");
  const note = document.getElementById("amountNote");
  if (!range || !out) return;

  const fmt = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  });
  const update = () => {
    const v = Number(range.value);
    out.textContent = fmt.format(v);
    note.textContent =
      v >= 10000
        ? "The High Volume team's goal: this should feel as simple as sending £100."
        : "Sending a small amount is easy. Now try dragging the slider to £100,000.";
  };
  range.addEventListener("input", update);
  update();
})();

/* =========================
   SNAKE GAME
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const board = document.getElementById("gameBoard");
  const btn = document.getElementById("resetBtn");
  if (!board || !btn) return;
  const ctx = board.getContext("2d");
  if (!ctx) return;

  const scoreEl = document.getElementById("scoreText");
  const bestEl = document.getElementById("highScoreText");
  const playsEl = document.getElementById("howManyPlayed");

  const U = 25;
  const N = Math.floor(board.width / U);
  const TICK = 100;
  const C = {
    bg: "#0f2400",
    snake: "#9fe870",
    head: "#ffffff",
    food: "#ffc091",
    panel: "#163300",
    text: "#e2f6d5",
  };

  let snake,
    dir,
    queue,
    food,
    score = 0,
    best = 0,
    plays = 0,
    running = false,
    timer = null;

  const showScores = () => {
    scoreEl.textContent = score;
    bestEl.textContent = best;
    playsEl.textContent = plays;
  };

  const cell = (x, y, colour, inset = 1) => {
    ctx.fillStyle = colour;
    ctx.fillRect(x * U + inset, y * U + inset, U - inset * 2, U - inset * 2);
  };

  function draw() {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, board.width, board.height);
    cell(food.x, food.y, C.food, 4);
    snake.forEach((p, i) => cell(p.x, p.y, i === 0 ? C.head : C.snake));
  }

  function placeFood() {
    const free = [];
    for (let x = 0; x < N; x++)
      for (let y = 0; y < N; y++)
        if (!snake.some((p) => p.x === x && p.y === y)) free.push({ x, y });
    if (!free.length) return false;
    food = free[Math.floor(Math.random() * free.length)];
    return true;
  }

  function reset() {
    const m = Math.floor(N / 2);
    snake = [
      { x: m, y: m },
      { x: m - 1, y: m },
      { x: m - 2, y: m },
    ];
    dir = { x: 1, y: 0 };
    queue = [];
    score = 0;
    placeFood();
    showScores();
    draw();
  }

  function start() {
    clearTimeout(timer);
    plays += 1;
    running = true;
    reset();
    btn.textContent = "Restart game";
    timer = setTimeout(tick, TICK);
  }

  function end(won) {
    running = false;
    clearTimeout(timer);
    btn.textContent = "Play again";
    draw();
    ctx.fillStyle = C.panel;
    ctx.fillRect(0, board.height / 2 - 48, board.width, 96);
    ctx.fillStyle = C.snake;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "800 32px 'Bricolage Grotesque', Arial, sans-serif";
    ctx.fillText(
      won ? "You win!" : "Game over",
      board.width / 2,
      board.height / 2 - 12
    );
    ctx.fillStyle = C.text;
    ctx.font = "500 18px 'Bricolage Grotesque', Arial, sans-serif";
    ctx.fillText(
      `Score ${score}. Press Play again.`,
      board.width / 2,
      board.height / 2 + 24
    );
    showScores();
  }

  function tick() {
    if (!running) return;
    if (queue.length) dir = queue.shift();

    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const ate = head.x === food.x && head.y === food.y;
    // The tail moves away this turn, so it's safe to step into it unless we just ate.
    const body = ate ? snake : snake.slice(0, -1);
    const hit =
      head.x < 0 ||
      head.y < 0 ||
      head.x >= N ||
      head.y >= N ||
      body.some((p) => p.x === head.x && p.y === head.y);
    if (hit) return end(false);

    snake.unshift(head);
    if (ate) {
      score += 1;
      best = Math.max(best, score);
      showScores();
      if (!placeFood()) return end(true);
    } else {
      snake.pop();
    }
    draw();
    timer = setTimeout(tick, TICK);
  }

  // Queue turns so two quick key presses can't reverse the snake into itself.
  function turn(x, y) {
    if (!running) return;
    const last = queue.length ? queue[queue.length - 1] : dir;
    if ((last.x !== 0 && x !== 0) || (last.y !== 0 && y !== 0)) return;
    if (queue.length < 3) queue.push({ x, y });
  }

  const keys = {
    ArrowLeft: [-1, 0],
    a: [-1, 0],
    A: [-1, 0],
    ArrowRight: [1, 0],
    d: [1, 0],
    D: [1, 0],
    ArrowUp: [0, -1],
    w: [0, -1],
    W: [0, -1],
    ArrowDown: [0, 1],
    s: [0, 1],
    S: [0, 1],
  };

  window.addEventListener("keydown", (e) => {
    const k = keys[e.key];
    if (!k || !running) return; // Arrow keys scroll the page normally unless a game is running.
    e.preventDefault();
    turn(k[0], k[1]);
  });

  let touch = null;
  board.addEventListener(
    "touchstart",
    (e) => {
      touch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    },
    { passive: true }
  );
  board.addEventListener("touchend", (e) => {
    if (!touch) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
    if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? 1 : -1, 0);
    else turn(0, dy > 0 ? 1 : -1);
  });

  btn.addEventListener("click", start);

  reset();
  btn.textContent = "Start game";
});
