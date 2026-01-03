let permitirMarcar = true;

// Estrutura de dados inicial (Tipada: folder ou file)
let treeData = [
    {
        id: "1",
        name: "Documentos",
        type: "folder",
        isOpen: true,
        checked: false,
        children: [
            { id: "2", name: "projeto_final.pdf", type: "file", checked: false },
            { id: "3", name: "notas.txt", type: "file", checked: false },
            {
                id: "4",
                name: "Imagens",
                type: "folder",
                isOpen: true,
                checked: false,
                children: [
                    { id: "5", name: "foto_perfil.png", type: "file", checked: false },
                    { id: "6", name: "banner.jpg", type: "file", checked: false }
                ]
            }
        ]
    },
    {
        id: "7",
        name: "Configurações",
        type: "folder",
        isOpen: false,
        checked: false,
        children: []
    }
];

let draggedNodeId = null;

/**
 * Renderiza a árvore recursivamente
 */
function renderTree(nodes, container) {
    container.innerHTML = '';

    nodes.forEach(node => {
        const nodeDiv = document.createElement('div');
        nodeDiv.className = 'tree-node';
        nodeDiv.draggable = true;
        
        const content = document.createElement('div');
        content.className = 'node-content';
        
        // --- 1. SETA (CARET) ---
        const caretSpan = document.createElement('span');
        caretSpan.className = 'caret';
        if (node.type === 'folder' && node.children && node.children.length > 0) {
            caretSpan.innerHTML = node.isOpen 
                ? '<i class="fa-solid fa-caret-down"></i>' 
                : '<i class="fa-solid fa-caret-right"></i>';
            caretSpan.onclick = (e) => {
                e.stopPropagation();
                node.isOpen = !node.isOpen;
                render();
            };
        }
        content.appendChild(caretSpan);

        // --- 2. CHECKBOX ---
        if (permitirMarcar) {
            const checkSpan = document.createElement('span');
            checkSpan.className = 'checkbox';
            checkSpan.innerHTML = getCheckboxIcon(node);
            checkSpan.onclick = (e) => {
                e.stopPropagation();
                toggleCheck(node);
                render();
            };
            content.appendChild(checkSpan);
        }

        // --- 3. ÍCONE (PASTA OU ARQUIVO) ---
        const iconSpan = document.createElement('span');
        iconSpan.className = `icon ${node.type === 'folder' ? 'folder-icon' : 'file-icon'}`;
        if (node.type === 'folder') {
            iconSpan.innerHTML = node.isOpen 
                ? '<i class="fa-regular fa-folder-open"></i>' 
                : '<i class="fa-regular fa-folder"></i>';
        } else {
            iconSpan.innerHTML = '<i class="fa-regular fa-file"></i>';
        }
        content.appendChild(iconSpan);

        // --- 4. NOME DO ITEM ---
        const nameSpan = document.createElement('span');
        nameSpan.className = 'node-name';
        nameSpan.textContent = node.name;
        content.appendChild(nameSpan);

        // --- 5. BOTÕES DE AÇÃO (HOVER) ---
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'node-actions';

        // Botão Adicionar Pasta (Filha se for pasta, Irmã se for arquivo)
        const addFolderBtn = document.createElement('span');
        addFolderBtn.className = 'action-btn';
        addFolderBtn.title = node.type === 'folder' ? "Adicionar subpasta" : "Adicionar pasta no mesmo nível";
        addFolderBtn.innerHTML = '<i class="fa-solid fa-folder-plus"></i>';
        addFolderBtn.onclick = (e) => { e.stopPropagation(); addNode(node.id, 'folder'); };
        actionsDiv.appendChild(addFolderBtn);

        // Botão Adicionar Arquivo (Filho se for pasta, Irmão se for arquivo)
        const addFileBtn = document.createElement('span');
        addFileBtn.className = 'action-btn';
        addFileBtn.title = node.type === 'folder' ? "Adicionar arquivo" : "Adicionar arquivo no mesmo nível";
        addFileBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
        addFileBtn.onclick = (e) => { e.stopPropagation(); addNode(node.id, 'file'); };
        actionsDiv.appendChild(addFileBtn);

        // Botão Excluir
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'action-btn btn-delete';
        deleteBtn.innerHTML = '<i class="fa-solid fa-minus"></i>';
        deleteBtn.onclick = (e) => { e.stopPropagation(); deleteNode(node.id); };
        actionsDiv.appendChild(deleteBtn);

        content.appendChild(actionsDiv);

        // --- 6. MONTAGEM FINAL DO NODO ---
        nodeDiv.appendChild(content);

        // Se for pasta e estiver aberta, renderiza os filhos
        if (node.type === 'folder' && node.children && node.children.length > 0) {
            const childContainer = document.createElement('div');
            childContainer.className = `children-container ${node.isOpen ? '' : 'hidden'}`;
            renderTree(node.children, childContainer);
            nodeDiv.appendChild(childContainer);
        }

        // Setup de Drag & Drop
        setupDragAndDrop(nodeDiv, content, node);

        container.appendChild(nodeDiv);
    });
}

