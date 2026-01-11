let permitirMarcar = true;

const API_URL = 'http://127.0.0.1:8000/tree';

// Estrutura de dados inicial (Tipada: folder ou file)
const treeDataReferencia = [
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


let treeData = [];

// Atualize sua função loadTree para renderizar logo após carregar
async function loadTree() {
    try {
        const response = await fetch(`${API_URL}`);
        const data = await response.json();
        treeData = (data && data.length > 0) ? data : [];
        render(); // Renderiza com os dados vindos do servidor
    } catch (e) {
        console.warn("Servidor offline, usando dados de referência.");
        treeData = [];
        render();
    }
}

loadTree();

async function saveTree() {
    try {
        await fetch(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(treeData)
        });
        console.log("Árvore sincronizada com o servidor.");
    } catch (error) {
        console.error("Erro ao salvar árvore:", error);
    }
}

async function updateNodeOnServer(nodeId, updateData) {
    try {
        const response = await fetch(`${API_URL}/${nodeId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });
        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.mensagem || `HTTP error! status: ${response.status}`);
        }
        console.log(`Nó ${nodeId} atualizado no servidor.`);
    } catch (error) {
        console.error(`Erro ao atualizar nó ${nodeId}:`, error);
        // Opcional: Reverter a alteração na UI ou recarregar a árvore
        // await loadTree(); 
    }
}

async function deleteNodeOnServer(nodeId) {
    try {
        const response = await fetch(`${API_URL}/${nodeId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const errorResult = await response.json();
            throw new Error(errorResult.mensagem || `HTTP error! status: ${response.status}`);
        }
        console.log(`Nó ${nodeId} deletado do servidor.`);
    } catch (error) {
        console.error(`Erro ao deletar nó ${nodeId}:`, error);
        // Opcional: Reverter a alteração na UI ou recarregar a árvore
        // await loadTree();
    }
}



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
            caretSpan.onclick = async (e) => {
                e.stopPropagation();
                node.isOpen = !node.isOpen;
                render();
                await updateNodeOnServer(node.id, { isOpen: node.isOpen });
            };
        }
        content.appendChild(caretSpan);

        // --- 2. CHECKBOX ---
        if (permitirMarcar) {
            const checkSpan = document.createElement('span');
            checkSpan.className = 'checkbox';
            checkSpan.innerHTML = getCheckboxIcon(node);
            checkSpan.onclick = async (e) => {
                e.stopPropagation();
                toggleCheck(node);
                render();
                await saveTree();
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

        // Botão Editar
        const editBtn = document.createElement('span');
        editBtn.className = 'action-btn';
        editBtn.title = "Renomear";
        editBtn.innerHTML = '<i class="fa-solid fa-pencil"></i>';
        editBtn.onclick = (e) => { e.stopPropagation(); editNode(node.id); };
        actionsDiv.appendChild(editBtn);

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
 * Função auxiliar para encontrar detalhes de um nó (nó, pai, lista e índice)
 */
function findNodeDetails(id, list, parent = null) {
    for (let i = 0; i < list.length; i++) {
        const node = list[i];
        if (node.id === id) {
            return { node, parent, list, index: i };
        }
        if (node.children) {
            const found = findNodeDetails(id, node.children, node);
            if (found) {
                return found;
            }
        }
    }
    return null;
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
        if (draggedNodeId !== node.id) {
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

        if (draggedNodeId && draggedNodeId !== node.id) {
            // Se o alvo for uma pasta, move para dentro.
            // Se for um arquivo, insere antes.
            const mode = node.type === 'folder' ? 'into' : 'before';
            moveNode(draggedNodeId, node.id, mode);
            draggedNodeId = null; // Limpa após o drop
        }
    });
}

/**
 * Move um nodo de um lugar para outro no objeto de dados
 */
function moveNode(sourceId, targetId, mode = 'into') {
    if (sourceId === targetId) return;

    // 1. Achar detalhes do nó de origem para checagens
    const sourceDetailsForCheck = findNodeDetails(sourceId, treeData);
    if (!sourceDetailsForCheck) {
        console.error("Nó de origem não encontrado para checagem.");
        return;
    }

    // 2. Prevenir mover um nó para seu próprio descendente
    if (isDescendant(sourceDetailsForCheck.node, targetId)) {
        console.warn("Movimento inválido: não é possível mover um item para dentro de si mesmo ou de seus descendentes.");
        return;
    }

    // 3. Achar e remover o nó de origem da sua posição original
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
    const nodeToMove = removeNodeFromList(treeData, sourceId);
    if (!nodeToMove) {
        console.error("Não foi possível encontrar e remover o nó de origem.");
        return;
    }

    // 4. Achar os detalhes do nó de destino
    const targetDetails = findNodeDetails(targetId, treeData);
    if (!targetDetails) {
        console.error("Nó de destino não encontrado. Recarregando a árvore para evitar perda de dados.");
        loadTree(); // Failsafe para evitar estado inconsistente
        return;
    }

    // 5. Inserir o nó na nova posição
    if (mode === 'into' && targetDetails.node.type === 'folder') {
        // Mover PARA DENTRO da pasta (no final)
        if (!targetDetails.node.children) {
            targetDetails.node.children = [];
        }
        targetDetails.node.children.push(nodeToMove);
        targetDetails.node.isOpen = true; // Abre a pasta ao soltar algo dentro
    } else {
        // Inserir ANTES do item de destino (reordenação)
        targetDetails.list.splice(targetDetails.index, 0, nodeToMove);
    }

    render();
    saveTree();
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
function setupRootDropZone(rootContainer) {
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
    const oldRoot = document.getElementById('treeview');
    if (!oldRoot) return; // Se o root não existir, não faz nada

    // Desativa temporariamente as transições para uma renderização instantânea
    document.body.classList.add('no-transitions');

    // Cria um novo container fora do DOM para construir a árvore
    const newRoot = oldRoot.cloneNode(false);
    
    // Renderiza a árvore no novo container
    renderTree(treeData, newRoot);
    
    // Anexa os eventos de drop da raiz no novo container
    setupRootDropZone(newRoot);

    // Substitui o container antigo pelo novo de uma vez só
    oldRoot.parentNode.replaceChild(newRoot, oldRoot);

    // Usa um pequeno timeout para garantir que o navegador processou a remoção das transições
    // antes de reativá-las.
    setTimeout(() => {
        document.body.classList.remove('no-transitions');
    }, 50);
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
function showModal(title, message, isPrompt = false, defaultValue = '') {
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
            input.value = defaultValue; // Usar o valor padrão
            // Pequeno delay para garantir que o elemento está visível antes do foco
            setTimeout(() => {
                input.focus();
                input.select(); // Seleciona o texto para facilitar a edição
            }, 10);
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
    await saveTree(); // Salva a inclusão
}

/**
 * Renomeia um nodo existente
 */
async function editNode(id) {
    // 1. Encontrar o nodo
    let nodeToEdit = null;
    const findNode = (list) => {
        for (let n of list) {
            if (n.id === id) {
                nodeToEdit = n;
                return;
            }
            if (n.children) findNode(n.children);
        }
    };
    findNode(treeData);

    if (!nodeToEdit) return;

    // 2. Chamar o modal com o nome atual
    const label = nodeToEdit.type === 'folder' ? 'pasta' : 'arquivo';
    const newName = await showModal(`Renomear ${label}`, 'Digite o novo nome:', true, nodeToEdit.name);

    // 3. Atualizar se um novo nome foi fornecido e é diferente
    if (newName && newName.trim() !== '' && newName !== nodeToEdit.name) {
        nodeToEdit.name = newName;
        render();
        await updateNodeOnServer(id, { name: newName }); // Salva a alteração
    }
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

    if (findAndRemove(treeData)) {
        render(); // Atualiza a UI
        await deleteNodeOnServer(id); // Sincroniza com o servidor
    }
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
    await saveTree(); // Salva a inclusão na raiz
}

// Inicializa
render();