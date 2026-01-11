#!/bin/zsh
cd /projeto/treeview_angular

if [ ! -d "node_modules" ] || [ "package.json" -nt ".last_install" ]; then
  npm i
  # touch node_modules
  touch .last_install
fi
ng serve --host 0.0.0.0 --poll 2000