import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Cpu, Sparkles, Check, Loader2, AlertCircle, Play, X } from "lucide-react";
import {
  TRANSFORMER_MODELS,
  LoadingProgress,
  loadTransformerModel,
  highlightTitleWithModel,
  ModelOption
} from "@/lib/transformer";

interface TransformerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TransformerModal: React.FC<TransformerModalProps> = ({ open, onOpenChange }) => {
  const [selectedModel, setSelectedModel] = useState<string>(
    () => localStorage.getItem('bg_selected_model') || TRANSFORMER_MODELS[0].id
  );
  const [isEnabled, setIsEnabled] = useState<boolean>(
    () => localStorage.getItem('bg_transformer_enabled') === 'true'
  );
  const [loadingState, setLoadingState] = useState<LoadingProgress>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const [testHeadline, setTestHeadline] = useState<string>(
    'ঢাকা শহরের যানজট নিরসনে নতুন ফ্লাইওভার উদ্বোধন করলেন প্রধানমন্ত্রী'
  );
  const [testOutput, setTestOutput] = useState<{ rawResponse: string; highlightedIndices: number[] } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('bg_selected_model', selectedModel);
    localStorage.setItem('bg_transformer_enabled', String(isEnabled));
    window.dispatchEvent(new Event('storage'));
  }, [selectedModel, isEnabled]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [open]);

  if (!open) return null;

  const handleSelectModel = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleToggleEnable = () => {
    const nextState = !isEnabled;
    setIsEnabled(nextState);
  };

  const handleLoadModel = async () => {
    try {
      await loadTransformerModel(selectedModel, (progress) => {
        setLoadingState(progress);
      });
    } catch (e: any) {
      setLoadingState({
        status: 'error',
        progress: 0,
        message: e?.message || 'Failed to initialize model.'
      });
    }
  };

  const handleRunTest = async () => {
    if (!testHeadline.trim()) return;
    setIsTesting(true);
    setTestOutput(null);
    try {
      const res = await highlightTitleWithModel(testHeadline, selectedModel, (p) => setLoadingState(p));
      setTestOutput(res);
    } catch (err: any) {
      setLoadingState({
        status: 'error',
        progress: 0,
        message: err?.message || 'Inference error'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const currentModelObj = TRANSFORMER_MODELS.find(m => m.id === selectedModel) || TRANSFORMER_MODELS[0];

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto"
      onClick={() => onOpenChange(false)}
    >
      <div
        className="bg-card border border-border max-w-2xl w-full p-6 sm:p-8 shadow-2xl rounded-3xl space-y-6 my-auto animate-in zoom-in-95 duration-300 relative z-[110]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Transformer.js AI Auto-Highlight
              </h2>
              <p className="text-xs text-muted-foreground">
                Client-side LLM models to auto detect key highlight words in headlines
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={isEnabled ? "default" : "outline"}
              onClick={handleToggleEnable}
              className={cn(
                "h-10 px-4 font-bold text-xs gap-2 rounded-xl transition-all",
                isEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20"
                  : "border-border text-muted-foreground"
              )}
            >
              <Sparkles className="w-4 h-4" />
              {isEnabled ? "Feature Activated" : "Activate Feature"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Model Selection Grid */}
        <div className="space-y-3">
          <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Select Medium-Range Model Option
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRANSFORMER_MODELS.map((m: ModelOption) => {
              const isSelected = selectedModel === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectModel(m.id)}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all relative space-y-2 flex flex-col justify-between",
                    isSelected
                      ? "bg-primary/10 border-primary shadow-md"
                      : "bg-card border-border hover:bg-muted/50 text-foreground"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{m.name}</h4>
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground inline-block mt-1">
                        {m.size}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {m.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Model Loading / Status Indicator */}
        <div className="p-4 bg-muted/40 border border-border rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground">Model Status:</span>
            <span className={cn(
              "font-mono uppercase font-bold",
              loadingState.status === 'ready' ? "text-emerald-500" :
              loadingState.status === 'loading' ? "text-amber-500" :
              loadingState.status === 'error' ? "text-destructive" : "text-muted-foreground"
            )}>
              {loadingState.status === 'ready' ? 'Ready' :
               loadingState.status === 'loading' ? 'Loading / Downloading' :
               loadingState.status === 'error' ? 'Error' : 'Not Loaded'}
            </span>
          </div>

          {loadingState.status === 'loading' && (
            <div className="space-y-1.5">
              <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${loadingState.progress}%` }}
                />
              </div>
              <p className="text-[11px] font-mono text-muted-foreground text-center">
                {loadingState.message}
              </p>
            </div>
          )}

          {loadingState.status === 'error' && (
            <div className="flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loadingState.message}</span>
            </div>
          )}

          {loadingState.status !== 'loading' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadModel}
              className="w-full h-9 text-xs font-bold gap-2 rounded-lg border-border"
            >
              <Cpu className="w-3.5 h-3.5" />
              Pre-load {currentModelObj.name}
            </Button>
          )}
        </div>

        {/* Test Playground */}
        <div className="space-y-3 border-t border-border pt-4">
          <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Highlight Test Playground
          </Label>
          <div className="space-y-2">
            <Textarea
              value={testHeadline}
              onChange={(e) => setTestHeadline(e.target.value)}
              placeholder="Enter Bengali / English headline to test..."
              className="bg-muted/30 border-border text-sm min-h-[70px] rounded-xl"
            />
            <Button
              onClick={handleRunTest}
              disabled={isTesting || !testHeadline.trim()}
              className="w-full h-10 font-bold text-xs gap-2 rounded-xl"
            >
              {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Highlight Inference
            </Button>
          </div>

          {testOutput && (
            <div className="p-4 bg-muted/50 border border-border rounded-xl space-y-3 animate-in fade-in duration-300">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Raw Model Response (Markdown `**` highlighted):
                </span>
                <p className="text-xs font-mono bg-card p-2 rounded border border-border text-foreground leading-relaxed">
                  {testOutput.rawResponse || '(No markdown response generated)'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Parsed Output Highlighted Headline:
                </span>
                <div className="p-3 bg-card rounded border border-border flex flex-wrap gap-1.5 leading-relaxed">
                  {testHeadline.trim().split(/\s+/).map((word, idx) => {
                    const isHighlighted = testOutput.highlightedIndices.includes(idx);
                    return (
                      <span
                        key={idx}
                        className={cn(
                          "px-2 py-0.5 rounded text-sm font-semibold transition-all",
                          isHighlighted
                            ? "bg-amber-400 text-black shadow-sm font-bold"
                            : "text-foreground"
                        )}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
