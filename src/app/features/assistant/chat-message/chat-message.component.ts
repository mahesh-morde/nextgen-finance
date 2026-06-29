import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../chat.service';
import { marked } from 'marked';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ChatMessageComponent implements OnInit {
  @Input() message!: ChatMessage;
  
  parsedContent: string = '';

  ngOnInit() {
    this.parseContent();
  }

  ngOnChanges() {
    this.parseContent();
  }

  private parseContent() {
    if (this.message?.content) {
      this.parsedContent = marked.parse(this.message.content) as string;
    } else {
      this.parsedContent = '';
    }
  }
}
