import { Component, ViewChild, model, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TreeNode } from '../../entidades/TreeNode';
import { ModalComponent, ModalConfig } from '../modal';

@Component({
  selector: 'app-treeview',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './treeview.html',
  styleUrls: ['./treeview.scss']
})
export class Treeview {
  // Substitui @Input() e @Output()
  treeData = model<TreeNode[]>([]);
  treeChange = output<TreeNode[]>();

  @ViewChild(ModalComponent) modal!: ModalComponent;

  // Estado de Drag & Drop
  private draggedNode: TreeNode | null = null;
  draggedOverNodeId: string | null = null;
  isRootDragOver = false;

  constructor() {}

  // --- Lógica de Sincronização e Reatividade ---

  /**
   * Notifica o Angular que o sinal mudou. 
   * Criar uma nova referência [...nodes] garante que o Signal dispare a atualização do DOM.
   */
  private notifyChange(): void {
    this.treeData.update(nodes => [...nodes]);
    this.treeChange.emit(this.treeData());
  }

  // --- Lógica de Ações nos Nós ---

  private async showModal(config: ModalConfig, defaultValue?: string): Promise<string | boolean | null> {
    return this.modal.open(config, defaultValue);
  }

  async addNodeRoot(type: 'folder' | 'file'): Promise<void> {
    const label = type === 'folder' ? 'pasta' : 'arquivo';
    const name = await this.showModal({
      title: `Nova ${label} na Raiz`,
      message: `Digite o nome do novo ${label}:`,
      isPrompt: true
    });

    if (name && typeof name === 'string') {
      const newNode: TreeNode = {
        id: Date.now().toString(),
        name,
        type,
        checked: false,
        children: type === 'folder' ? [] : undefined
      };
      
      this.treeData.update(nodes => [...nodes, newNode]);
      this.treeChange.emit(this.treeData());
    }
  }

  async addNode(parentNode: TreeNode, type: 'folder' | 'file', event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const label = type === 'folder' ? 'pasta' : 'arquivo';
    const name = await this.showModal({
      title: `Novo ${label}`,
      message: `Digite o nome do novo ${label}:`,
      isPrompt: true
    });

    if (name && typeof name === 'string') {
        const newNode: TreeNode = {
            id: Date.now().toString(),
            name,
            type,
            checked: false,
            children: type === 'folder' ? [] : undefined
        };

        if (parentNode.type === 'folder') {
            parentNode.children = parentNode.children || [];
            parentNode.children.push(newNode);
            parentNode.isOpen = true;
        }
        this.updateAllParentStates();
        this.notifyChange();
    }
  }

  async editNode(node: TreeNode, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const label = node.type === 'folder' ? 'pasta' : 'arquivo';
    const newName = await this.showModal(
      { title: `Renomear ${label}`, message: 'Digite o novo nome:', isPrompt: true },
      node.name
    );
    
    if (newName && typeof newName === 'string' && newName.trim() !== '' && newName !== node.name) {
      node.name = newName;
      this.notifyChange();
    }
  }

  async deleteNode(node: TreeNode, event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const label = node.type === 'folder' ? 'pasta' : 'arquivo';
    const message = node.type === 'folder' 
      ? `Tem certeza que deseja excluir esta pasta e todos os seus filhos?`
      : `Tem certeza que deseja excluir este arquivo?`;

    const confirmed = await this.showModal({ title: `Excluir ${label}`, message });

    if (confirmed) {
      this.findAndRemoveNode(this.treeData(), node.id);
      this.notifyChange();
    }
  }

  // --- Ações da UI (Cliques) ---

  toggleCaret(node: TreeNode, event: MouseEvent): void {
    event.stopPropagation();
    if (node.type === 'folder') {
      node.isOpen = !node.isOpen;
      this.notifyChange();
    }
  }

  toggleCheck(node: TreeNode, event: MouseEvent): void {
    event.stopPropagation();
    const newState = !node.checked;
    node.checked = newState;
    node.indeterminate = false;

    if (node.children) {
      this.setChildrenCheckState(node.children, newState);
    }
    
    this.updateAllParentStates();
    this.notifyChange();
  }

  // --- Lógica de Drag and Drop ---
  
  onDragStart(event: DragEvent, node: TreeNode): void {
    event.stopPropagation();
    this.draggedNode = node;
    event.dataTransfer!.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent, node: TreeNode): void {
    event.preventDefault();
    event.stopPropagation();
    if (node.type === 'folder' && this.draggedNode?.id !== node.id) {
      this.draggedOverNodeId = node.id;
    }
  }

  onDragLeave(event: DragEvent): void {
    event.stopPropagation();
    this.draggedOverNodeId = null;
  }

