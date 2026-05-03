import React from "react";

/**
 * Detects the language of a word and returns the appropriate font class.
 */
export const getFontClass = (text: string): string => {
  // Arabic range: \u0600-\u06FF
  if (/[\u0600-\u06FF]/.test(text)) {
    return "font-arabic";
  }
  // Bangla range: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(text)) {
    return "font-bangla";
  }
  // Default to English/Serif for Latin and others
  return "font-serif";
};

/**
 * Processes a node (string or React element) to apply multi-language fonts to text.
 */
export const wrapText = (node: React.ReactNode): React.ReactNode => {
  if (typeof node === "string") {
    const segments = node.split(/(\s+)/);
    return segments.map((segment, index) => {
      if (!segment.trim()) {
        return <span key={index}>{segment}</span>;
      }
      const fontClass = getFontClass(segment);
      return (
        <span key={index} className={fontClass}>
          {segment}
        </span>
      );
    });
  }
  if (React.isValidElement(node) && node.props.children) {
    return React.cloneElement(node, {
      ...node.props,
      children: React.Children.map(node.props.children, wrapText),
    } as any);
  }
  return node;
};

/**
 * Splits text into segments based on language and wraps them in spans with appropriate fonts.
 */
export const MultiLanguageText: React.FC<{ text: string }> = ({ text }) => {
  return <>{wrapText(text)}</>;
};
