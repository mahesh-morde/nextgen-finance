import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../chat.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatMessageComponent, TranslatePipe],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss'
})
export class ChatWindowComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  inputText: string = '';

  get messages() {
    return this.chatService.messages();
  }

  get isTyping() {
    return this.chatService.isTyping();
  }
  
  get currentProvider() {
    return this.chatService.currentProvider();
  }

  setProvider(event: any) {
    this.chatService.setProvider(event.target.value);
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  sendMessage() {
    if (!this.inputText.trim()) return;
    this.chatService.sendMessage(this.inputText.trim());
    this.inputText = '';
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
