import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Treeview } from "./componentes/treeview/treeview";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Treeview],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  
}
