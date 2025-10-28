// Utility functions for handling Tiptap JSON descriptions

/**
 * Check if content is already HTML string
 * @param content - Content to check
 * @returns boolean indicating if content is HTML
 */
const isHtmlString = (content: string | object): boolean => {
  if (typeof content !== 'string') return false;
  return content.includes('<') && content.includes('>');
};

/**
 * Convert Tiptap JSON to HTML for display
 * @param jsonContent - JSON content from database
 * @returns HTML string for display
 */
export const jsonToHtml = (jsonContent: string | object): string => {
  try {
    // If it's already HTML, return as is
    if (isHtmlString(jsonContent)) {
      return jsonContent as string;
    }

    const content = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    
    if (!content || !content.content) {
      return '';
    }

    // Simple recursive function to convert JSON to HTML
    const convertToHtml = (node: any): string => {
      if (!node) return '';

      switch (node.type) {
        case 'doc':
          return node.content ? node.content.map(convertToHtml).join('') : '';
        
        case 'paragraph':
          const pContent = node.content ? node.content.map(convertToHtml).join('') : '';
          return `<p>${pContent}</p>`;
        
        case 'heading':
          const level = node.attrs?.level || 1;
          const hContent = node.content ? node.content.map(convertToHtml).join('') : '';
          return `<h${level}>${hContent}</h${level}>`;
        
        case 'bulletList':
          const ulContent = node.content ? node.content.map(convertToHtml).join('') : '';
          return `<ul>${ulContent}</ul>`;
        
        case 'orderedList':
          const olContent = node.content ? node.content.map(convertToHtml).join('') : '';
          return `<ol>${olContent}</ol>`;
        
        case 'listItem':
          const liContent = node.content ? node.content.map(convertToHtml).join('') : '';
          return `<li>${liContent}</li>`;
        
        case 'blockquote':
          const blockContent = node.content ? node.content.map(convertToHtml).join('') : '';
          return `<blockquote>${blockContent}</blockquote>`;
        
        case 'codeBlock':
          const codeContent = node.content ? node.content.map(convertToHtml).join('') : '';
          return `<pre><code>${codeContent}</code></pre>`;
        
        case 'text':
          let text = node.text || '';
          
          // Apply marks (formatting)
          if (node.marks) {
            node.marks.forEach((mark: any) => {
              switch (mark.type) {
                case 'bold':
                  text = `<strong>${text}</strong>`;
                  break;
                case 'italic':
                  text = `<em>${text}</em>`;
                  break;
                case 'strike':
                  text = `<s>${text}</s>`;
                  break;
                case 'code':
                  text = `<code>${text}</code>`;
                  break;
              }
            });
          }
          
          return text;
        
        default:
          return node.content ? node.content.map(convertToHtml).join('') : '';
      }
    };

    return convertToHtml(content);
  } catch (error) {
    console.error('Error converting JSON to HTML:', error);
    return '';
  }
};

/**
 * Extract plain text from Tiptap JSON or HTML
 * @param jsonContent - JSON content from database
 * @returns Plain text string
 */
export const jsonToText = (jsonContent: string | object): string => {
  try {
    // If it's HTML, extract text from HTML
    if (isHtmlString(jsonContent)) {
      // Create a temporary DOM element to extract text
      if (typeof window !== 'undefined') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = jsonContent as string;
        return tempDiv.textContent || tempDiv.innerText || '';
      } else {
        // Server-side: simple regex to remove HTML tags
        return (jsonContent as string).replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ');
      }
    }

    const content = typeof jsonContent === 'string' ? JSON.parse(jsonContent) : jsonContent;
    
    if (!content || !content.content) {
      return '';
    }

    const extractText = (node: any): string => {
      if (node.type === 'text') {
        return node.text || '';
      }
      
      if (node.content && Array.isArray(node.content)) {
        return node.content.map(extractText).join('');
      }
      
      return '';
    };

    return extractText(content);
  } catch (error) {
    console.error('Error extracting text from JSON:', error);
    return '';
  }
};

/**
 * Get a preview of the description (first 100 characters)
 * @param jsonContent - JSON content from database
 * @param maxLength - Maximum length of preview
 * @returns Preview string
 */
export const getDescriptionPreview = (jsonContent: string | object, maxLength: number = 100): string => {
  const text = jsonToText(jsonContent);
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Test function to verify HTML content handling
 * @param htmlContent - HTML string to test
 * @returns Object with test results
 */
export const testHtmlContent = (htmlContent: string) => {
  return {
    isHtml: isHtmlString(htmlContent),
    htmlOutput: jsonToHtml(htmlContent),
    textOutput: jsonToText(htmlContent),
    preview: getDescriptionPreview(htmlContent, 50)
  };
};