/**
 * Define o ícone do checkbox baseado no estado dos filhos
 */
function getCheckboxIcon(node) {
    if (node.type === 'file') {
        return node.checked ? '<i class="fa-regular fa-square-check"></i>' : '<i class="fa-regular fa-square"></i>';
    }
    
    if (node.children.length === 0) {
        return node.checked ? '<i class="fa-regular fa-square-check"></i>' : '<i class="fa-regular fa-square"></i>';
    }

    const allChecked = node.children.every(c => c.checked);
    const someChecked = node.children.some(c => c.checked || c.indeterminate);

    node.indeterminate = !allChecked && someChecked;

    if (allChecked) return '<i class="fa-regular fa-square-check"></i>';
    if (someChecked) return '<i class="fa-regular fa-square-minus"></i>';
    return '<i class="fa-regular fa-square"></i>';
}

/**
 * Altera o estado de marcação recursivamente
 */
function toggleCheck(node) {
    node.checked = !node.checked;
    if (node.children) {
        const setChildren = (children, state) => {
            children.forEach(c => {
                c.checked = state;
                if (c.children) setChildren(c.children, state);
            });
        };
        setChildren(node.children, node.checked);
    }
    // Atualiza os pais após a mudança
    updateParentStates(treeData);
}

function updateParentStates(nodes) {
    nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
            updateParentStates(node.children);
            const allChecked = node.children.every(c => c.checked);
            node.checked = allChecked;
        }
    });
}

/**
 * Configuração de Drag and Drop
 */
function setupDragAndDrop(element, content, node) {
    element.addEventListener('dragstart', (e) => {
        draggedNodeId = node.id;
        e.dataTransfer.effectAllowed = "move";
        e.stopPropagation();
    });

    element.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (node.type === 'folder' && draggedNodeId !== node.id) {
            content.classList.add('drag-over');
        }
    });

    element.addEventListener('dragleave', () => {
        content.classList.remove('drag-over');
    });

    element.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        content.classList.remove('drag-over');

        if (node.type === 'folder' && draggedNodeId !== node.id) {
            moveNode(draggedNodeId, node.id);
            render();
        }
    });
}

/**
 * Move um nodo de um lugar para outro no objeto de dados
 */
function moveNode(sourceId, targetId) {
    let sourceNode = null;

    // Função para remover o nodo da origem
    const findAndRemove = (list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === sourceId) {
                sourceNode = list.splice(i, 1)[0];
                return true;
            }
            if (list[i].children && findAndRemove(list[i].children)) return true;
        }
        return false;
    };

    // Função para inserir no destino
    const findAndInsert = (list) => {
        for (let n of list) {
            if (n.id === targetId) {
                n.children.push(sourceNode);
                n.isOpen = true; // Abre a pasta ao receber item
                return true;
            }
            if (n.children && findAndInsert(n.children)) return true;
        }
        return false;
    };

    findAndRemove(treeData);
    if (sourceNode) findAndInsert(treeData);
}

/**
 * Função para configurar o container principal como alvo de drop (Raiz)
 */
