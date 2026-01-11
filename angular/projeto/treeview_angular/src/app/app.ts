import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Treeview } from "./componentes/treeview/treeview";
import { Treeviewserver } from './services/treeviewserver';
import { TreeNode } from './entidades/TreeNode';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Treeview],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {

  nodes = signal<TreeNode[]>([]);

  constructor(private treeviewserver: Treeviewserver) { }

  ngOnInit(): void {
    //this.treeviewserver.getTreeData().subscribe(data => this.nodes = data);
  console.log('Iniciando chamada API...');
    this.treeviewserver.getTreeData().subscribe(data => {
      this.nodes.set(data); // Atualiza o signal
    });
  }

}