@echo off
echo ========================================
echo 上传到 GitHub: esp-ir-mqtt-pure-card
echo ========================================

cd /d "%~dp0"

echo.
echo [1/6] 初始化 Git 仓库...
git init

echo.
echo [2/6] 添加所有文件...
git add .

echo.
echo [3/6] 提交文件...
git commit -m "Initial commit: Pure MQTT IR Card with dual copy buttons"

echo.
echo [4/6] 添加远程仓库...
git remote add origin https://github.com/hxp830/esp-ir-mqtt-pure-card.git

echo.
echo [5/6] 重命名分支为 main...
git branch -M main

echo.
echo [6/6] 推送到 GitHub...
git push -u origin main --force

echo.
echo ========================================
echo 上传完成！
echo ========================================
echo.
echo 仓库地址: https://github.com/hxp830/esp-ir-mqtt-pure-card
echo.
echo 在 HACS 中添加：
echo 1. 打开 HACS
echo 2. 点击右上角菜单 ^> 自定义存储库
echo 3. 添加 URL: https://github.com/hxp830/esp-ir-mqtt-pure-card
echo 4. 类别: Lovelace
echo 5. 点击添加
echo.
pause
