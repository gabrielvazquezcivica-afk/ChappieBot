#!/bin/bash

# ───── COLORES ─────
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[1;33m"
CYAN="\033[0;36m"
NC="\033[0m" # Sin color

# ───── NOMBRE DEL BOT ─────
BOT_NAME="ChappieBot"

echo -e "${CYAN}╔════════════════════════╗"
echo -e "║   Iniciando $BOT_NAME   ║"
echo -e "╚════════════════════════╝${NC}"

# ───── BUCLE INFINITO PARA REINICIO AUTOMÁTICO ─────
while true; do
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] Arrancando $BOT_NAME...${NC}"
    
    # Ejecuta el bot con Node
    node index.js
    
    # Captura el código de salida
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}[$(date '+%H:%M:%S')] $BOT_NAME se detuvo voluntariamente, reiniciando...${NC}"
    else
        echo -e "${RED}[$(date '+%H:%M:%S')] $BOT_NAME se cerró con error (code: $EXIT_CODE), reiniciando en 5s...${NC}"
        sleep 5
    fi
done
