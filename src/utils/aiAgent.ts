import { useScheduleStore } from '../stores/scheduleStore';
import { findAlternativeSlots } from './scheduler/manualValidator';
import type { ScheduledSection } from '../types';

interface AiResponse {
  text: string;
  actions?: {
    type: 'moveSection';
    sectionId: string;
    roomId: string;
    startTime: string;
    endTime: string;
    dayPattern: string;
  }[];
}

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are a helpful scheduling assistant for a university.
You have access to the current schedule, conflicts, and warnings.
Your goal is to help the user resolve conflicts and optimize the schedule.

You can perform the following actions by outputting a JSON block at the end of your message:
{
  "actions": [
    {
      "type": "moveSection",
      "sectionId": "Math-101-S1",
      "roomId": "Baker-100",
      "startTime": "09:00",
      "endTime": "10:30",
      "dayPattern": "MO-WE"
    }
  ]
}

When suggesting a move, always verify it is a valid slot using the provided context or by asking the user to check.
If a user asks to fix a conflict, look for available slots for the conflicting section and suggest the best one.
Keep your responses concise and helpful.
`;

export const processUserQuery = async (
  query: string,
  apiKey: string,
  history: Message[]
): Promise<AiResponse> => {
  const store = useScheduleStore.getState();
  const { sections, conflicts, warnings, rooms } = store;

  // Context building
  const conflictContext = conflicts.length
    ? `Current Conflicts:\n${conflicts.join('\n')}`
    : 'No conflicts currently.';
  
  const warningContext = warnings.length
    ? `Current Warnings:\n${warnings.join('\n')}`
    : 'No warnings currently.';

  // Simple heuristic for "fix conflict" if no API key or just to augment context
  let suggestionContext = '';
  if (query.toLowerCase().includes('fix') || query.toLowerCase().includes('conflict')) {
    const conflictingSections = sections.filter(s => 
      conflicts.some(c => c.includes(s.courseId) || c.includes(s.roomId) || c.includes(s.teacher))
    );
    
    if (conflictingSections.length > 0) {
      const s = conflictingSections[0];
      const alts = findAlternativeSlots(s, rooms, sections, 3);
      if (alts.length > 0) {
        suggestionContext = `\nPossible fix for ${s.id}: Move to ${alts[0].roomId} at ${alts[0].startTime} (${alts[0].dayPattern}).`;
      } else {
        suggestionContext = `\nNo automatic alternatives found for ${s.id}.`;
      }
    }
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: `Context:\n${conflictContext}\n${warningContext}\n${suggestionContext}` },
    ...history,
    { role: 'user', content: query }
  ];

  try {
    console.log('🚀 Sending request to OpenAI...');
    console.log('Messages:', JSON.stringify(messages, null, 2));

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ OpenAI API Error:', error);
      throw new Error(error.error?.message || 'Failed to call AI API');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('📩 Received response from OpenAI:', content);

    // Parse for actions
    let actions = [];
    try {
      // Try to find JSON block, handling markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*"actions"[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonString = jsonMatch[1] || jsonMatch[0];
        console.log('🔍 Found JSON candidate:', jsonString);
        const parsed = JSON.parse(jsonString);
        actions = parsed.actions;
        console.log('✅ Parsed actions:', actions);
      } else {
        console.log('⚠️ No JSON actions found in response');
      }
    } catch (e) {
      console.error('❌ Failed to parse actions from AI response', e);
    }

    // Clean up the text to remove the JSON block for display
    const cleanText = content
      .replace(/```json\n[\s\S]*?\n```/, '') // Remove markdown code blocks
      .replace(/\{[\s\S]*"actions"[\s\S]*\}/, '') // Remove raw JSON if not in code block
      .trim();

    return {
      text: cleanText,
      actions,
    };

  } catch (error) {
    console.error('💥 AI Agent Exception:', error);
    return {
      text: `I encountered an error: ${(error as Error).message}. Please check your API key.`,
    };
  }
};
