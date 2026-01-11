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

  // Eventos para notificar o componente pai sobre as mudanças.
  nodeUpdated = output<{ id: string; changes: Partial<TreeNode> }>();
  nodeDeleted = output<string>();
  structuralChange = output<TreeNode[]>();

  @ViewChild(ModalComponent) modal!: ModalComponent;

  private draggedNode: TreeNode | null = null;
  draggedOverNodeId: string | null = null;
  isRootDragOver = false;

  constructor() {}

  private triggerUIUpdate(): void {
    this.treeData.update(nodes => [...nodes]);
  }

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
      this.structuralChange.emit(this.treeData());
    }
  }

  async addNode(contextNode: TreeNode, type: 'folder' | 'file', event: MouseEvent): Promise<void> {
    event.stopPropagation();
    const label = type === 'folder' ? 'pasta' : 'arquivo';
    const title = `Novo ${label} ${contextNode.type === 'folder' ? 'em ' + contextNode.name : 'ao lado de ' + contextNode.name}`;
    
    const name = await this.showModal({
      title: `Novo ${label}`,
      message: `Digite o nome do novo ${label}:`,
      isPrompt: true
    });

    if (name && typeof name === 'string') {
        const newNode: TreeNode = {
            id: Date.now().toString(), name, type, checked: false,
            children: type === 'folder' ? [] : undefined
        };

        if (contextNode.type === 'folder') {
            // Ação em uma pasta: adiciona como filho.
            contextNode.children = contextNode.children || [];
            contextNode.children.push(newNode);
            contextNode.isOpen = true;
        } else {
            // Ação em um arquivo: adiciona como irmão.
            const success = this.addSiblingNode(this.treeData(), contextNode.id, newNode);
            if (!success) {
                console.error("Não foi possível encontrar o nó irmão para inserção.");
                return;
            }
        }
        this.updateAllParentStates();
        this.triggerUIUpdate();
        this.structuralChange.emit(this.treeData());
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
      const oldName = node.name;
      node.name = newName;
      this.triggerUIUpdate();
      this.nodeUpdated.emit({ id: node.id, changes: { name: newName } });
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
      if (this.findAndRemoveNode(this.treeData(), node.id)) {
        this.triggerUIUpdate();
        this.nodeDeleted.emit(node.id);
      }
    }
  }

  toggleCaret(node: TreeNode, event: MouseEvent): void {
    event.stopPropagation();
    if (node.type === 'folder') {
      node.isOpen = !node.isOpen;
      this.triggerUIUpdate();
      this.nodeUpdated.emit({ id: node.id, changes: { isOpen: node.isOpen } });
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
    this.triggerUIUpdate();
    this.structuralChange.emit(this.treeData());
  }

  onDragStart(event: DragEvent, node: TreeNode): void {
    event.stopPropagation();
    this.draggedNode = node;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, node: TreeNode): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.draggedNode?.id !== node.id) {
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
    if (this.draggedNode && this.draggedNode.id !== targetNode.id) {
      const mode = targetNode.type === 'folder' ? 'into' : 'before';
      this.moveNode(this.draggedNode.id, targetNode.id, mode);
    }
    this.draggedOverNodeId = null;
    this.draggedNode = null;
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
    this.draggedNode = null;
  }

  private moveNode(sourceId: string, targetId: string, mode: 'into' | 'before'): void {
    if (sourceId === targetId) return;
  
    const sourceDetailsForCheck = this.findNodeDetails(this.treeData(), sourceId);
    if (!sourceDetailsForCheck) {
      console.error('Source node not found for checking.');
      return;
    };
  
    if (this.isDescendant(sourceId, targetId)) {
      console.warn('Cannot move a node into its own descendant.');
      return;
    }
  
    const nodeToMove = this.findAndRemoveNode(this.treeData(), sourceId);
    if (!nodeToMove) return;
  
    const targetDetails = this.findNodeDetails(this.treeData(), targetId);
    if (!targetDetails) {
      console.error('Target node not found after source removal. Aborting move.');
      // Re-triggering a structural change to allow parent to handle state recovery.
      this.structuralChange.emit(this.treeData());
      return;
    }
  
    if (mode === 'into' && targetDetails.node.type === 'folder') {
      targetDetails.node.children = targetDetails.node.children || [];
      targetDetails.node.children.push(nodeToMove);
      targetDetails.node.isOpen = true;
    } else {
      const parentList = targetDetails.list;
      const targetIndex = targetDetails.index;
      parentList.splice(targetIndex, 0, nodeToMove);
    }
  
    this.updateAllParentStates();
    this.triggerUIUpdate();
    this.structuralChange.emit(this.treeData());
  }

  private moveNodeToRoot(sourceId: string): void {
    const nodeToMove = this.findAndRemoveNode(this.treeData(), sourceId);
    if (nodeToMove) {
      this.treeData.update(nodes => [...nodes, nodeToMove]);
      this.updateAllParentStates();
      this.triggerUIUpdate();
      this.structuralChange.emit(this.treeData());
    }
  }

  private findNodeDetails(nodes: TreeNode[], id: string, parent: TreeNode | null = null): { node: TreeNode, parent: TreeNode | null, list: TreeNode[], index: number } | null {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.id === id) {
        return { node, parent, list: nodes, index: i };
      }
      if (node.children) {
        const found = this.findNodeDetails(node.children, id, node);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  private addSiblingNode(nodes: TreeNode[], siblingId: string, newNode: TreeNode): boolean {
    const siblingIndex = nodes.findIndex(node => node.id === siblingId);
    if (siblingIndex !== -1) {
        nodes.splice(siblingIndex + 1, 0, newNode);
        return true;
    }

    for (const node of nodes) {
        if (node.children && this.addSiblingNode(node.children, siblingId, newNode)) {
            return true;
        }
    }

    return false;
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

  getCheckboxIcon(node: TreeNode): string {
    if (node.checked) return 'fa-regular fa-square-check';
    if (node.indeterminate) return 'fa-regular fa-square-minus';
    return 'fa-regular fa-square';
  }

  getFolderIcon(node: TreeNode): string {
    if (node.type === 'file') return 'fa-regular fa-file';
    return node.isOpen ? 'fa-regular fa-folder-open' : 'fa-regular fa-folder';
  }

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