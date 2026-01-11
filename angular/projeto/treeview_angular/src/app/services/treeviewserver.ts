// Forçando a recarga do arquivo pelo compilador.
import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TreeNode } from '../entidades/TreeNode';

@Injectable({
  providedIn: 'root',
})
export class Treeviewserver {
  private readonly API_URL = 'http://127.0.0.1:8000/tree';

  private nodesSignal = signal<TreeNode[]>([]);
  public readonly nodes = this.nodesSignal.asReadonly();

  constructor(private http: HttpClient) {}

  // Carrega os dados e atualiza o Signal
  fetchTreeData() {
    this.http.get<TreeNode[]>(this.API_URL).subscribe(data => {
      this.nodesSignal.set(data);
    });
  }

  // Salva os dados atuais do Signal no servidor
  saveTreeData() {
    const currentData = this.nodesSignal();
    return this.http.post(this.API_URL, currentData);
  }

  // Método para que o AppComponent possa atualizar o estado no serviço
  updateNodes(nodes: TreeNode[]) {
    this.nodesSignal.set(nodes);
  }

}