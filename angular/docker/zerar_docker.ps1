Set-Location "D:\projetos\javascript\treeview\angular\docker"

$oldImage = docker images -q dev-angular-treeview-imagem:latest
if ($oldImage) { docker rmi -f $oldImage }
$oldContainer = docker ps -a -q -f "name=dev-angular-treeview"
if ($oldContainer) { docker rm -f $oldContainer }
docker builder prune -f

docker build -t dev-angular-treeview-imagem -f "Dockerfile" "D:\meus_documentos\configuracoes_serpro"

docker run -it `
    -p 4200:4200 `
    -v "D:\projetos\javascript\treeview\angular\projeto:/projeto" `
    --name dev-angular-treeview `
    dev-angular-treeview-imagem



# -----------------------------
# docker start -ai dev-angular-treeview
# docker exec -it dev-angular-treeview zsh
# docker cp dev-angular-treeview:/home/serpro/projetos/ppe/sinespppe-src/. E:/programas/vms/docker/project-dev-container/projeto/sinespppe-src
