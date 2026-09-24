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
  const template = localStorage.getItem('bg_selected_template') || 'PhotocardTemplate.png';
  const suffix = template === 'PhotocardTemplate.png' ? '' : `_${template}`;

  const getVal = (key: string, def: any) => {
    const saved = localStorage.getItem(`bg_${key}${suffix}`);
    return saved !== null ? saved : (localStorage.getItem(`bg_${key}`) || def);
  };

  const getDVal = (key: string, def: number | string) => {
    const saved = localStorage.getItem(`bg_${key}${suffix}`);
    if (saved !== null) return saved;
    return localStorage.getItem(`bg_${key}`) || def;
  };

  const defaultLayerOrder = 'background,news_image,date_time,title_text';
  const savedLayerOrder = getVal('layer_order', defaultLayerOrder);

  return {
    fontSize: Number(getDVal('font_size', 70)),
    titleLetterSpacing: Number(getDVal('letter_spacing', -2.4)),
    lineHeightFactor: Number(getDVal('line_height', 0.9)),
    dateFontSize: Number(getDVal('date_font_size', 20)),
    dateXOffset: Number(getDVal('date_x_offset', -40)),
    dateYOffset: Number(getDVal('date_y_offset', -30)),
    imageXOffset: Number(getDVal('image_x_offset', 0)),
    imageYOffset: Number(getDVal('image_y_offset', 0)),
    titleXOffset: Number(getDVal('title_x_offset', 0)),
    titleYOffset: Number(getDVal('title_y_offset', 0)),
    layerOrder: String(savedLayerOrder).split(',')
  };
};
