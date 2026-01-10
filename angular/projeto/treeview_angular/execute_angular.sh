#!/bin/zsh
cd /projeto/treeview_angular
# Se node_modules não existe OU package.json é mais recente que a pasta node_modules
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
  echo "Alteração detectada no package.json ou node_modules ausente. Atualizando..."
  npm i
  # Atualiza o 'timestamp' da pasta para marcar que ela está em dia com o package.json
  touch node_modules
else
  echo "Dependências atualizadas. Pulando instalação..."
fi
ng serve --host 0.0.0.0