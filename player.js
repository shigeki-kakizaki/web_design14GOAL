"use strict";

// プレイヤーの状態
const player = {
  x: 150,
  y: 300,
  prevY: 300,   // ★ 前フレームのY位置を追加
  vx: 0,
  vy: 0,
  r: 16,
  onGround: false,
  dir: 1 // 1:右向き, -1:左向き
};

function resetPlayer() {
  player.x = 150;
  player.y = 300;
  player.prevY = 300;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.dir = 1;
}

// 通常状態の更新（足場に乗る処理を追加）
function updatePlayerNormal(dt, keys) {
  // ★ 移動前のYを保存しておく
  player.prevY = player.y;

  // 左右移動
  if (player.onGround) {
    if (keys.left) {
      player.vx = -MOVE_SPEED;
      player.dir = -1;
    } else if (keys.right) {
      player.vx = MOVE_SPEED;
      player.dir = 1;
    }
    // キーを押していないときは vx をそのまま（慣性を残す）
  } else {
    if (keys.left) {
      player.vx -= MOVE_SPEED*0.01;
      player.dir = -1;
    } else if (keys.right) {
      player.vx += MOVE_SPEED*0.01;
      player.dir = 1;
    }
    // キーを押していないときは vx をそのまま（慣性を残す）
  }

  // 重力
  player.vy += GRAVITY * dt;

  // 位置更新
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // --- 地面との当たり判定 ---
  if (player.y + player.r > GROUND_Y) {
    player.y = GROUND_Y - player.r;
    player.vy = 0;
    player.onGround = true;
  } else {
    player.onGround = false;
  }

  // --- 足場との当たり判定（上から乗る）---
  // 足場の情報（drawBackground と合わせてある）
  const platX = 120;
  const platY = 320;
  const platW = 200;
  const platH = 20; // 今回は高さは使わない（上面だけ使う）

  // 落下中のときだけ判定（上向きのときは無視）
  if (player.vy >= 0) {
    const prevBottom = player.prevY + player.r;
    const currBottom = player.y + player.r;

    const withinX =
      player.x > platX &&
      player.x < platX + platW;

    const crossedTop =
      prevBottom <= platY &&   // 前フレームでは足場の上面より上
      currBottom >= platY;     // 今フレームで上面を通過した

    if (withinX && crossedTop) {
      // 足場の上に乗せる
      player.y = platY - player.r;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // 地上にいて、左右キーも押していないなら止める
  if (player.onGround && !keys.left && !keys.right) {
    player.vx = 0;
  }

  // 画面端の制限
  if (player.x - player.r < 0) {
    player.x = player.r;
  }
  if (player.x + player.r > GAME_WIDTH) {
    player.x = GAME_WIDTH - player.r;
  }
}

// フック中（振り子）の更新（ここも prevY を更新しておくと安全）
function updatePlayerSwing(dt, keys, wire) {
  player.prevY = player.y;

  const ax = wire.ex;
  const ay = wire.ey;
  const R = wire.length;

  // 重力
  player.vy += GRAVITY * dt;

  // 自由落下
  player.x += player.vx * dt;
  player.y += player.vy * dt;

  // アンカーからプレイヤーへのベクトル
  let dx = player.x - ax;
  let dy = player.y - ay;
  let dist = Math.hypot(dx, dy);

  if (dist === 0) {
    dist = 0.0001;
    dx = 0;
    dy = 1;
  }

  dx /= dist;
  dy /= dist;

  // 円周上に押し戻す
  player.x = ax + dx * R;
  player.y = ay + dy * R;

  // ロープ方向成分を削る
  const vr = player.vx * dx + player.vy * dy;
  player.vx -= vr * dx;
  player.vy -= vr * dy;

  // スイング操作（こぐ）
  const tx = dy;
  const ty = dx;

  if (keys.left) {
    player.vx -= tx * SWING_ACCEL * dt;
    player.vy -= ty * SWING_ACCEL * dt;
  }
  if (keys.right) {
    player.vx += tx * SWING_ACCEL * dt;
    player.vy += ty * SWING_ACCEL * dt;
  }

  player.onGround = false;
}

// プレイヤー描画
function drawPlayer(ctx) {
  ctx.fillStyle = "#ffb347";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#000";
  ctx.beginPath();
  ctx.moveTo(player.x, player.y);
  ctx.lineTo(player.x + player.dir * player.r, player.y);
  ctx.stroke();
}
