import { Component, Input, OnInit } from '@angular/core';
import { TreeNode } from '../../entidades/TreeNode';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-treeview',
  imports: [CommonModule],
  templateUrl: './treeview.html',
  styleUrl: './treeview.scss',
})
export class Treeview implements OnInit {

  @Input() nodes: TreeNode[] = [];

  constructor() {
    
  }

  ngOnInit(): void {
    
  }

}