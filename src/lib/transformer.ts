import { pipeline, env } from '@xenova/transformers';

// Configure transformers.js for web/browser environment
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface ModelOption {
  id: string;
  name: string;
  size: string;
  description: string;
  task: 'text2text-generation' | 'text-generation';
}

export const TRANSFORMER_MODELS: ModelOption[] = [
  {
    id: 'Xenova/LaMini-Flan-T5-248M',
    name: 'LaMini Flan-T5 (248M)',
    size: '~250 MB',
    description: 'Fast & lightweight seq2seq model ideal for Bengali / English headline key-phrase extraction.',
    task: 'text2text-generation'
  },
  {
    id: 'Xenova/LaMini-Flan-T5-783M',
    name: 'LaMini Flan-T5 (783M)',
    size: '~780 MB',
    description: 'Medium accuracy seq2seq model with stronger text understanding.',
    task: 'text2text-generation'
  },
  {
    id: 'Xenova/Qwen1.5-0.5B-Chat',
    name: 'Qwen 1.5 Chat (0.5B)',
    size: '~500 MB',
    description: 'Medium multilingual instruction LLM supporting Bengali & English reasoning.',
    task: 'text-generation'
  },
  {
    id: 'Xenova/distilgpt2',
    name: 'DistilGPT-2 (82M)',
    size: '~85 MB',
    description: 'Ultra-fast compact text model.',
    task: 'text-generation'
  }
];

export interface LoadingProgress {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress: number;
  file?: string;
  message?: string;
}

type ProgressCallback = (progress: LoadingProgress) => void;

let activePipeline: any = null;
let activeModelId: string | null = null;
let isLoading = false;

export const loadTransformerModel = async (
  modelId: string,
  onProgress?: ProgressCallback
): Promise<any> => {
  if (activePipeline && activeModelId === modelId) {
    if (onProgress) onProgress({ status: 'ready', progress: 100, message: 'Model is ready' });
    return activePipeline;
  }

  const modelInfo = TRANSFORMER_MODELS.find(m => m.id === modelId) || TRANSFORMER_MODELS[0];
  isLoading = true;

  if (onProgress) {
    onProgress({ status: 'loading', progress: 0, message: `Initializing ${modelInfo.name}...` });
  }

  try {
    const pipe = await pipeline(modelInfo.task as any, modelInfo.id, {
      progress_callback: (p: any) => {
        if (p.status === 'progress') {
          const pct = Math.round(p.progress || 0);
          if (onProgress) {
            onProgress({
              status: 'loading',
              progress: pct,
              file: p.file,
              message: `Downloading ${p.file || 'model files'}... ${pct}%`
            });
          }
        }
      }
    });

    activePipeline = pipe;
    activeModelId = modelId;
    isLoading = false;

    if (onProgress) {
      onProgress({ status: 'ready', progress: 100, message: `${modelInfo.name} loaded successfully!` });
    }

    return pipe;
  } catch (error: any) {
    isLoading = false;
    const errorMsg = error?.message || 'Failed to load model';
    if (onProgress) {
      onProgress({ status: 'error', progress: 0, message: errorMsg });
    }
    throw error;
  }
};

export const normalizeWord = (word: string): string => {
  return word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'’“”‘।?]/g, '').trim().toLowerCase();
};

/**
 * Extracts highlighted word indices from model output containing markdown double asterisks (`**`).
 */
export const parseMarkdownHighlights = (originalTitle: string, modelOutput: string): number[] => {
  const originalWords = originalTitle.trim().split(/\s+/).filter(Boolean);
  if (!modelOutput || originalWords.length === 0) return [];

  // Match all text inside ** ... **
  const highlightedSegments: string[] = [];
  const regex = /\*\*(.*?)\*\*/g;
  let match;

  while ((match = regex.exec(modelOutput)) !== null) {
    if (match[1] && match[1].trim()) {
      highlightedSegments.push(match[1].trim());
    }
  }

  if (highlightedSegments.length === 0) {
    return [];
  }

  const highlightedWords = highlightedSegments
    .flatMap(seg => seg.split(/\s+/))
    .map(w => normalizeWord(w))
    .filter(Boolean);

  const indices: number[] = [];
  originalWords.forEach((word, idx) => {
    const norm = normalizeWord(word);
    if (highlightedWords.includes(norm)) {
      indices.push(idx);
    }
  });

  return indices;
};

/**
 * Sends a title headline to the loaded Transformer.js model with prompt instructions
 * to mark important highlight words using markdown `**` syntax.
 */
export const highlightTitleWithModel = async (
  title: string,
  modelId: string = TRANSFORMER_MODELS[0].id,
  onProgress?: ProgressCallback
): Promise<{ rawResponse: string; highlightedIndices: number[] }> => {
  if (!title.trim()) {
    return { rawResponse: '', highlightedIndices: [] };
  }

  const pipe = await loadTransformerModel(modelId, onProgress);
  const modelInfo = TRANSFORMER_MODELS.find(m => m.id === modelId) || TRANSFORMER_MODELS[0];

  const prompt = `Identify key highlight words in this news headline for a photo card overlay. Return the headline with key words enclosed in double asterisks **like this**.

Headline: ${title.trim()}
Output:`;

  try {
    let resultText = '';
    if (modelInfo.task === 'text2text-generation') {
      const output = await pipe(prompt, {
        max_new_tokens: 128,
        temperature: 0.3,
        do_sample: false
      });
      resultText = Array.isArray(output) ? output[0]?.generated_text || '' : output?.generated_text || '';
    } else {
      const output = await pipe(prompt, {
        max_new_tokens: 128,
        temperature: 0.3,
        do_sample: false
      });
      const generated = Array.isArray(output) ? output[0]?.generated_text || '' : output?.generated_text || '';
      resultText = generated.replace(prompt, '').trim();
    }

    const indices = parseMarkdownHighlights(title, resultText);
    return {
      rawResponse: resultText,
      highlightedIndices: indices
    };
  } catch (err) {
    console.error("Transformer auto highlight error:", err);
    throw err;
  }
};
