"use client";

import React from 'react';
import { jsonToHtml, jsonToText, getDescriptionPreview } from '@/lib/description-utils';

interface DescriptionDisplayProps {
  content: string | object;
  variant?: 'html' | 'text' | 'preview';
  className?: string;
}

/**
 * Component to display Tiptap JSON descriptions
 * Usage: <DescriptionDisplay content={product.description} />
 */
export default function DescriptionDisplay({ 
  content, 
  variant = 'html',
  className = "" 
}: DescriptionDisplayProps) {
  
  if (!content) {
    return <div className={`text-gray-500 italic ${className}`}>No description available</div>;
  }

  if (variant === 'text') {
    return (
      <div className={className}>
        {jsonToText(content)}
      </div>
    );
  }

  if (variant === 'preview') {
    return (
      <div className={`text-sm text-gray-600 ${className}`}>
        {getDescriptionPreview(content, 150)}
      </div>
    );
  }

  // Default: HTML variant
  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ 
        __html: jsonToHtml(content) 
      }}
    />
  );
}