  onDrop(event: DragEvent, targetNode: TreeNode): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.draggedNode && targetNode.type === 'folder' && this.draggedNode.id !== targetNode.id) {
      this.moveNode(this.draggedNode.id, targetNode.id);
    }
    this.draggedOverNodeId = null;
  }
  
  onRootDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isRootDragOver = true;
  }

  onRootDragLeave(event: DragEvent): void {
    if (event.target === (event.currentTarget as HTMLElement)) {
      this.isRootDragOver = false;
    }
  }

  onRootDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.draggedNode) {
      this.moveNodeToRoot(this.draggedNode.id);
    }
    this.isRootDragOver = false;
  }

  // --- Funções Auxiliares (Helpers) ---
  
  private moveNode(sourceId: string, targetParentId: string): void {
    if (sourceId === targetParentId || this.isDescendant(sourceId, targetParentId)) {
        return;
    }

    const nodeToMove = this.findAndRemoveNode(this.treeData(), sourceId);
    if (!nodeToMove) return;

    const targetParent = this.findNodeById(this.treeData(), targetParentId);
    if (targetParent && targetParent.type === 'folder') {
        targetParent.children = targetParent.children || [];
        targetParent.children.push(nodeToMove);
        targetParent.isOpen = true;
        this.updateAllParentStates();
        this.notifyChange();
    } else {
        this.treeData.update(nodes => [...nodes, nodeToMove]);
    }
  }

  private moveNodeToRoot(sourceId: string): void {
    const nodeToMove = this.findAndRemoveNode(this.treeData(), sourceId);
    if (nodeToMove) {
      this.treeData.update(nodes => [...nodes, nodeToMove]);
      this.updateAllParentStates();
      this.notifyChange();
    }
  }

  private findNodeById(nodes: TreeNode[] | undefined, id: string): TreeNode | null {
    if (!nodes) return null;
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = this.findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
  }
  
  private findAndRemoveNode(nodes: TreeNode[] | undefined, id: string): TreeNode | null {
    if (!nodes) return null;
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            return nodes.splice(i, 1)[0];
        }
        if (nodes[i].children) {
            const found = this.findAndRemoveNode(nodes[i].children, id);
            if (found) return found;
        }
    }
    return null;
  }
  
  private isDescendant(potentialParentId: string, potentialChildId: string): boolean {
      const parentNode = this.findNodeById(this.treeData(), potentialParentId);
      if (!parentNode || !parentNode.children) return false;
      return this.findNodeById(parentNode.children, potentialChildId) !== null;
  }
  
  private setChildrenCheckState(nodes: TreeNode[] | undefined, state: boolean): void {
    if (!nodes) return;
    nodes.forEach(node => {
      node.checked = state;
      node.indeterminate = false;
      if (node.children) {
        this.setChildrenCheckState(node.children, state);
      }
    });
  }

  private updateAllParentStates(): void {
    this.updateParentCheckState(this.treeData());
  }
  
  private updateParentCheckState(nodes: TreeNode[] | undefined): void {
    if (!nodes) return;
    nodes.forEach(node => {
        if (node.type === 'folder' && node.children && node.children.length > 0) {
            this.updateParentCheckState(node.children);

            const allChecked = node.children.every(c => c.checked);
            const someChecked = node.children.some(c => c.checked || c.indeterminate);

            if (allChecked) {
                node.checked = true;
                node.indeterminate = false;
            } else if (someChecked) {
                node.checked = false;
                node.indeterminate = true;
            } else {
                node.checked = false;
                node.indeterminate = false;
            }
        }
    });
  }

  // --- Métodos de Template ---

  getCheckboxIcon(node: TreeNode): string {
    if (node.checked) return 'fa-regular fa-square-check';
    if (node.indeterminate) return 'fa-regular fa-square-minus';
    return 'fa-regular fa-square';
  }

  getFolderIcon(node: TreeNode): string {
    if (node.type === 'file') return 'fa-regular fa-file';
    return node.isOpen ? 'fa-regular fa-folder-open' : 'fa-regular fa-folder';
  }

  // --- Lógica de Exportação ---

  exportarArvore(apenasSelecionados: boolean): void {
    const dadosExportados = this.processarNodosParaExport(this.treeData(), apenasSelecionados);
    this.downloadJSON(dadosExportados, 'tree_export.json');
  }

  private processarNodosParaExport(nodes: TreeNode[] | undefined, apenasSelecionados: boolean): any[] {
    const resultado: any[] = [];
    if (!nodes) return resultado;
    
    nodes.forEach(node => {
      const deveIncluir = !apenasSelecionados || node.checked || node.indeterminate;
      if (deveIncluir) {
        const novoNodo: any = {
          id: node.id,
          name: node.name,
          type: node.type,
        };
        if (node.type === 'folder' && node.children) {
          novoNodo.children = this.processarNodosParaExport(node.children, apenasSelecionados);
        }
        resultado.push(novoNodo);
      }
    });
    return resultado;
  }

  private downloadJSON(obj: any, filename: string): void {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

}