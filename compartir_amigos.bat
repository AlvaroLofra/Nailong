@echo off
chcp 65001 >nul
title Servidor de Nailong para Amigos
echo Iniciando servidor de Nailong...
python compartir_amigos.py
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Error al iniciar el servidor con Python. Asegurate de tener Python instalado.
    pause
)
