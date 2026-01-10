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
    if (sourceId === targetId) return;

    let sourceNode = null;
    let targetNode = null;

    // 1. Localizar os objetos dos nós envolvidos para análise
    const findNodes = (list) => {
        for (let n of list) {
            if (n.id === sourceId) sourceNode = n;
            if (n.id === targetId) targetNode = n;
            if (n.children) findNodes(n.children);
        }
    };
    findNodes(treeData);

    if (!sourceNode || !targetNode) return;

    // Função auxiliar para remover um nó de qualquer lugar da árvore
    const removeNodeFromList = (list, id) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].id === id) return list.splice(i, 1)[0];
            if (list[i].children) {
                const found = removeNodeFromList(list[i].children, id);
                if (found) return found;
            }
        }
        return null;
    };

    // 2. CASO ESPECIAL: Mover Pai para dentro do Filho (Inversão)
    if (isDescendant(sourceNode, targetId)) {
        console.log("Detectada tentativa de mover pai para filho. Invertendo hierarquia...");

        // A. Removemos o filho (alvo) de dentro do pai (origem)
        const filhoExtraido = removeNodeFromList(sourceNode.children, targetId);
        
        // B. Removemos o pai de onde quer que ele esteja na árvore original
        const paiExtraido = removeNodeFromList(treeData, sourceId);

        if (filhoExtraido && paiExtraido) {
            // C. O antigo pai agora vira filho do seu próprio filho
            if (!filhoExtraido.children) filhoExtraido.children = [];
            filhoExtraido.children.push(paiExtraido);
            filhoExtraido.isOpen = true;

            // D. O filho (que agora carrega o pai) é promovido para a raiz
            treeData.push(filhoExtraido);
        }
    } 
    // 3. CASO NORMAL: Mover para uma pasta que não é sua descendente
    else {
        if (targetNode.type !== 'folder') {
            console.warn("Destino não é uma pasta.");
            return;
        }

        const nodeToMove = removeNodeFromList(treeData, sourceId);
        if (nodeToMove) {
            if (!targetNode.children) targetNode.children = [];
            targetNode.children.push(nodeToMove);
            targetNode.isOpen = true;
        }
    }

    render();
}

/**
 * Função Auxiliar: Verifica se o targetId pertence a algum descendente do pai
 */
function isDescendant(parentNode, targetId) {
    if (!parentNode.children || parentNode.children.length === 0) return false;
    return parentNode.children.some(child => 
        child.id === targetId || isDescendant(child, targetId)
    );
}

/**
 * Função para configurar o container principal como alvo de drop (Raiz)
 */
function setupRootDropZone() {
    const rootContainer = document.getElementById('treeview');

    rootContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Adiciona um feedback visual na raiz
        rootContainer.classList.add('drag-root-over');
    });

    rootContainer.addEventListener('dragleave', (e) => {
        // Remove o feedback apenas se sair do container principal
        if (e.target === rootContainer) {
            rootContainer.classList.remove('drag-root-over');
        }
    });

    rootContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        rootContainer.classList.remove('drag-root-over');

        // Se o drop acontecer no container (espaço vazio) ou 
        // se o alvo não for uma pasta (o que significa que caiu entre itens)
        if (e.target === rootContainer || !e.target.closest('.folder-icon')) {
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

    if (sourceNode) {
        // Garante que o nó vá para o topo do array treeData
        treeData.push(sourceNode);
    }
}

function render() {
    const root = document.getElementById('treeview');
    renderTree(treeData, root);
    setupRootDropZone(); // Configura o container para aceitar itens
}

/**
 * Função de Exportação
 * @param {boolean} apenasSelecionados - Se true, filtra apenas os marcados
 */
function exportarArvore(apenasSelecionados = false) {
    
    const processarNodos = (nodos) => {
        let resultado = [];

        nodos.forEach(node => {
            // Verifica se o nodo deve ser incluído
            const deveIncluir = !apenasSelecionados || node.checked || node.indeterminate;

            if (deveIncluir) {
                // Criamos o objeto incluindo a propriedade 'checked'
                let novoNodo = { 
                    id: node.id, 
                    name: node.name, 
                    type: node.type,
                    checked: node.checked // Adicionado aqui
                };

                // Se quiser exportar também o estado "menos" (parcial), descomente a linha abaixo:
                // novoNodo.indeterminate = node.indeterminate || false;

                if (node.type === 'folder' && node.children) {
                    const filhosFiltrados = processarNodos(node.children);
                    
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
    
    console.log("Dados Exportados com Seleção:", dadosExportados);
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