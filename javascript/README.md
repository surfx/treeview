# Custom TreeView JS

Um componente de árvore de arquivos (File Explorer) dinâmico e interativo, desenvolvido com JavaScript puro (Vanilla JS). O sistema oferece uma experiência completa de gerenciamento de arquivos diretamente no navegador.

![Demonstração do Projeto](arquivos_readme/image.png)

## 🚀 Funcionalidades

- **Estrutura Dinâmica**: Criação, renomeação e exclusão de pastas e arquivos de forma ilimitada.
- **Modais Customizados**: Diálogos de confirmação e entrada de dados estilizados com suporte a teclado:
  - Enter para confirmar.
  - Esc para cancelar/fechar.
  - Foco automático no campo de texto ao abrir.
- **Lógica Inteligente de Adição**:
  - Em Pastas: Novos itens são criados como filhos (dentro).
  - Em Arquivos: Novos itens são criados no mesmo nível (irmãos), respeitando a hierarquia do pai.
- **Drag & Drop**: Movimentação fluida de nodos. É possível arrastar itens para dentro de pastas ou para o espaço vazio da raiz.
- **Checkboxes Hierárquicos**: 
  - Seleção em cascata (marcar pai seleciona todos os filhos).
  - Estado indeterminado (ícone de menos) quando apenas parte dos filhos está selecionada.
- **Gestão de Raiz**: Botões de controle superiores que permitem reiniciar a árvore caso todos os nodos sejam excluídos.
- **Exportação JSON**: Gera um arquivo .json com a estrutura da árvore, permitindo salvar o estado atual ou apenas os itens selecionados.

## 🛠️ Tecnologias Utilizadas

* HTML5 & CSS3: Layout flexível, animações de hover e modais centralizados.
* JavaScript (ES6+): Uso intensivo de recursividade, Promises e manipulação assíncrona (Async/Await).
* FontAwesome 6: Biblioteca de ícones para uma interface moderna e intuitiva.

## 📂 Estrutura do Projeto

```
├── index.html          # Estrutura HTML e containers dos modais
├── style.css           # Estilização da árvore, estados de drag e componentes
├── script.js           # Core do projeto (Recursividade, Drag&Drop e Modais)
└── arquivos_readme/
    └── image.png       # Screenshot do projeto
```

## 🎮 Como Utilizar

1. Interação com Nodos: 
   - Clique na seta (caret) para expandir/recolher pastas.
   - Passe o mouse sobre qualquer item para revelar os botões de ação.
2. Adicionar Itens:
   - Ícone Folder-Plus: Adiciona uma Pasta.
   - Ícone Plus: Adiciona um Arquivo.
3. Excluir: 
   - Clique no ícone Minus. 
   - O sistema detecta se é um arquivo ou pasta e ajusta a mensagem de confirmação no modal automaticamente.
4. Mover: 
   - Arraste um item e solte sobre uma pasta para movê-lo para dentro dela.
   - Arraste para o fundo vazio do container para mover o item para a raiz.

## ⚙️ Configuração

No arquivo script.js, você pode alternar a exibição dos checkboxes:

```javascript
let permitirMarcar = true; // Altere para false para esconder os checkboxes
```

# SASS

Para compilar o `style.scss` em `style.css`, utilize o auxilixar `.\compilar_scss.ps1`

# Urls

- [dart sass](https://github.com/sass/dart-sass/releases/tag/1.97.2)
