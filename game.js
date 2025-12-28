"use strict";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;

// 入力状態
const keys = {
  left: false,
  right: false
};

const mouse = {
  x: GAME_WIDTH / 2,
  y: GAME_HEIGHT / 2
};

let lastTime = 0;

// キー入力
function handleKeyDown(e) {
  switch (e.key) {
    case "ArrowLeft":
      keys.left = true;
      player.dir = -1;
      break;
    case "ArrowRight":
      keys.right = true;
      player.dir = 1;
      break;
    case " ":
      // Space: 通常はジャンプ、フック中は「ワイヤ方向ジャンプ」
      if (wire.phase === "hooked") {
        pullJumpFromWire();
      } else if (player.onGround) {
        player.vy = JUMP_SPEED;
        player.onGround = false;
      }
      break;
    case "x":
    case "X":
      // ワイヤ解除
      if (wire.phase === "hooked" || wire.phase === "flying") {
        detachWire();
      }
      break;
  }
}

function handleKeyUp(e) {
  switch (e.key) {
    case "ArrowLeft":
      keys.left = false;
      break;
    case "ArrowRight":
      keys.right = false;
      break;
  }
}

// マウス入力
function handleMouseMove(e) {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
}

function handleMouseDown(e) {
  // 左クリックでマウス方向にワイヤ発射
  if (e.button === 0) {
    fireWireToMouse(mouse.x, mouse.y);
  }
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
canvas.addEventListener("mousemove", handleMouseMove);
canvas.addEventListener("mousedown", handleMouseDown);

// フック中の「ワイヤ方向ジャンプ」
function pullJumpFromWire() {
  if (wire.phase !== "hooked") return;

  const ax = wire.ex;
  const ay = wire.ey;

  // プレイヤー → アンカー方向のベクトル（ワイヤの向き）
  let dx = ax - player.x;
  let dy = ay - player.y;
  let dist = Math.hypot(dx, dy);    // Math.hypot()引数の2乗の合計の平方根、３平方の定理

  if (dist === 0) {
    dist = 0.0001;
    dx = 0;
    dy = -1;
  }

  // 単位ベクトル（ワイヤ方向）
  dx /= dist;
  dy /= dist;

  // 👉 ワイヤ方向に速度を「追加」する
  player.vx += dx * PULL_JUMP_SPEED;
  player.vy += dy * PULL_JUMP_SPEED;

  // そのまま慣性で飛んでいくイメージで解除
  detachWire();
}

// 更新
function update(dt) {
  // 先にワイヤの状態を更新（flying→hooked など）
  updateWire(dt);

  // フック中かどうかで処理を分ける
  if (wire.phase === "hooked") {
    updatePlayerSwing(dt, keys, wire);
  } else {
    updatePlayerNormal(dt, keys);
  }
}

// 背景とステージの描画
function drawBackground() {
  // 背景
  ctx.fillStyle = "#151a28";
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  // 天井ライン（フックの目安）
  ctx.strokeStyle = "#444";
  ctx.beginPath();
  ctx.moveTo(0, CEILING_HOOK_Y);
  ctx.lineTo(GAME_WIDTH, CEILING_HOOK_Y);
  ctx.stroke();

  // 地面
  ctx.fillStyle = "#30384a";
  ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

  // 少し高めの足場（14-2のイメージ）
  ctx.fillStyle = "#3b465e";
  ctx.fillRect(120, 320, 200, 20);
}

// HUD
function drawHUD() {
  ctx.fillStyle = "#fff";
  ctx.font = "14px system-ui";
  ctx.fillText("←→: 移動 / Space: ジャンプ（フック中はワイヤ方向ジャンプ）", 20, 24);
  ctx.fillText("左クリック: マウス方向にワイヤ発射 / X: ワイヤ解除", 20, 44);
}

// 描画
function draw() {
  drawBackground();
  drawWire(ctx);
  drawPlayer(ctx);
  drawHUD();
}

// メインループ
function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

// 初期化してスタート
resetPlayer();
resetWire();
requestAnimationFrame(loop);