function setupRootDropZone() {
    const rootContainer = document.getElementById('treeview');

    rootContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        // Verifica se o drop está acontecendo diretamente no container (espaço vazio)
        // ou se o usuário quer mover para a raiz.
        if (e.target === rootContainer) {
            rootContainer.style.backgroundColor = "#f0f7ff";
        }
    });

    rootContainer.addEventListener('dragleave', () => {
        rootContainer.style.backgroundColor = "transparent";
    });

    rootContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        rootContainer.style.backgroundColor = "transparent";

        // Se o alvo do drop for o container principal, move para a raiz
        if (e.target === rootContainer) {
            moveNodeToRoot(draggedNodeId);
            render();
        }
    });
}

/**
 * Move um nodo para o nível mais externo (raiz)
 */
function moveNodeToRoot(sourceId) {
    let sourceNode = null;

    // 1. Remove de onde ele estiver
    const findAndRemove = (list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === sourceId) {
                sourceNode = list.splice(i, 1)[0];
                return true;
            }
            if (list[i].children && findAndRemove(list[i].children)) return true;
        }
        return false;
    };

    findAndRemove(treeData);

    // 2. Adiciona ao array principal se ele não for duplicado
    if (sourceNode) {
        // Evita duplicar se já estiver na raiz (opcional)
        if (!treeData.find(n => n.id === sourceId)) {
            treeData.push(sourceNode);
        }
    }
}

// Altere sua função render para incluir a configuração da raiz
function render() {
    const root = document.getElementById('treeview');
    renderTree(treeData, root);
    setupRootDropZone(); // Configura o container para aceitar itens
}

/**
 * Função de Exportação
 * @param {boolean} apenasSelecionados - Se true, filtra apenas os marcados
 */
function exportarArvore(apenasSelecionados = true) {
    
    // Função recursiva para filtrar os dados
    const processarNodos = (nodos) => {
        let resultado = [];

        nodos.forEach(node => {
            // Se apenasSelecionados for true, o nodo deve estar checked ou ser pai de algo checked
            const deveIncluir = !apenasSelecionados || node.checked || node.indeterminate;

            if (deveIncluir) {
                // Criamos uma cópia para não alterar o original (clonagem profunda simples)
                let novoNodo = { 
                    id: node.id, 
                    name: node.name, 
                    type: node.type 
                };

                if (node.type === 'folder' && node.children) {
                    const filhosFiltrados = processarNodos(node.children);
                    // Se estivermos exportando apenas selecionados, 
                    // incluímos a pasta apenas se ela tiver filhos selecionados ou estiver ela mesma marcada
                    if (!apenasSelecionados || filhosFiltrados.length > 0 || node.checked) {
                        novoNodo.children = filhosFiltrados;
                        resultado.push(novoNodo);
                    }
                } else {
                    resultado.push(novoNodo);
                }
            }
        });

        return resultado;
    };

    const dadosExportados = processarNodos(treeData);
    
    // Mostra no console e faz download do JSON
    console.log("Dados Exportados:", dadosExportados);
    downloadJSON(dadosExportados);
}

/**
 * Helper para baixar o arquivo JSON
 */
function downloadJSON(obj) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "tree_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Event Listener para os botões
document.getElementById('btnExportarTodos').addEventListener('click', () => {
    exportarArvore(false);
});
document.getElementById('btnExportar').addEventListener('click', () => {
    exportarArvore(true);
});

/**
 * Função genérica para exibir o modal
 */
function showModal(title, message, isPrompt = false) {
    return new Promise((resolve) => {
        const modal = document.getElementById('customModal');
        const input = document.getElementById('modalInput');
        const btnConfirm = document.getElementById('modalBtnConfirm');
        const btnCancel = document.getElementById('modalBtnCancel');
        const btnClose = document.getElementById('closeModal');

        document.getElementById('modalTitle').innerText = title;
        document.getElementById('modalMessage').innerText = message;
        
        if (isPrompt) {
            input.classList.remove('hidden');
            input.value = "";
            // Pequeno delay para garantir que o elemento está visível antes do foco
            setTimeout(() => input.focus(), 10);
        } else {
            input.classList.add('hidden');
        }

        modal.classList.remove('hidden');

        if (title.includes("Excluir")) {
            btnConfirm.classList.add('btn-danger'); // Vermelho
        } else {
            btnConfirm.classList.remove('btn-danger'); // Verde padrão
        }

        // Função interna para encerrar e remover eventos
        const cleanup = (value) => {
            modal.classList.add('hidden');
            btnConfirm.onclick = null;
            btnCancel.onclick = null;
            btnClose.onclick = null;
            window.onkeydown = null; // Remove o listener de teclado
            resolve(value);
        };

        // Eventos de clique
        btnConfirm.onclick = () => cleanup(isPrompt ? input.value : true);
        btnCancel.onclick = () => cleanup(null);
        btnClose.onclick = () => cleanup(null);

        // Suporte a Teclado (Enter e Esc)
        window.onkeydown = (e) => {
            if (e.key === "Enter") {
                // Se for prompt e estiver vazio, não confirma (opcional)
                if (isPrompt && !input.value.trim()) return;
                cleanup(isPrompt ? input.value : true);
            }
            if (e.key === "Escape") {
                cleanup(null);
            }
        };
    });
}

