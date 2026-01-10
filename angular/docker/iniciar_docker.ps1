Set-Location "D:\projetos\javascript\treeview\angular\docker"

# Nome do container fixo
$ContainerName = "dev-angular-treeview"

# Verifica se o container existe
$container = docker ps -a --filter "name=$ContainerName" --format "{{.Status}}"

if (-not $container) {
    Write-Host "❌ Container '$ContainerName' não existe." -ForegroundColor Red
    exit 1
}

if ($container -like "Up*") {
    Write-Host "🔹 Container '$ContainerName' já está em execução. Usando 'docker exec'..."
    docker exec -it $ContainerName zsh
} else {
    Write-Host "🔹 Container '$ContainerName' está parado. Usando 'docker start -ai'..."
    docker start -ai $ContainerName
}

