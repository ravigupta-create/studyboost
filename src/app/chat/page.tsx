'use client';

import { useState, useRef, useEffect } from 'react';
import { useApiKey } from '@/hooks/useApiKey';
import { useToast } from '@/hooks/useToast';
import { chatSystemPrompt } from '@/lib/prompts';
import { streamGemini } from '@/lib/gemini';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarkdownRenderer } from '@/components/shared/MarkdownRenderer';
import { ApiKeySetup } from '@/components/shared/ApiKeySetup';

function buildChatPrompt(messages: ChatMessage[]): string {
  let prompt = chatSystemPrompt() + '\n\n';
  messages.forEach((m) => {
    prompt += m.role === 'user' ? `Student: ${m.content}\n` : `Tutor: ${m.content}\n`;
  });
  prompt += 'Tutor: ';
  return prompt;
}

export default function ChatPage() {
  const { hasKey, apiKey } = useApiKey();
  const { addToast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!hasKey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <PageHeader
          icon="💬"
          title="Study Chat"
          description="Chat with an AI tutor about any subject. Ask questions, get explanations, and learn interactively."
          aiPowered
        />
        <Card>
          <ApiKeySetup />
        </Card>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const assistantMsg: ChatMessage = { role: 'assistant', content: '' };
      setMessages([...newMessages, assistantMsg]);

      await streamGemini(apiKey, buildChatPrompt(newMessages), (text) => {
        setMessages([...newMessages, { role: 'assistant', content: text }]);
      });
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'An error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <PageHeader
        icon="💬"
        title="Study Chat"
        description="Chat with an AI tutor about any subject. Ask questions, get explanations, and learn interactively."
        aiPowered
      />

      <Card className="flex flex-col" style={{ height: '70vh' }}>
        {/* Messages area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-4 p-4 mb-4"
        >
          {messages.length === 0 && (
            <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
              <p className="text-center">
                Ask me anything! I can help with math, science, history, writing, and more.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-br-md'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">🤖</span>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      StudyBoost AI
                    </span>
                  </div>
                )}
                {msg.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                ) : msg.content ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <Spinner className="h-4 w-4" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex gap-3">
            <textarea
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors resize-none"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              disabled={loading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                size="md"
              >
                {loading ? <Spinner className="h-4 w-4" /> : 'Send'}
              </Button>
              {messages.length > 0 && !loading && (
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
