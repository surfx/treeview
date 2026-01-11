import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TreeNode } from '../entidades/TreeNode';

@Injectable({
  providedIn: 'root',
})
export class Treeviewserver {
  private readonly API_URL = 'http://127.0.0.1:8000/tree';

  constructor(private http: HttpClient) {}

  getTreeData(): Observable<TreeNode[]> {
    return this.http.get<TreeNode[]>(this.API_URL, {
      headers: {
        'accept': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
  }

}