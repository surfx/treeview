// Forçando a recarga do arquivo pelo compilador.
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
    this.http.get<TreeNode[]>(this.API_URL).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.nodesSignal.set(data);
          console.log("Dados da árvore carregados e sinal atualizado.");
        } else {
          this.nodesSignal.set([]);
          console.warn("Servidor retornou dados em formato inesperado. Árvore definida como vazia.");
        }
      },
      error: (err) => {
        console.error("Erro ao carregar dados da árvore do servidor:", err);
        this.nodesSignal.set([]); // Define como vazio em caso de erro para evitar estado de carregamento infinito.
      }
    });
  }

  // Salva os dados atuais do Signal no servidor
  saveTreeData() {
    const currentData = this.nodesSignal();
    return this.http.post(this.API_URL, currentData);
  }

  // ATUALIZA um único nó no servidor
  updateNode(nodeId: string, updateData: Partial<TreeNode>): Observable<any> {
    return this.http.put(`${this.API_URL}/${nodeId}`, updateData);
  }

  // DELETA um único nó no servidor
  deleteNode(nodeId: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${nodeId}`);
  }

  // Método para que o AppComponent possa atualizar o estado no serviço
  updateNodes(nodes: TreeNode[]) {
    this.nodesSignal.set(nodes);
  }

}