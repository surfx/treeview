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
    // Inicia o carregamento dos dados, que irá atualizar o signal dentro do serviço.
    this.treeviewServer.fetchTreeData();
  }

  onTreeChange(nodes: TreeNode[]): void {
    // 1. Notifica o serviço sobre a nova versão dos nós para atualizar o signal.
    this.treeviewServer.updateNodes(nodes);
    // 2. Pede para o serviço salvar o estado atualizado no backend.
    this.treeviewServer.saveTreeData().subscribe(() => {
      console.log('Árvore salva com sucesso após mudança.');
    });
  }

}