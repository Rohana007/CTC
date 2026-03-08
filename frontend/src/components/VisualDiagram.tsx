import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { Eye } from 'lucide-react';
import { VisualDiagram as VisualDiagramType } from '../../../shared/types';

interface VisualDiagramProps {
  diagram: VisualDiagramType;
}

export const VisualDiagram: React.FC<VisualDiagramProps> = ({ diagram }) => {
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diagramRef.current && diagram.mermaidCode) {
      // Initialize mermaid
      mermaid.initialize({
        startOnLoad: true,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        }
      });

      // Clear previous content
      diagramRef.current.innerHTML = '';

      // Generate unique ID for this diagram
      const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Clean the mermaid code
      const cleanMermaidCode = diagram.mermaidCode.trim();

      // Render the diagram
      mermaid.render(diagramId, cleanMermaidCode)
        .then(({ svg }) => {
          if (diagramRef.current) {
            diagramRef.current.innerHTML = svg;
          }
        })
        .catch((error) => {
          console.error('Mermaid rendering error:', error);
          console.error('Mermaid code:', cleanMermaidCode);
          if (diagramRef.current) {
            diagramRef.current.innerHTML = `
              <div class="text-center text-gray-500 py-8">
                <p>Unable to render diagram</p>
                <p class="text-sm mt-2">Diagram type: ${diagram.type}</p>
                <details class="mt-4 text-left">
                  <summary class="cursor-pointer text-blue-600">Show diagram code</summary>
                  <pre class="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">${cleanMermaidCode}</pre>
                </details>
              </div>
            `;
          }
        });
    }
  }, [diagram]);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <Eye className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Visual Representation</h3>
          <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full capitalize">
            {diagram.type}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {diagram.description}
          </p>
        </div>

        {/* Diagram */}
        <div className="flex justify-center">
          <div 
            ref={diagramRef}
            className="mermaid w-full max-w-4xl"
            style={{ minHeight: '200px' }}
          />
        </div>

        {/* Fallback for unsupported diagrams */}
        {!diagram.mermaidCode && (
          <div className="text-center text-gray-500 py-8">
            <Eye className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Visual diagram not available for this concept</p>
            <p className="text-sm mt-2">Try a different topic or check back later</p>
          </div>
        )}
      </div>
    </div>
  );
};