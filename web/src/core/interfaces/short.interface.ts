export interface ShortResponse {
  prompt?: ShortVideoResult;
  error?: string;
}

export interface ShortVideoTimelineSegment {
  range: string;
  content: string;
  prompt: string;
}

export interface ShortVideoResult {
  totalDuration: string;
  visualStyle: string;
  aspectRatio: string;
  visualQuality: string;
  timeline: ShortVideoTimelineSegment[];
  videoPromptFull: string;
}
