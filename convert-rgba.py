#!/usr/bin/env python3
import re

def rgba_to_hex(r, g, b, a):
    """将rgba转换为实色hex，通过混合到白色背景"""
    # 假设浅色主题背景是 #f5f5f5 (245, 245, 245)
    # 计算混合后的颜色
    bg_r, bg_g, bg_b = 245, 245, 245
    final_r = int(r * a + bg_r * (1 - a))
    final_g = int(g * a + bg_g * (1 - a))
    final_b = int(b * a + bg_b * (1 - a))
    return f"#{final_r:02x}{final_g:02x}{final_b:02x}"

def convert_rgba(match):
    """转换rgba(r,g,b,a)为hex"""
    r = int(match.group(1))
    g = int(match.group(2))
    b = int(match.group(3))
    a = float(match.group(4))
    return f"'{rgba_to_hex(r, g, b, a)}'"

# 读取文件
with open('/c/Users/qxn/Downloads/GYYG-improved/src/themes.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 替换所有rgba
pattern = r"'rgba\((\d+),(\d+),(\d+),([\d.]+)\)'"
new_content = re.sub(pattern, convert_rgba, content)

# 写回文件
with open('/c/Users/qxn/Downloads/GYYG-improved/src/themes.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"完成！已转换所有rgba为实色hex")
