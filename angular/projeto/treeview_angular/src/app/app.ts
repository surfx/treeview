// Forçando a recarga do arquivo pelo compilador.
import { Component, OnInit, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Treeview } from "./componentes/treeview/treeview";
import { Treeviewserver } from './services/treeviewserver';
import { TreeNode } from './entidades/TreeNode';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, Treeview],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  treeData: Signal<TreeNode[]>;

  constructor(private treeviewServer: Treeviewserver) {
    this.treeData = this.treeviewServer.nodes;
  }

  ngOnInit(): void {
    this.treeviewServer.fetchTreeData();
  }

  // Otimista: A UI já foi atualizada pelo componente filho. Apenas persistimos.
  onNodeUpdate(event: { id: string; changes: Partial<TreeNode> }): void {
    this.treeviewServer.updateNode(event.id, event.changes).subscribe({
      next: () => console.log(`App: Nó ${event.id} atualizado no servidor.`),
      error: (err) => {
        console.error(`App: Erro ao atualizar nó ${event.id}. Recarregando árvore para garantir consistência.`, err);
        this.treeviewServer.fetchTreeData(); // Desfaz a alteração otimista
      }
    });
  }

  // Otimista: A UI já foi atualizada.
  onNodeDelete(nodeId: string): void {
    this.treeviewServer.deleteNode(nodeId).subscribe({
      next: () => console.log(`App: Nó ${nodeId} deletado no servidor.`),
      error: (err) => {
        console.error(`App: Erro ao deletar nó ${nodeId}. Recarregando árvore para garantir consistência.`, err);
        this.treeviewServer.fetchTreeData();
      }
    });
  }

  // Para mudanças estruturais, salvamos a árvore inteira.
  onStructuralChange(nodes: TreeNode[]): void {
    // O filho já atualizou seu estado local, agora atualizamos o estado central no serviço.
    this.treeviewServer.updateNodes(nodes);
    this.treeviewServer.saveTreeData().subscribe({
      next: () => console.log('App: Estrutura da árvore salva no servidor.'),
      error: (err) => {
        console.error(`App: Erro ao salvar estrutura. Recarregando árvore para garantir consistência.`, err);
        this.treeviewServer.fetchTreeData();
      }
    });
  }

}