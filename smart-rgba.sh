#!/bin/bash

cd /c/Users/qxn/Downloads/GYYG-improved/src

# 备份
cp themes.ts themes.ts.backup2

# 使用Node.js进行智能替换
node << 'EOF'
const fs = require('fs');

function rgbaToSolid(r, g, b, a) {
  // 根据透明度混合到背景色
  // 对于浅色主题，背景是 #f5f5f5 (245)
  // 对于深色主题，背景是 #141414 (20)

  // 判断是浅色还是深色（基于RGB亮度）
  const brightness = (r + g + b) / 3;
  let bgR, bgG, bgB;

  if (brightness > 128) {
    // 浅色，混合到白色背景
    bgR = bgG = bgB = 245;
  } else {
    // 深色，混合到深色背景
    bgR = bgG = bgB = 20;
  }

  const finalR = Math.round(r * a + bgR * (1 - a));
  const finalG = Math.round(g * a + bgG * (1 - a));
  const finalB = Math.round(b * a + bgB * (1 - a));

  return `#${finalR.toString(16).padStart(2, '0')}${finalG.toString(16).padStart(2, '0')}${finalB.toString(16).padStart(2, '0')}`;
}

let content = fs.readFileSync('themes.ts', 'utf8');

// 替换所有rgba
content = content.replace(/'rgba\((\d+),(\d+),(\d+),([\d.]+)\)'/g, (match, r, g, b, a) => {
  const hex = rgbaToSolid(parseInt(r), parseInt(g), parseInt(b), parseFloat(a));
  return `'${hex}'`;
});

// 移除wallpaper中的transparent部分
content = content.replace(/radial-gradient\([^)]+\),\s*/g, '');

fs.writeFileSync('themes.ts', content);
console.log('完成！已转换所有rgba为实色');
EOF
