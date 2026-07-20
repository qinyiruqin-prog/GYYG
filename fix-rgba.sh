#!/bin/bash

# 批量替换themes.ts中的rgba为实色

cd /c/Users/qxn/Downloads/GYYG-improved/src

# 备份原文件
cp themes.ts themes.ts.backup

# 替换常见的rgba值为实色
# 白色半透明 -> 灰色实色
sed -i "s/'rgba(255,255,255,0.05)'/'#1f1f1f'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.09)'/'#262626'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.08)'/'#282828'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.15)'/'#333333'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.14)'/'#353535'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.07)'/'#252525'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.12)'/'#2d2d2d'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.18)'/'#383838'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.20)'/'#3a3a3a'/g" themes.ts
sed -i "s/'rgba(255,255,255,0.22)'/'#3d3d3d'/g" themes.ts

# 黑色半透明 -> 灰色实色
sed -i "s/'rgba(0,0,0,0.04)'/'#e5e5e5'/g" themes.ts
sed -i "s/'rgba(0,0,0,0.08)'/'#dfdfdf'/g" themes.ts
sed -i "s/'rgba(0,0,0,0.07)'/'#e0e0e0'/g" themes.ts
sed -i "s/'rgba(0,0,0,0.14)'/'#d5d5d5'/g" themes.ts
sed -i "s/'rgba(0,0,0,0.12)'/'#d0d0d0'/g" themes.ts
sed -i "s/'rgba(0,0,0,0.06)'/'#e3e3e3'/g" themes.ts
sed -i "s/'rgba(0,0,0,0.05)'/'#e8e8e8'/g" themes.ts
sed -i "s/'rgba(0,0,0,0.10)'/'#dadada'/g" themes.ts

# 移除wallpaper中的transparent
sed -i "s/, transparent [0-9]*%)//g" themes.ts
sed -i "s/radial-gradient(ellipse [^,]*, [^,]* 0%//g" themes.ts

echo "完成！已替换所有rgba为实色"
