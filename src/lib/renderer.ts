import { TypographySettings } from "./settings";
import { getSelectedAd } from "./db";
import { fetchImageWithProxy } from "./api";

export const CANVAS_WIDTH = 2048;
export const CANVAS_HEIGHT = 2048;
export const BOX = { x: 0, y: 0, w: 2048, h: 1216 };
const DATE_X = 1024;
const DATE_Y = 1163;
const TITLE_X = 1024;
const TITLE_Y = 1500;

const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const toBanglaDigit = (num: number | string): string => {
  return String(num).replace(/\d/g, (d) => BANGLA_DIGITS[Number(d)]);
};

export const formatBanglaDate = (dateInput: Date | string = new Date()): string => {
  let date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(date.getTime())) {
    if (typeof dateInput === 'string') return dateInput;
    date = new Date();
  }
  const day = toBanglaDigit(date.getDate());
  const month = BANGLA_MONTHS[date.getMonth()];
  const year = toBanglaDigit(date.getFullYear());
  return `${day} ${month} ${year}`;
};

export const generatePhotoCardInternal = async (
  canvas: HTMLCanvasElement,
  targetTitle: string,
  targetImageUrl: string,
  settings: TypographySettings,
  imageCache: Map<string, HTMLImageElement>,
  forceProxy: boolean = false,
  manualHighlights?: number[]
): Promise<{ dataUrl: string, appliedHighlights: number[] }> => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  let appliedHighlightsResult: number[] = [];
  const selectedTemplate = localStorage.getItem('bg_selected_template') || 'Template BG 2.jpg';

  const getCachedImage = async (src: string, isData = false): Promise<HTMLImageElement> => {
    if (imageCache.has(src)) return imageCache.get(src)!;
    const img = new Image();
    if (!isData) img.crossOrigin = "anonymous";
    img.src = src;
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });
    imageCache.set(src, img);
    return img;
  };

  let bgTemplateName = 'Template BG 2.jpg';
  let fgTemplateName = 'Template Fg.png';

  if (selectedTemplate !== 'PhotocardTemplate.png' && selectedTemplate !== 'Template BG 2.jpg' && selectedTemplate !== 'default') {
    bgTemplateName = selectedTemplate;
  }

  const bgTemplate = await getCachedImage(`/${bgTemplateName}`);
  const fgTemplate = await getCachedImage(`/${fgTemplateName}`);

  let adImg: HTMLImageElement | null = null;
  const selectedAdId = localStorage.getItem('bg_selected_ad');
  if (selectedAdId) {
    const adData = await getSelectedAd(selectedAdId);
    if (adData) {
      adImg = await getCachedImage(adData.data, true);
    }
  }

  const adHeight = adImg ? (CANVAS_WIDTH / adImg.width) * adImg.height : 0;
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT + adHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const userImgBlobUrl = (targetImageUrl.startsWith('blob:') || targetImageUrl.startsWith('data:')) ? targetImageUrl : await fetchImageWithProxy(targetImageUrl, forceProxy);
  const userImg = new Image();
  userImg.src = userImgBlobUrl;
  await new Promise(r => { userImg.onload = r; });

  const boxX = BOX.x + settings.imageXOffset;
  const boxY = BOX.y + settings.imageYOffset;
  const scale = BOX.h / userImg.height;
  const drawH = BOX.h;
  const drawW = userImg.width * scale;
  const drawX = boxX + (BOX.w - drawW) / 2;
  const drawY = boxY;

  let fgDrawn = false;

  const renderFg = () => {
    if (!fgDrawn) {
      ctx.drawImage(fgTemplate, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      fgDrawn = true;
    }
  };

  const renderLayers: Record<string, () => void> = {
    background: () => {
      ctx.drawImage(bgTemplate, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      if (adImg) ctx.drawImage(adImg, 0, CANVAS_HEIGHT, CANVAS_WIDTH, adHeight);
    },
    news_image: () => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(boxX, boxY, BOX.w, BOX.h);
      ctx.clip();
      ctx.drawImage(userImg, drawX, drawY, drawW, drawH);
      ctx.restore();
    },
    foreground: () => {
      renderFg();
    },
    date_time: () => {
      renderFg();
      ctx.font = `600 ${settings.dateFontSize}px "Hind Siliguri"`;
      ctx.fillStyle = '#111111';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(formatBanglaDate(new Date()), DATE_X + settings.dateXOffset, DATE_Y + settings.dateYOffset);
    },
    title_text: () => {
      renderFg();
      const highlightColor = localStorage.getItem('bg_highlight_color') || '#FFFF00';
      let curFS = settings.fontSize;
      ctx.textAlign = 'center';
      if ('letterSpacing' in ctx) {
        ctx.letterSpacing = `${settings.titleLetterSpacing}px`;
      }
      const allWords = targetTitle.split(' ');
      let lines: { text: string; wordIndices: number[] }[] = [];
      const MAX_TITLE_WIDTH = 1700;

      for (let i = 0; i < 10; i++) {
        ctx.font = `bold ${curFS}px "Hind Siliguri"`;
        lines = [];
        let currentLineText = '';
        let currentLineIndices: number[] = [];

        for (let j = 0; j < allWords.length; j++) {
          const word = allWords[j];
          const testLine = currentLineText ? currentLineText + ' ' + word : word;
          if (ctx.measureText(testLine).width > MAX_TITLE_WIDTH && currentLineText !== '') {
            lines.push({ text: currentLineText, wordIndices: currentLineIndices });
            currentLineText = word;
            currentLineIndices = [j];
          } else {
            currentLineText = testLine;
            currentLineIndices.push(j);
          }
        }
        lines.push({ text: currentLineText, wordIndices: currentLineIndices });

        if (lines.length <= 3 && Math.max(...lines.map(l => ctx.measureText(l.text).width)) <= MAX_TITLE_WIDTH) break;
        curFS *= 0.9;
      }

      const lh = curFS * settings.lineHeightFactor;
      let appliedHighlights = manualHighlights;
      const autoHighlightEnabled = localStorage.getItem('bg_auto_highlight_two_lines') !== 'false';

      if (!appliedHighlights && lines.length === 2 && autoHighlightEnabled) {
        appliedHighlights = lines[0].wordIndices;
      }
      if (!appliedHighlights) appliedHighlights = [];
      appliedHighlightsResult = appliedHighlights;

      lines.forEach((line, i) => {
        const totalWidth = ctx.measureText(line.text).width;
        let currentX = TITLE_X + settings.titleXOffset - totalWidth / 2;
        const y = TITLE_Y + settings.titleYOffset - ((lines.length - 1) * lh / 2) + (i * lh);

        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        line.wordIndices.forEach((wordIdx, idxInLine) => {
          const word = allWords[wordIdx];
          ctx.fillStyle = appliedHighlights!.includes(wordIdx) ? highlightColor : '#FFFFFF';
          ctx.fillText(word, currentX, y);
          currentX += ctx.measureText(word).width;
          if (idxInLine < line.wordIndices.length - 1) {
            currentX += ctx.measureText(' ').width;
          }
        });
      });
    }
  };

  settings.layerOrder.forEach(layer => {
    if (renderLayers[layer]) renderLayers[layer]();
  });

  if (userImgBlobUrl.startsWith('blob:') && userImgBlobUrl !== targetImageUrl) URL.revokeObjectURL(userImgBlobUrl);
  return { dataUrl: canvas.toDataURL('image/png'), appliedHighlights: appliedHighlightsResult };
};
