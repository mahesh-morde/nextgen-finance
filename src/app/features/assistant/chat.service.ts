import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AI_CONFIG } from '../../core/config/ai.config';
import { TranslationService } from '../../core/i18n/translation.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export type AIProvider = 'github' | 'groq' | 'google' | 'cohere';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private ts = inject(TranslationService);
  
  private messagesSignal = signal<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      content: '', // Will be updated on load
      timestamp: new Date()
    }
  ]);

  readonly messages = this.messagesSignal.asReadonly();
  readonly isTyping = signal<boolean>(false);
  
  public currentProvider = signal<AIProvider>('groq');

  constructor() {
    this.ts.onLangChange.subscribe(() => {
      this.messagesSignal.update(msgs => {
        const updated = [...msgs];
        if (updated.length > 0 && updated[0].id === 'init-1') {
          updated[0] = { ...updated[0], content: this.ts.translate('CHAT_INTENTS.INIT') };
        }
        return updated;
      });
    });
  }

  setProvider(provider: AIProvider) {
    this.currentProvider.set(provider);
  }

  sendMessage(content: string) {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };

    this.messagesSignal.update(m => [...m, userMsg]);
    this.isTyping.set(true);
    
    // Check if it's one of the predefined Advanced Showcase prompts
    const showcaseResponseKey = this.checkShowcaseIntents(content);
    if (showcaseResponseKey) {
      const translatedResponse = this.ts.translate(showcaseResponseKey);
      setTimeout(() => this.simulateStreamingResponse(translatedResponse), 500);
      return;
    }

    // Fallback to API if not a showcase intent
    const provider = this.currentProvider();
    this.callAIAPI(provider, content).subscribe({
      next: (response) => {
        this.simulateStreamingResponse(response);
      },
      error: (err) => {
        console.error('API Error:', err);
        // Fallback for demo mode if no API key is set
        this.simulateStreamingResponse(`I received your message: "${content}". \n\n*Note: Since live API keys are not configured for ${provider}, this is a fallback response. Try clicking the Skill Scenarios on the left to see my advanced generative capabilities in action!*`);
      }
    });
  }

  private checkShowcaseIntents(prompt: string): string | null {
    if (prompt.includes('Explain Options Trading responsibly')) {
      return 'CHAT_INTENTS.OPTIONS';
    }
    
    if (prompt.includes('Simulate the portfolio impact of a 20% spike in Brent Crude')) {
      return 'CHAT_INTENTS.RISK_SPIKE';
    }

    if (prompt.includes('Scan the last 30 days of trading for suspicious patterns')) {
      return 'CHAT_INTENTS.ANOMALY';
    }

    if (prompt.includes('Generate a highly structured weekly investment wrap-up')) {
      return 'CHAT_INTENTS.WEEKLY';
    }

    if (prompt.includes('Analyze the latest STCG tax rule changes and cross-reference')) {
      return 'CHAT_INTENTS.TAX';
    }

    if (prompt.includes('explainable breakdown of why my portfolio risk score is currently 78/100')) {
      return 'CHAT_INTENTS.RISK_SCORE';
    }

    return null;
  }

  private callAIAPI(provider: AIProvider, prompt: string): Observable<string> {
    const config = AI_CONFIG[provider];
    const systemPrompt = "You are an expert AI Financial Co-Pilot for the Indian Market. Keep responses concise, professional, and use Markdown.";

    if (provider === 'groq' || provider === 'github') {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json'
      });
      
      const body = {
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      };
      
      return this.http.post<any>(config.endpoint, body, { headers }).pipe(
        map((res: any) => {
          if (res.choices && res.choices.length > 0) {
            return res.choices[0].message.content;
          }
          throw new Error('Invalid response');
        })
      );
    } else if (provider === 'google') {
      const url = `${config.endpoint.split('?')[0]}?key=${config.key}`;
      const body = {
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          { parts: [{ text: prompt }] }
        ]
      };
      return this.http.post<any>(url, body).pipe(
        map((res: any) => {
          if (res.candidates && res.candidates.length > 0 && res.candidates[0].content.parts.length > 0) {
            return res.candidates[0].content.parts[0].text;
          }
          throw new Error('Invalid response');
        })
      );
    } else if (provider === 'cohere') {
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${config.key}`,
        'Content-Type': 'application/json'
      });
      const body = {
        message: prompt,
        preamble: systemPrompt,
        model: 'command-r' // using chat model
      };
      return this.http.post<any>('https://api.cohere.ai/v1/chat', body, { headers }).pipe(
        map((res: any) => {
          if (res.text) {
            return res.text;
          }
          throw new Error('Invalid response');
        })
      );
    }
    
    return new Observable<string>(s => s.error('Not implemented or no key'));
  }

  private simulateStreamingResponse(fullResponse: string) {
    const assistantMsgId = Date.now().toString() + '-asst';
    
    let currentContent = '';
    let index = 0;

    const initialMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    this.messagesSignal.update(m => [...m, initialMsg]);
    this.isTyping.set(false);

    // Dynamic streaming speed based on length
    const streamInterval = fullResponse.length > 500 ? 5 : 15;

    const interval = setInterval(() => {
      const chunkSize = Math.max(1, Math.floor(fullResponse.length / 75));
      
      if (index < fullResponse.length) {
        currentContent += fullResponse.substring(index, index + chunkSize);
        
        this.messagesSignal.update(msgs => {
          const updated = [...msgs];
          const msgIdx = updated.findIndex(m => m.id === assistantMsgId);
          if (msgIdx !== -1) {
            updated[msgIdx] = { ...updated[msgIdx], content: currentContent };
          }
          return updated;
        });
        index += chunkSize;
      } else {
        clearInterval(interval);
        this.messagesSignal.update(msgs => {
          const updated = [...msgs];
          const msgIdx = updated.findIndex(m => m.id === assistantMsgId);
          if (msgIdx !== -1) {
            updated[msgIdx] = { ...updated[msgIdx], content: fullResponse, isStreaming: false };
          }
          return updated;
        });
      }
    }, streamInterval);
  }
}
