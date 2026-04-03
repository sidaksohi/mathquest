@echo off
echo Starting MathQuest...
start "" http://localhost:3000
python -m http.server 3000
