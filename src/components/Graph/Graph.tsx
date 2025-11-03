import { useEffect, useRef, useState } from 'react';
import { 
  Graph, 
  RubberBandHandler,
} from '@maxgraph/core';
import { Header } from './Header';
import { useControll } from './useControll';

export type Tools = 'wall' | 'door' | 'select';



// Главный компонент
export default function GraphApp() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tools>('select');
  const [snapEnabled, setSnapEnabled] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const graph = new Graph(containerRef.current);
    graphRef.current = graph;

    graph.setPanning(true);
    graph.setConnectable(true);
    graph.setCellsResizable(true);
    graph.setCellsMovable(true);

    graph.setGridEnabled(true);
    graph.setGridSize(2);

    new RubberBandHandler(graph);

    return () => {
      graph.destroy();
    };
  }, []);

  useControll({ graph: graphRef.current, tool: selectedTool, snapEnabled });

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      <Header
        selectTool={setSelectedTool}
        tool={selectedTool}
        graph={graphRef.current}
        snapEnabled={snapEnabled}
        setSnapEnabled={setSnapEnabled}
      />
      <div className="flex-1 p-4">
        <div
          ref={containerRef}
          className="w-full h-full bg-white rounded-lg shadow-lg border-2 border-gray-300"
          style={{ overflow: 'hidden' }}
        />
      </div>
    </div>
  );
}