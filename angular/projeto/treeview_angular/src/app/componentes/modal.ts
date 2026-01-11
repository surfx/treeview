import { Component, ElementRef, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ModalConfig {
  title: string;
  message: string;
  isPrompt?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.html',
  styleUrls: ['./modal.scss']
})
export class ModalComponent {

  @Output() confirmed = new EventEmitter<string | boolean>();
  @Output() cancelled = new EventEmitter<void>();

  @ViewChild('modalContent') modalContent!: ElementRef;

  public isOpen = false;
  public config: ModalConfig = { title: '', message: '' };
  public inputValue = '';
  
  private resolveFn?: (value: string | boolean | null) => void;

  constructor(private el: ElementRef) {}

  open(config: ModalConfig, defaultValue?: string): Promise<string | boolean | null> {
    this.config = config;
    this.inputValue = defaultValue || '';
    this.isOpen = true;
    
    if (config.isPrompt) {
      setTimeout(() => {
        const input = this.el.nativeElement.querySelector('#modalInput');
        if (input) {
          input.focus();
          input.select();
        }
      }, 50);
    }

    return new Promise(resolve => {
      this.resolveFn = resolve;
    });
  }

  confirm(): void {
    if (this.config.isPrompt && !this.inputValue.trim()) {
      return; // Não confirma se o prompt estiver vazio
    }
    const valueToEmit = this.config.isPrompt ? this.inputValue : true;
    this.resolveFn?.(valueToEmit);
    this.confirmed.emit(valueToEmit);
    this.close();
  }

  cancel(): void {
    this.resolveFn?.(null);
    this.cancelled.emit();
    this.close();
  }

  private close(): void {
    this.isOpen = false;
    this.resolveFn = undefined; // Limpa a função de resolução
  }

  closeOnOverlayClick(event: MouseEvent): void {
    // Fecha somente se o clique for no overlay, não no conteúdo do modal
    if (event.target === this.el.nativeElement.querySelector('.modal-overlay')) {
      this.cancel();
    }
  }

  @HostListener('window:keydown.escape')
  handleEscapeKey() {
    if (this.isOpen) {
      this.cancel();
    }
  }
}
