"use strict";

// ワイヤの状態管理
const wire = {
  phase: "none", // "none" | "flying" | "hooked"
  sx: 0, sy: 0,  // 発射位置
  ex: 0, ey: 0,  // 先端 or アンカー位置
  vx: 0, vy: 0,  // 先端の速度（飛行中）
  length: 0      // プレイヤーとの距離（フック後）
};

function resetWire() {
  wire.phase = "none";
  wire.sx = wire.sy = wire.ex = wire.ey = 0;
  wire.vx = wire.vy = 0;
  wire.length = 0;
}

// マウス方向にワイヤを発射
function fireWireToMouse(mouseX, mouseY) {
  if (wire.phase !== "none") return; // 既に存在する場合は何もしない

  wire.phase = "flying";
  wire.sx = player.x;
  wire.sy = player.y;
  wire.ex = player.x;
  wire.ey = player.y;

  let dx = mouseX - player.x;
  let dy = mouseY - player.y;
  let len = Math.hypot(dx, dy) || 1;
  dx /= len;
  dy /= len;

  wire.vx = dx * WIRE_SPEED;
  wire.vy = dy * WIRE_SPEED;
  wire.length = 0;
}

// ワイヤ解除
function detachWire() {
  wire.phase = "none";
}

// ワイヤの更新（飛行中→フックなど）
function updateWire(dt) {
  if (wire.phase === "flying") {
    wire.ex += wire.vx * dt;
    wire.ey += wire.vy * dt;

    const dx = wire.ex - wire.sx;
    const dy = wire.ey - wire.sy;
    const dist = Math.hypot(dx, dy);

    // 「天井」に届いたらフック
    if (wire.ey <= CEILING_HOOK_Y) {
      wire.phase = "hooked";
      wire.length = Math.hypot(player.x - wire.ex, player.y - wire.ey);
      if (wire.length < 60) {
        wire.length = 60; // 近すぎると不自然なので最低長さを確保
      }
      return;
    }

    // 画面外 or 射程距離を超えたらキャンセル
    if (
      dist > MAX_WIRE_DIST ||
      wire.ex < 0 || wire.ex > GAME_WIDTH ||
      wire.ey < 0 || wire.ey > GAME_HEIGHT
    ) {
      detachWire();
    }
  }
}

// ワイヤの描画
function drawWire(ctx) {
  if (wire.phase === "none") return;

  // ロープ本体
  ctx.strokeStyle = "#7ef5e1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(wire.ex, wire.ey);
  ctx.stroke();

  // フックしているときはアンカーの目印
  if (wire.phase === "hooked") {
    ctx.fillStyle = "#e6ff80";
    ctx.beginPath();
    ctx.arc(wire.ex, wire.ey, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}
