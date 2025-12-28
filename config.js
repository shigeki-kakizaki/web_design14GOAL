"use strict";

// ゲーム全体の設定
const GAME_WIDTH = 800;
const GAME_HEIGHT = 450;

// ステージ（地面・天井ライン）
const GROUND_Y = 400;
const CEILING_HOOK_Y = 80;

// プレイヤーの物理パラメータ
const GRAVITY = 1200;
const MOVE_SPEED = 320;
const JUMP_SPEED = -650;

// ワイヤのパラメータ
const WIRE_SPEED = 900;
const MAX_WIRE_DIST = 500;

// スイング中の「こぎ」の強さ
const SWING_ACCEL = 900;

// 引っ張りジャンプの強さ
const PULL_JUMP_SPEED = 300;
