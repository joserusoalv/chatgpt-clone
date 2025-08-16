export interface Agent {
  id: string;
  name: string;
  model: string;
  systemPrompt?: string;
  temperature?: number;
  topP?: number;
}
