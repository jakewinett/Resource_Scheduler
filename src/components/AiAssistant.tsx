import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Settings, Sparkles, Loader2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useScheduleStore } from '../stores/scheduleStore';
import { processUserQuery } from '../utils/aiAgent';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [showSettings, setShowSettings] = useState(!apiKey);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I can help you resolve conflicts or optimize the schedule. Try asking "Fix the conflict with Math-101".' }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const moveSection = useScheduleStore(s => s.moveSection);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSaveKey = () => {
    localStorage.setItem('openai_api_key', apiKey);
    setShowSettings(false);
  };

  const downloadLogs = () => {
    const logContent = messages.map(m => `[${m.role.toUpperCase()}]\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scheduler-ai-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !apiKey) return;

    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      console.log('🤖 Processing user query:', input);
      const response = await processUserQuery(input, apiKey, messages);
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.text }]);

      if (response.actions && response.actions.length > 0) {
        console.log('⚡ Executing actions:', response.actions);
        response.actions.forEach(action => {
          if (action.type === 'moveSection') {
            console.log(`🔄 Moving section ${action.sectionId} to ${action.roomId} @ ${action.startTime}`);
            const result = moveSection(action.sectionId, {
              roomId: action.roomId,
              startTime: action.startTime,
              endTime: action.endTime,
              dayPattern: action.dayPattern as any
            });
            
            if (result.success) {
              console.log('✅ Move successful');
              setMessages(prev => [...prev, { 
                role: 'system', 
                content: `✅ Moved ${action.sectionId} to ${action.roomId} at ${action.startTime}` 
              }]);
            } else {
              console.error('❌ Move failed:', result.conflicts);
              setMessages(prev => [...prev, { 
                role: 'system', 
                content: `❌ Failed to move ${action.sectionId}: ${result.conflicts.join(', ')}` 
              }]);
            }
          }
        });
      }
    } catch (error) {
      console.error('💥 Error in chat handler:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Error processing request.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-xl"
        onClick={() => setIsOpen(true)}
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 shadow-2xl flex flex-col h-[600px] z-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500" />
          AI Assistant
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {showSettings ? (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">OpenAI API Key</label>
              <input
                type="password"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-slate-500">
                Your key is stored locally in your browser.
              </p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleSaveKey}>Save Key</Button>
              <Button variant="outline" onClick={downloadLogs} title="Download Chat Logs">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex w-max max-w-[80%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                    msg.role === 'user' 
                      ? "ml-auto bg-slate-900 text-white" 
                      : msg.role === 'system'
                        ? "mx-auto bg-slate-100 text-slate-600 text-xs w-full max-w-full text-center"
                        : "bg-slate-100 text-slate-900"
                  )}
                >
                  {msg.content}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-slate-500 p-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Thinking...
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-white">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  className="flex-1 rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="Ask to fix conflicts..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
