#!/bin/bash

CYAN="\033[1;36m"
GREEN="\033[1;32m"
YELLOW="\033[1;33m"
RESET="\033[0m"

while true; do
  printf "${CYAN}🌸 Iniciando ${GREEN}Aurora base${CYAN}, aguarde a conexão...${RESET}\n\n"

  if [ "$1" = "sim" ]; then
    node DADOS_TOKITO/connect.js sim
  elif [ "$1" = "não" ] || [ "$1" = "nao" ]; then
    node DADOS_TOKITO/connect.js não
  else
    node DADOS_TOKITO/connect.js
  fi

  printf "\n${YELLOW}🌸 Aurora base caiu, reiniciando...${RESET}\n"
  sleep 1
done