/**
 * Adiciona um novo nodo (Pasta ou Arquivo)
 */
async function addNode(targetId, type) {
    // const name = prompt(`Nome do novo ${type === 'folder' ? 'diretório' : 'arquivo'}:`);
    // if (!name) return;
    const isFolder = type === 'folder';
    const label = isFolder ? 'pasta' : 'arquivo';
    const titulo = isFolder ? "Nova Pasta" : "Novo Arquivo";
    
    const name = await showModal(titulo, `Digite o nome da ${label}:`, true);
    
    if (!name) return;

    const newNode = {
        id: Date.now().toString(),
        name: name,
        type: type,
        checked: false,
        isOpen: true,
        children: isFolder ? [] : undefined
    };

    const findAndInsert = (list, parentList = null) => {
        for (let i = 0; i < list.length; i++) {
            const node = list[i];
            if (node.id === targetId) {
                if (node.type === 'folder') {
                    node.children.push(newNode);
                    node.isOpen = true;
                } else {
                    const targetArray = parentList || treeData;
                    targetArray.push(newNode);
                }
                return true;
            }
            if (node.children && findAndInsert(node.children, node.children)) return true;
        }
        return false;
    };

    findAndInsert(treeData);
    render();
}

/**
 * Exclui um nodo e todos os seus filhos
 */
async function deleteNode(id) {
    // 1. Localizar o nodo para saber o tipo
    let nodoParaExcluir = null;
    const buscarNodo = (list) => {
        for (let n of list) {
            if (n.id === id) { nodoParaExcluir = n; return; }
            if (n.children) buscarNodo(n.children);
        }
    };
    buscarNodo(treeData);

    if (!nodoParaExcluir) return;

    // 2. Definir Título e Mensagem Condicional
    const isFolder = nodoParaExcluir.type === 'folder';
    const titulo = isFolder ? 'Excluir Pasta' : 'Excluir Arquivo';
    
    // Se for pasta, avisa sobre os filhos. Se for arquivo, apenas confirma a exclusão.
    const mensagem = isFolder 
        ? `Tem certeza que deseja excluir esta pasta e todos os seus filhos?` 
        : `Tem certeza que deseja excluir este arquivo?`;

    // 3. Chamar o modal
    const confirmacao = await showModal(titulo, mensagem);
    
    if (!confirmacao) return;

    // 4. Executar a exclusão
    const findAndRemove = (list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) {
                list.splice(i, 1);
                return true;
            }
            if (list[i].children && findAndRemove(list[i].children)) return true;
        }
        return false;
    };

    findAndRemove(treeData);
    render();
}

/**
 * Adiciona um nodo diretamente na raiz da árvore
 */
async function addNodeRoot(type) {
    // const name = prompt(`Nome do novo ${type === 'folder' ? 'diretório' : 'arquivo'} na raiz:`);
    // if (!name) return;

    const isFolder = type === 'folder';
    const label = isFolder ? 'pasta' : 'arquivo';
    
    // Título dinâmico baseado no tipo
    const titulo = isFolder ? "Nova Pasta Raiz" : "Novo Arquivo Raiz";
    
    const name = await showModal(titulo, `Digite o nome da ${label} para a raiz:`, true);
    
    if (!name) return;

    treeData.push({
        id: Date.now().toString(),
        name: name,
        type: type,
        checked: false,
        isOpen: true,
        children: isFolder ? [] : undefined
    });
    render();
}

// Inicializa
render();