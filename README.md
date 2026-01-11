# Componente Treeview (JavaScript e Angular)

Este repositório contém uma implementação de um componente de visualização em árvore (treeview), desenvolvido com duas abordagens de frontend diferentes (JavaScript puro e Angular) e um backend comum em Python (FastAPI).

![Demonstração da Interface](arquivos_readme/image.png)

## 📜 Descrição

O projeto demonstra a criação de um componente de árvore de arquivos interativo e funcional. Ele permite a visualização e manipulação de uma estrutura de dados hierárquica (pastas e arquivos), com todas as alterações sendo persistidas através de uma API RESTful.

O repositório está organizado como um monorepo, contendo três projetos independentes:
1.  **Frontend (JavaScript):** Uma implementação leve e sem frameworks.
2.  **Frontend (Angular):** Uma implementação robusta usando o framework Angular.
3.  **Backend (Python):** Um servidor RESTful construído com FastAPI que gerencia o estado da árvore em um arquivo JSON.

## ✨ Funcionalidades

- **Visualização Hierárquica:** Exibe pastas e arquivos em uma estrutura aninhada.
- **Expandir/Recolher:** Pastas podem ser expandidas ou recolhidas para navegar na árvore.
- **Seleção de Itens:** Suporte para marcar/desmarcar itens individualmente ou em cascata (selecionar uma pasta seleciona todos os seus filhos).
- **Manipulação de Nós:**
  - Adicionar, renomear e excluir arquivos e pastas.
  - As ações são contextuais (ex: "adicionar subpasta" em uma pasta, "adicionar arquivo irmão" em um arquivo).
- **Arrastar e Soltar (Drag and Drop):**
  - Reordenar itens na mesma pasta.
  - Mover itens para dentro de outras pastas.
- **Persistência de Dados:** Todas as alterações são salvas no backend, garantindo que o estado da árvore seja consistente entre sessões e aplicações.
- **Exportação:** Funcionalidade para exportar a estrutura da árvore (completa ou apenas itens selecionados) para um arquivo JSON.

## 🛠️ Tecnologias Utilizadas

| Parte         | Tecnologia                                     |
| ------------- | ---------------------------------------------- |
| **Backend**   | Python, FastAPI, Uvicorn                       |
| **Frontend 1**| JavaScript (ES6+), SCSS, HTML                  |
| **Frontend 2**| Angular, TypeScript, SCSS                      |
| **Utilitários** | Docker (para a aplicação Angular)              |

## 📁 Estrutura do Projeto

```
.
├── 📂 angular/         # Contém a aplicação frontend em Angular
├── 📂 javascript/      # Contém a aplicação frontend em JavaScript puro
├── 📂 server/          # Contém o servidor backend em Python (FastAPI)
├── 📂 arquivos_readme/ # Imagens utilizadas neste README
└── 📄 README.md         # Este arquivo
```

## 🚀 Como Executar o Projeto

Siga os passos abaixo para configurar e executar cada parte do projeto.

### 1. Pré-requisitos

- [Python](https://www.python.org/downloads/) (versão 3.10 ou superior)
- [Node.js](https://nodejs.org/en/) e npm (para o projeto Angular e/ou servidores de desenvolvimento)
- [Docker](https://www.docker.com/products/docker-desktop/) (se for executar a versão Angular com Docker)
- A ferramenta `uv` para instalação de pacotes Python (opcional, mas recomendada): `pip install uv`

### 2. Backend (Servidor Python)

O servidor é responsável por fornecer e armazenar os dados da árvore.

1.  **Navegue até a pasta do servidor:**
    ```sh
    cd server/meu-servidor-rest
    ```

2.  **Crie e ative um ambiente virtual:**
    ```sh
    # Crie o ambiente
    python -m venv .venv

    # Ative (Windows)
    .venv\Scripts\activate

    # Ative (Linux/macOS)
    source .venv/bin/activate
    ```

3.  **Instale as dependências:**
    ```sh
    # Usando uv (recomendado)
    uv pip install -r requirements.txt

    # Ou usando pip
    pip install -r requirements.txt
    ```
    *(Nota: Um `requirements.txt` foi inferido do `pyproject.toml`. Se não existir, use `uv pip install "fastapi[standard]>=0.128.0"`)*

4.  **Inicie o servidor:**
    ```sh
    python main.py
    ```
    O servidor estará em execução em `http://127.0.0.1:8000`.

#### Endpoints da API

O servidor FastAPI fornece uma documentação interativa da API (via Swagger UI). Após iniciar o servidor, você pode acessá-la em `http://127.0.0.1:8000/docs`.

![Endpoints da API REST](arquivos_readme/rest.png)

### 3. Frontend (JavaScript Puro)

Esta é a implementação sem frameworks.

1.  **Inicie o servidor de desenvolvimento:** A maneira mais fácil de executar é usar uma extensão como o **Live Server** no VS Code.
    - Navegue até a pasta `javascript/`.
    - Clique com o botão direito no arquivo `index.html` e selecione "Open with Live Server".

2.  A aplicação será aberta no seu navegador, geralmente em um endereço como `http://127.0.0.1:5500/javascript/`.

### 4. Frontend (Angular)

Existem duas maneiras de executar a aplicação Angular.

#### Opção A: Usando Docker (Recomendado pelo Projeto)

As configurações de Docker já estão prontas para uso, separando o ambiente de desenvolvimento do seu sistema operacional.

**1. Setup Inicial (Apenas na primeira vez)**

Na primeira vez que for usar, você precisa construir a imagem e criar o container.

- **Navegue até a pasta Docker do Angular:**
  ```sh
  cd angular/docker
  ```
- **Execute o Docker Compose:**
  ```sh
  docker-compose up -d
  ```
  Este comando irá construir a imagem Docker e criar o container em segundo plano.

**2. Uso Diário**

Após o container ter sido criado, use o script para iniciá-lo e acessar o terminal interativo.

- **Execute o script de inicialização:**
  ```sh
  # No Windows (usando PowerShell na pasta angular/docker)
  ./iniciar_docker.ps1
  ```
  Este script irá iniciar o container (se estiver parado) e abrir um terminal `zsh` dentro dele.

- **Dentro do container, execute o projeto:**
  ```sh
  ./projeto/treeview_angular/execute_angular.sh
  ```

- **Acesse a aplicação** no seu navegador em `http://localhost:4200`.

Para parar o container, execute `docker stop dev-angular-treeview` ou o script `./zerar_docker.ps1` que também o remove.

#### Opção B: Executando Localmente com `npm`

Se preferir não usar o Docker:

1.  **Navegue até a pasta do projeto Angular:**
    ```sh
    cd angular/projeto/treeview_angular
    ```

2.  **Instale as dependências do Node.js:**
    ```sh
    npm i
    ```

3.  **Inicie o servidor de desenvolvimento do Angular:**
    ```sh
    ng serve
    ```

4.  **Acesse a aplicação** no seu navegador em `http://localhost:4200`.