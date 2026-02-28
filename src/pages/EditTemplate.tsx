import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  Trash2,
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Palette,
  Type,
  ImageIcon,
  QrCode,
  Layout,
  Plus,
  X,
  MousePointer2,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  Clock,
  Settings2,
  Image as ImageIconLucide,
  Layers,
  ArrowLeft
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import QRCode from "qrcode";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1080;

interface ShadowSettings {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

interface BorderSettings {
  enabled: boolean;
  color: string;
  width: number;
}

interface TextElement {
  id: string;
  text: string;
  enabled: boolean;
  x: number;
  y: number;
  size: number;
  color: string;
  font: string;
  align: 'left' | 'center' | 'right';
  letterSpacing: number;
  lineSpacing: number;
  shadow: ShadowSettings;
}

interface GraphicElement {
  id: string;
  type: 'image' | 'qr' | 'logo';
  enabled: boolean;
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
  border: BorderSettings;
  shadow: ShadowSettings;
  opacity?: number;
  src?: string;
}

interface MainImageElement extends GraphicElement {
  cornerRoundness: number;
}

interface Template {
  id: string;
  name: string;
  backgroundImage: string;
  title: TextElement;
  subtitleAbove?: TextElement;
  subtitleBelow?: TextElement;
  date: TextElement;
  image: MainImageElement;
  qr: GraphicElement;
  logos: GraphicElement[];
  extraTexts: TextElement[];
  sanitizer?: { enabled: boolean };
}

const DEFAULT_SHADOW: ShadowSettings = {
  enabled: false,
  color: 'rgba(0,0,0,0.5)',
  blur: 4,
  offsetX: 2,
  offsetY: 2
};

const DEFAULT_BORDER: BorderSettings = {
  enabled: false,
  color: '#22C55E',
  width: 2
};

const createTextElement = (id: string, text: string, x: number, y: number, size = 40): TextElement => ({
  id,
  text,
  enabled: true,
  x,
  y,
  size,
  color: '#ffffff',
  font: 'Kalpurush',
  align: 'center',
  letterSpacing: 0,
  lineSpacing: 1.1,
  shadow: { ...DEFAULT_SHADOW }
});

const createGraphicElement = (id: string, type: 'logo', x: number, y: number, w: number, h: number): GraphicElement => ({
  id,
  type,
  enabled: true,
  x,
  y,
  w,
  h,
  scale: 1,
  border: { ...DEFAULT_BORDER },
  shadow: { ...DEFAULT_SHADOW },
  opacity: 1,
  src: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=200'
});

const Joystick = ({ onMove, label, x, y, onChangeX, onChangeY, id }: any) => {
  return (
    <div className="space-y-6 pt-4">
      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">
        {label} Position (X: {x}, Y: {y})
      </Label>
      <div className="flex flex-col sm:flex-row gap-6 items-center bg-muted/5 p-6 rounded-[2rem] border-2 border-dashed">
        <div className="grid grid-cols-3 gap-2 w-fit">
          <div />
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all" onClick={() => onMove(0, -10)}>
            <ChevronUp className="w-5 h-5" />
          </Button>
          <div />
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all" onClick={() => onMove(-10, 0)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="w-10 h-10 flex items-center justify-center text-[10px] font-black text-primary border-2 border-primary/20 rounded-xl">
            {id || <Move className="w-4 h-4" />}
          </div>
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all" onClick={() => onMove(10, 0)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          <div />
          <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl shadow-sm hover:scale-110 active:scale-95 transition-all" onClick={() => onMove(0, 10)}>
            <ChevronDown className="w-5 h-5" />
          </Button>
          <div />
        </div>
        <div className="flex-1 w-full grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground ml-1">X Coord</span>
            <Input type="number" className="h-10 rounded-xl font-black border-2 bg-background focus:border-primary" value={x} onChange={(e) => onChangeX(parseInt(e.target.value) || 0)} />
          </div>
          <div className="space-y-2">
            <span className="text-[9px] font-black uppercase text-muted-foreground ml-1">Y Coord</span>
            <Input type="number" className="h-10 rounded-xl font-black border-2 bg-background focus:border-primary" value={y} onChange={(e) => onChangeY(parseInt(e.target.value) || 0)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const ColorPicker = ({ value, onChange, label }: { value: string, onChange: (val: string) => void, label: string }) => (
  <div className="space-y-3">
    <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">{label}</Label>
    <div className="flex gap-3">
      <Input
        className="h-11 px-4 text-xs font-black rounded-xl border-2 bg-muted/5 focus:border-primary transition-all uppercase tracking-widest"
        placeholder="#FFFFFF"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="h-11 w-11 rounded-xl p-0 border-2 shadow-sm" style={{ backgroundColor: value }}>
            <div className="w-full h-full rounded-xl border-4 border-background/20" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4 rounded-3xl border-2 shadow-2xl space-y-4">
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Palette</p>
            <div className="grid grid-cols-5 gap-2">
              {['#ffffff', '#22C55E', '#3b82f6', '#ef4444', '#eab308', '#a855f7', '#f97316', '#06b6d4', '#ec4899', '#000000'].map(c => (
                <button
                  key={c}
                  className={cn("w-8 h-8 rounded-lg border-2 border-white/20 transition-all hover:scale-110 shadow-sm", value === c && "ring-2 ring-primary scale-110 shadow-md")}
                  style={{ backgroundColor: c }}
                  onClick={() => onChange(c)}
                />
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Custom</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  className="h-9 pl-8 pr-2 text-[10px] font-black uppercase tracking-widest rounded-lg border-2"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-black text-[10px]">#</span>
              </div>
              <input
                type="color"
                className="w-9 h-9 p-0 border-none cursor-pointer rounded-lg overflow-hidden"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  </div>
);

const EditTemplate = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('canvas_templates');
    if (saved) {
      try {
        const parsed: Template[] = JSON.parse(saved);
        setTemplates(parsed);
        const current = parsed.find(t => t.id === templateId);
        if (current) {
          // Initialize missing fields for older templates
          const initialized: Template = {
            ...current,
            subtitleAbove: current.subtitleAbove || createTextElement('subtitleAbove', 'উপ-শিরোনাম (উপরে)', 540, 750),
            subtitleBelow: current.subtitleBelow || createTextElement('subtitleBelow', 'উপ-শিরোনাম (নিচে)', 540, 950),
            logos: current.logos || [],
            extraTexts: current.extraTexts || [],
            image: {
              ...current.image,
              cornerRoundness: (current.image as any).cornerRoundness || 0,
              shadow: current.image.shadow || { ...DEFAULT_SHADOW }
            },
            qr: {
              ...current.qr,
              shadow: current.qr.shadow || { ...DEFAULT_SHADOW }
            },
            title: {
              ...current.title,
              shadow: current.title.shadow || { ...DEFAULT_SHADOW }
            },
            date: {
              ...current.date,
              shadow: current.date.shadow || { ...DEFAULT_SHADOW }
            }
          };
          setTemplate(initialized);
          setActiveElementId('title');
        } else {
          toast.error("Template not found");
          navigate("/dashboard");
        }
      } catch (e) {
        console.error("Failed to load templates", e);
      }
    }
  }, [templateId, navigate]);

  useEffect(() => {
    if (template && templates.length > 0) {
      const updated = templates.map(t => t.id === template.id ? template : t);
      localStorage.setItem('canvas_templates', JSON.stringify(updated));
    }
    renderPreview();
  }, [template]);

  const renderPreview = async () => {
    if (!template || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    try {
      // Draw Background
      const bg = new Image();
      bg.crossOrigin = "anonymous";
      bg.src = template.backgroundImage;
      await new Promise((resolve) => { bg.onload = resolve; bg.onerror = resolve; });
      ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Helper for drawing text with shadow
      const drawText = (element: TextElement) => {
        if (!element.enabled) return;
        ctx.save();
        ctx.font = `bold ${element.size}px "${element.font}"`;
        ctx.fillStyle = element.color;
        ctx.textAlign = element.align as CanvasTextAlign;
        ctx.textBaseline = 'middle';

        if (element.shadow.enabled) {
          ctx.shadowColor = element.shadow.color;
          ctx.shadowBlur = element.shadow.blur;
          ctx.shadowOffsetX = element.shadow.offsetX;
          ctx.shadowOffsetY = element.shadow.offsetY;
        }

        ctx.fillText(element.text, element.x, element.y);
        ctx.restore();
      };

      // Draw Subtitles and Extra Texts
      if (template.subtitleAbove) drawText(template.subtitleAbove);
      drawText(template.title);
      if (template.subtitleBelow) drawText(template.subtitleBelow);
      drawText(template.date);
      template.extraTexts.forEach(drawText);

      // Helper for drawing image with shadow and border
      const drawGraphic = async (element: GraphicElement | MainImageElement) => {
        if (!element.enabled) return;
        ctx.save();

        if (element.shadow.enabled) {
          ctx.shadowColor = element.shadow.color;
          ctx.shadowBlur = element.shadow.blur;
          ctx.shadowOffsetX = element.shadow.offsetX;
          ctx.shadowOffsetY = element.shadow.offsetY;
        }

        if (element.type === 'image' || element.type === 'logo') {
           const img = new Image();
           img.crossOrigin = "anonymous";
           img.src = element.src || (element.type === 'image' ? 'https://images.unsplash.com/photo-1585829365234-78d2b85da94c?w=800' : '');
           if (img.src) {
             await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

             ctx.globalAlpha = element.opacity ?? 1;

             if ('cornerRoundness' in element && element.cornerRoundness > 0) {
                const r = element.cornerRoundness;
                ctx.beginPath();
                ctx.moveTo(element.x + r, element.y);
                ctx.lineTo(element.x + element.w - r, element.y);
                ctx.quadraticCurveTo(element.x + element.w, element.y, element.x + element.w, element.y + r);
                ctx.lineTo(element.x + element.w, element.y + element.h - r);
                ctx.quadraticCurveTo(element.x + element.w, element.y + element.h, element.x + element.w - r, element.y + element.h);
                ctx.lineTo(element.x + r, element.y + element.h);
                ctx.quadraticCurveTo(element.x, element.y + element.h, element.x, element.y + element.h - r);
                ctx.lineTo(element.x, element.y + r);
                ctx.quadraticCurveTo(element.x, element.y, element.x + r, element.y);
                ctx.closePath();
                ctx.clip();
             }

             ctx.drawImage(img, element.x, element.y, element.w, element.h);
           }
        } else if (element.type === 'qr') {
           const qrDataUrl = await QRCode.toDataURL("https://drutopost.com", { margin: 1, width: element.w });
           const qrImg = new Image();
           qrImg.src = qrDataUrl;
           await new Promise(r => qrImg.onload = r);
           ctx.drawImage(qrImg, element.x, element.y, element.w, element.h);
        }

        ctx.restore();

        if (element.border.enabled) {
          ctx.strokeStyle = element.border.color;
          ctx.lineWidth = element.border.width;
          ctx.strokeRect(element.x, element.y, element.w, element.h);
        }
      };

      await drawGraphic(template.image);
      await drawGraphic(template.qr);
      for (const logo of template.logos) await drawGraphic(logo);

      setPreviewUrl(canvas.toDataURL());
    } catch (e) {
      console.error("Preview render error", e);
    }
  };

  const handleUpdateTemplateName = (name: string) => {
    if (template) setTemplate({ ...template, name });
  };

  const handleDeleteTemplate = () => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      const remaining = templates.filter(t => t.id !== templateId);
      localStorage.setItem('canvas_templates', JSON.stringify(remaining));
      toast.success("Template deleted");
      navigate("/dashboard");
    }
  };

  const updateElement = (id: string, updates: any) => {
    if (!template) return;
    const t = { ...template };
    if (id === 'title') t.title = { ...t.title, ...updates };
    else if (id === 'subtitleAbove') t.subtitleAbove = { ...t.subtitleAbove!, ...updates };
    else if (id === 'subtitleBelow') t.subtitleBelow = { ...t.subtitleBelow!, ...updates };
    else if (id === 'date') t.date = { ...t.date, ...updates };
    else if (id === 'image') t.image = { ...t.image, ...updates };
    else if (id === 'qr') t.qr = { ...t.qr, ...updates };
    else if (id.startsWith('logo-')) {
      t.logos = t.logos.map(l => l.id === id ? { ...l, ...updates } : l);
    } else if (id.startsWith('extra-')) {
      t.extraTexts = t.extraTexts.map(et => et.id === id ? { ...et, ...updates } : et);
    }
    setTemplate(t);
  };

  const getActiveElement = () => {
    if (!template || !activeElementId) return null;
    if (activeElementId === 'title') return template.title;
    if (activeElementId === 'subtitleAbove') return template.subtitleAbove;
    if (activeElementId === 'subtitleBelow') return template.subtitleBelow;
    if (activeElementId === 'date') return template.date;
    if (activeElementId === 'image') return template.image;
    if (activeElementId === 'qr') return template.qr;
    if (activeElementId.startsWith('logo-')) return template.logos.find(l => l.id === activeElementId);
    if (activeElementId.startsWith('extra-')) return template.extraTexts.find(et => et.id === activeElementId);
    return null;
  };

  const activeElement = getActiveElement();

  if (!template) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans antialiased">
      {/* Header */}
      <header className="h-20 px-6 md:px-10 border-b flex items-center justify-between bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="h-8 w-px bg-border" />
          <h1 className="text-xl md:text-2xl font-black font-viga tracking-tight uppercase">Edit Template</h1>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-xl md:rounded-2xl border">
             <Input
                className="bg-transparent border-none focus-visible:ring-0 font-bold text-xs md:text-sm w-24 md:w-48 h-8 md:h-10"
                value={template.name}
                onChange={(e) => handleUpdateTemplateName(e.target.value)}
                placeholder="Template Name"
             />
          </div>
          <Button variant="destructive" size="icon" className="rounded-xl md:rounded-2xl shadow-lg shadow-destructive/20 w-8 h-8 md:w-10 md:h-10" onClick={handleDeleteTemplate} title="Delete Template">
            <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Column: Customization (Scrollable) */}
        <div className="w-full lg:w-[450px] flex-1 lg:flex-none border-r bg-card/30 overflow-y-auto order-2 lg:order-1 scrollbar-hide">
          <div className="p-8 pb-32 space-y-10">
            {/* Element Selection List */}
            <div className="space-y-4">
               <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Select Element</Label>
               <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'title', name: 'Title', icon: Type },
                    { id: 'subtitleAbove', name: 'Sub Above', icon: Type },
                    { id: 'subtitleBelow', name: 'Sub Below', icon: Type },
                    { id: 'date', name: 'Date', icon: Clock },
                    { id: 'image', name: 'Main Image', icon: ImageIconLucide },
                    { id: 'qr', name: 'QR Code', icon: QrCode },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveElementId(item.id)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left",
                        activeElementId === item.id ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-card border-transparent hover:border-primary/30 text-muted-foreground"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-xs font-bold">{item.name}</span>
                    </button>
                  ))}
               </div>

               {/* Logos & Extra Texts Section */}
               <div className="pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                     <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Logos & Extras</Label>
                     <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 px-2 rounded-lg text-[10px] font-bold" onClick={() => {
                           const id = `logo-${Math.random().toString(36).substr(2, 5)}`;
                           const newLogo = createGraphicElement(id, 'logo', 50, 50, 150, 150);
                           setTemplate({ ...template, logos: [...template.logos, newLogo] });
                           setActiveElementId(id);
                        }}>+ Logo</Button>
                        <Button variant="outline" size="sm" className="h-7 px-2 rounded-lg text-[10px] font-bold" onClick={() => {
                           const id = `extra-${Math.random().toString(36).substr(2, 5)}`;
                           const newText = createTextElement(id, 'নতুন টেক্সট', 500, 500, 30);
                           setTemplate({ ...template, extraTexts: [...template.extraTexts, newText] });
                           setActiveElementId(id);
                        }}>+ Text</Button>
                     </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {template.logos.map((logo, idx) => (
                        <button
                          key={logo.id}
                          onClick={() => setActiveElementId(logo.id)}
                          className={cn(
                            "px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all",
                            activeElementId === logo.id ? "bg-primary border-primary text-white" : "bg-card border-transparent hover:border-primary/30"
                          )}
                        >Logo {idx + 1}</button>
                     ))}
                     {template.extraTexts.map((et, idx) => (
                        <button
                          key={et.id}
                          onClick={() => setActiveElementId(et.id)}
                          className={cn(
                            "px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all",
                            activeElementId === et.id ? "bg-primary border-primary text-white" : "bg-card border-transparent hover:border-primary/30"
                          )}
                        >Text {idx + 1}</button>
                     ))}
                  </div>
               </div>
            </div>

            <div className="h-px bg-border" />

            {/* Dynamic Settings Panel */}
            {activeElement && (
              <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <Settings2 className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="text-lg font-black uppercase tracking-widest">{activeElementId?.replace(/-/g, ' ')} Settings</h3>
                   </div>
                   <div className="flex items-center gap-2">
                      <Label className="text-[10px] font-bold uppercase">Visible</Label>
                      <input
                        type="checkbox"
                        checked={activeElement.enabled}
                        onChange={(e) => updateElement(activeElementId!, { enabled: e.target.checked })}
                        className="w-4 h-4 accent-primary"
                      />
                      {(activeElementId?.startsWith('logo-') || activeElementId?.startsWith('extra-')) && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive ml-2" onClick={() => {
                           if (activeElementId.startsWith('logo-')) {
                              setTemplate({ ...template, logos: template.logos.filter(l => l.id !== activeElementId) });
                           } else {
                              setTemplate({ ...template, extraTexts: template.extraTexts.filter(et => et.id !== activeElementId) });
                           }
                           setActiveElementId('title');
                        }}>
                           <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                   </div>
                </div>

                {/* Text Specific Settings */}
                {'text' in activeElement && (
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Content</Label>
                      <Textarea
                        className="bg-muted/5 border-2 rounded-2xl min-h-[80px] font-bangla text-base"
                        value={activeElement.text}
                        onChange={(e) => updateElement(activeElementId!, { text: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Font Family</Label>
                        <select
                          className="w-full h-11 px-4 rounded-xl border-2 bg-muted/5 font-medium text-xs focus:border-primary transition-all outline-none"
                          value={activeElement.font}
                          onChange={(e) => updateElement(activeElementId!, { font: e.target.value })}
                        >
                          <option>Kalpurush</option>
                          <option>Solaiman Lipi</option>
                          <option>Adorsho Lipi</option>
                          <option>Bornomala</option>
                          <option>Inter</option>
                          <option>Cambria</option>
                        </select>
                      </div>
                      <ColorPicker
                        label="Text Color"
                        value={activeElement.color}
                        onChange={(val) => updateElement(activeElementId!, { color: val })}
                      />
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Font Size ({activeElement.size}px)</Label>
                       </div>
                       <Input
                          type="range" min="10" max="200" step="1"
                          className="accent-primary h-1.5"
                          value={activeElement.size}
                          onChange={(e) => updateElement(activeElementId!, { size: parseInt(e.target.value) })}
                       />
                    </div>
                    <div className="space-y-4">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Alignment</Label>
                      <div className="flex gap-2 p-1 border-2 rounded-xl bg-muted/5 h-11">
                        {['left', 'center', 'right'].map((align) => (
                          <button
                            key={align}
                            className={cn(
                              "flex-1 flex items-center justify-center rounded-lg transition-all",
                              activeElement.align === align ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-muted/50"
                            )}
                            onClick={() => updateElement(activeElementId!, { align })}
                          >
                            {align === 'left' ? <AlignLeft className="w-4 h-4" /> : align === 'center' ? <AlignCenter className="w-4 h-4" /> : <AlignRight className="w-4 h-4" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Graphics Specific Settings (Image, QR, Logo) */}
                {'w' in activeElement && (
                   <div className="space-y-8">
                      {activeElement.type === 'logo' && (
                        <div className="space-y-3">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Logo URL</Label>
                           <div className="flex gap-2">
                              <Input
                                className="bg-muted/5 border-2 rounded-xl h-11"
                                value={activeElement.src}
                                onChange={(e) => updateElement(activeElementId!, { src: e.target.value })}
                              />
                           </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-4">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Width</Label>
                            <Input
                               type="number" className="h-11 rounded-xl font-black border-2"
                               value={activeElement.w}
                               onChange={(e) => updateElement(activeElementId!, { w: parseInt(e.target.value) || 0 })}
                            />
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Height</Label>
                            <Input
                               type="number" className="h-11 rounded-xl font-black border-2"
                               value={activeElement.h}
                               onChange={(e) => updateElement(activeElementId!, { h: parseInt(e.target.value) || 0 })}
                            />
                         </div>
                      </div>

                      {activeElementId === 'image' && (
                        <div className="space-y-4">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Corner Roundness ({activeElement.cornerRoundness}px)</Label>
                           <Input
                              type="range" min="0" max="200" step="1"
                              className="accent-primary h-1.5"
                              value={activeElement.cornerRoundness}
                              onChange={(e) => updateElement(activeElementId!, { cornerRoundness: parseInt(e.target.value) })}
                           />
                        </div>
                      )}

                      {activeElement.type === 'logo' && (
                         <div className="space-y-4">
                            <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Opacity ({Math.round((activeElement.opacity || 1) * 100)}%)</Label>
                            <Input
                               type="range" min="0" max="1" step="0.05"
                               className="accent-primary h-1.5"
                               value={activeElement.opacity}
                               onChange={(e) => updateElement(activeElementId!, { opacity: parseFloat(e.target.value) })}
                            />
                         </div>
                      )}

                      <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between">
                           <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Border Settings</Label>
                           <input
                              type="checkbox"
                              checked={activeElement.border.enabled}
                              onChange={(e) => updateElement(activeElementId!, { border: { ...activeElement.border, enabled: e.target.checked } })}
                              className="accent-primary w-4 h-4"
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <ColorPicker
                              label="Border Color"
                              value={activeElement.border.color}
                              onChange={(val) => updateElement(activeElementId!, { border: { ...activeElement.border, color: val } })}
                           />
                           <div className="space-y-3">
                              <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Width</Label>
                              <Input
                                 type="number" className="h-11 rounded-xl border-2"
                                 value={activeElement.border.width}
                                 onChange={(e) => updateElement(activeElementId!, { border: { ...activeElement.border, width: parseInt(e.target.value) || 0 } })}
                              />
                           </div>
                        </div>
                      </div>
                   </div>
                )}

                {/* Common Settings: Joystick Position */}
                <Joystick
                  label={activeElementId}
                  id={activeElementId?.charAt(0).toUpperCase()}
                  x={activeElement.x}
                  y={activeElement.y}
                  onMove={(dx: number, dy: number) => updateElement(activeElementId!, { x: activeElement.x + dx, y: activeElement.y + dy })}
                  onChangeX={(val: number) => updateElement(activeElementId!, { x: val })}
                  onChangeY={(val: number) => updateElement(activeElementId!, { y: val })}
                />

                {/* Shadow Settings */}
                <div className="space-y-6 pt-6 border-t">
                   <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Shadow Settings</Label>
                      <input
                        type="checkbox"
                        checked={activeElement.shadow.enabled}
                        onChange={(e) => updateElement(activeElementId!, { shadow: { ...activeElement.shadow, enabled: e.target.checked } })}
                        className="accent-primary w-4 h-4"
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <ColorPicker
                        label="Shadow Color"
                        value={activeElement.shadow.color}
                        onChange={(val) => updateElement(activeElementId!, { shadow: { ...activeElement.shadow, color: val } })}
                      />
                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Blur ({activeElement.shadow.blur}px)</Label>
                         <Input
                            type="number" className="h-11 rounded-xl border-2"
                            value={activeElement.shadow.blur}
                            onChange={(e) => updateElement(activeElementId!, { shadow: { ...activeElement.shadow, blur: parseInt(e.target.value) || 0 } })}
                         />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Offset X</Label>
                         <Input
                            type="number" className="h-11 rounded-xl border-2"
                            value={activeElement.shadow.offsetX}
                            onChange={(e) => updateElement(activeElementId!, { shadow: { ...activeElement.shadow, offsetX: parseInt(e.target.value) || 0 } })}
                         />
                      </div>
                      <div className="space-y-3">
                         <Label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Offset Y</Label>
                         <Input
                            type="number" className="h-11 rounded-xl border-2"
                            value={activeElement.shadow.offsetY}
                            onChange={(e) => updateElement(activeElementId!, { shadow: { ...activeElement.shadow, offsetY: parseInt(e.target.value) || 0 } })}
                         />
                      </div>
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview (PC) / Top Sticky (Mobile) */}
        <div className="w-full h-fit lg:h-full lg:flex-1 bg-muted/10 p-4 md:p-10 flex flex-col items-center justify-center sticky top-20 lg:relative lg:top-0 order-1 lg:order-2 overflow-hidden lg:overflow-visible shadow-xl lg:shadow-none z-20">
           {/* Mobile Sticky Wrapper */}
           <div className="w-full flex flex-col items-center justify-center lg:h-full">
              <div className="w-full max-w-[600px] aspect-square bg-card rounded-[2rem] shadow-2xl overflow-hidden border relative group ring-1 ring-border">
                 {previewUrl ? (
                    <>
                      <img src={previewUrl} className="w-full h-full object-contain" alt="Preview" />
                      {/* Clickable Overlay Regions */}
                      <div className="absolute inset-0 z-10">
                        {/* Title Region */}
                        <div
                          className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === 'title' && "border-primary")}
                          style={{
                            left: '50%',
                            top: `${template.title.y / CANVAS_HEIGHT * 100}%`,
                            width: '90%',
                            height: '10%',
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={() => setActiveElementId('title')}
                        />
                        {/* Subtitle Above */}
                        <div
                          className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === 'subtitleAbove' && "border-primary")}
                          style={{
                            left: '50%',
                            top: `${(template.subtitleAbove?.y || 0) / CANVAS_HEIGHT * 100}%`,
                            width: '80%',
                            height: '5%',
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={() => setActiveElementId('subtitleAbove')}
                        />
                        {/* Subtitle Below */}
                        <div
                          className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === 'subtitleBelow' && "border-primary")}
                          style={{
                            left: '50%',
                            top: `${(template.subtitleBelow?.y || 0) / CANVAS_HEIGHT * 100}%`,
                            width: '80%',
                            height: '5%',
                            transform: 'translate(-50%, -50%)'
                          }}
                          onClick={() => setActiveElementId('subtitleBelow')}
                        />
                        {/* Date Region */}
                        <div
                          className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === 'date' && "border-primary")}
                          style={{
                            left: `${template.date.x / CANVAS_WIDTH * 100}%`,
                            top: `${template.date.y / CANVAS_HEIGHT * 100}%`,
                            width: '30%',
                            height: '5%',
                            transform: 'translate(0, -50%)'
                          }}
                          onClick={() => setActiveElementId('date')}
                        />
                        {/* Image Region */}
                        <div
                          className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === 'image' && "border-primary")}
                          style={{
                            left: `${template.image.x / CANVAS_WIDTH * 100}%`,
                            top: `${template.image.y / CANVAS_HEIGHT * 100}%`,
                            width: `${template.image.w / CANVAS_WIDTH * 100}%`,
                            height: `${template.image.h / CANVAS_HEIGHT * 100}%`
                          }}
                          onClick={() => setActiveElementId('image')}
                        />
                        {/* QR Region */}
                        {template.qr.enabled && (
                          <div
                            className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === 'qr' && "border-primary")}
                            style={{
                              left: `${template.qr.x / CANVAS_WIDTH * 100}%`,
                              top: `${template.qr.y / CANVAS_HEIGHT * 100}%`,
                              width: `${template.qr.w / CANVAS_WIDTH * 100}%`,
                              height: `${template.qr.h / CANVAS_HEIGHT * 100}%`
                            }}
                            onClick={() => setActiveElementId('qr')}
                          />
                        )}
                        {/* Logos */}
                        {template.logos.map(logo => (
                          <div
                            key={logo.id}
                            className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === logo.id && "border-primary")}
                            style={{
                              left: `${logo.x / CANVAS_WIDTH * 100}%`,
                              top: `${logo.y / CANVAS_HEIGHT * 100}%`,
                              width: `${logo.w / CANVAS_WIDTH * 100}%`,
                              height: `${logo.h / CANVAS_HEIGHT * 100}%`
                            }}
                            onClick={() => setActiveElementId(logo.id)}
                          />
                        ))}
                        {/* Extra Texts */}
                        {template.extraTexts.map(et => (
                          <div
                            key={et.id}
                            className={cn("absolute border-2 border-transparent hover:border-primary/50 cursor-pointer transition-all", activeElementId === et.id && "border-primary")}
                            style={{
                              left: `${et.x / CANVAS_WIDTH * 100}%`,
                              top: `${et.y / CANVAS_HEIGHT * 100}%`,
                              width: '40%',
                              height: '5%',
                              transform: 'translate(-50%, -50%)'
                            }}
                            onClick={() => setActiveElementId(et.id)}
                          />
                        ))}
                      </div>
                    </>
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground italic">Generating Preview...</div>
                 )}
                 <div className="absolute top-6 left-6 bg-primary/90 backdrop-blur-md text-white text-[10px] px-4 py-2 font-black rounded-full shadow-xl tracking-widest">LIVE PREVIEW</div>
              </div>

              <div className="mt-8 p-6 bg-card/50 backdrop-blur-md rounded-2xl border text-center max-w-[500px] hidden md:block">
                 <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Visual Editor</p>
                 <p className="text-xs text-muted-foreground leading-relaxed">Changes are saved automatically to your local storage. You can see the live preview update as you edit.</p>
              </div>
           </div>
        </div>
      </main>

      <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="hidden" />
    </div>
  );
};

export default EditTemplate;
