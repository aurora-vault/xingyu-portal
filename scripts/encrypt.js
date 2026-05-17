// scripts/encrypt.js
// 运行命令: node scripts/encrypt.js <你的密码> <图片路径>

const args = process.argv.slice(2);
const password = args[0] || 'xystart';
const targetUrl = args[1] || '/qr.png';

// 1. 物理 Hash 碰撞引擎
let hash = 0;
for (let i = 0; i < password.length; i++) {
  hash = Math.imul(31, hash) + password.charCodeAt(i) | 0;
}

// 2. XOR 位运算加密引擎
const cipher = Array.from(targetUrl).map((char, i) => {
  const hex = (char.charCodeAt(0) ^ password.charCodeAt(i % password.length)).toString(16);
  return hex.padStart(2, '0');
}).join('');

// 3. 终端可视化输出
console.log('=========================================');
console.log('🔐 行遇 MVP 终端加密引擎配置清单');
console.log('=========================================');
console.log(`当前设置密码: ${password}`);
console.log(`当前目标路径: ${targetUrl}`);
console.log('-----------------------------------------');
console.log('请将以下内容复制到项目根目录的 .env 文件中：\n');
console.log(`VITE_INVITE_HASH=${hash}`);
console.log(`VITE_QR_CIPHER=${cipher}`);
console.log('=========================================');
