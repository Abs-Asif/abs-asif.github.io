export interface TypographySettings {
  fontSize: number;
  dateXOffset: number;
  dateYOffset: number;
  dateFontSize: number;
  titleLetterSpacing: number;
  lineHeightFactor: number;
  imageXOffset: number;
  imageYOffset: number;
  titleXOffset: number;
  titleYOffset: number;
  layerOrder: string[];
}

export const loadTypographySettings = (): TypographySettings => {
  const template = localStorage.getItem('bg_selected_template') || 'Template BG 2.jpg';
  const suffix = (template === 'Template BG 2.jpg' || template === 'PhotocardTemplate.png') ? '' : `_${template}`;

  const getVal = (key: string, def: any) => {
    const saved = localStorage.getItem(`bg_${key}${suffix}`);
    return saved !== null ? saved : (localStorage.getItem(`bg_${key}`) || def);
  };

  const getDVal = (key: string, def: number | string) => {
    const saved = localStorage.getItem(`bg_${key}${suffix}`);
    if (saved !== null) return saved;
    return localStorage.getItem(`bg_${key}`) || def;
  };

  const defaultLayerOrder = 'background,news_image,foreground,date_time,title_text';
  const savedLayerOrder = getVal('layer_order', defaultLayerOrder);

  return {
    fontSize: Number(getDVal('font_size', 110)),
    titleLetterSpacing: Number(getDVal('letter_spacing', 0)),
    lineHeightFactor: Number(getDVal('line_height', 1.25)),
    dateFontSize: Number(getDVal('date_font_size', 41)),
    dateXOffset: Number(getDVal('date_x_offset', 0)),
    dateYOffset: Number(getDVal('date_y_offset', 0)),
    imageXOffset: Number(getDVal('image_x_offset', 0)),
    imageYOffset: Number(getDVal('image_y_offset', 0)),
    titleXOffset: Number(getDVal('title_x_offset', 0)),
    titleYOffset: Number(getDVal('title_y_offset', 0)),
    layerOrder: String(savedLayerOrder).split(',')
  };
};
