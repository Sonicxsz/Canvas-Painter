import type { Graph } from "@maxgraph/core";
import type { Tools } from "./Graph";

// Компонент Header
export function Header(props: {
  graph: Graph | null;
  selectTool: (val: Tools) => void;
  tool: string;
  snapEnabled: boolean;
  setSnapEnabled: (val: boolean) => void;
}) {
  const { graph, selectTool, tool, snapEnabled, setSnapEnabled } = props;

  const clearCanvas = () => {
    if (!graph) return;
    graph.removeCells(graph.getChildVertices(graph.getDefaultParent()));
  };

  const exportAsJSON = () => {
    if (!graph) return;
    const cells = graph.getChildVertices(graph.getDefaultParent());
    const data = cells.map((cell) => ({
      id: cell.id,
      label: cell.value,
      x: cell.geometry?.x,
      y: cell.geometry?.y,
      width: cell.geometry?.width,
      height: cell.geometry?.height,
      style: cell.style,
    }));
    console.log('Схема этажа:', JSON.stringify(data, null, 2));
    alert('Данные выведены в консоль! Откройте DevTools (F12)');
  };

  const changeColor = (color: string) => {
    if (!graph) return;
    const cells = graph.getSelectionCells();
    
    if (cells.length === 0) {
      alert('Выберите объекты для изменения цвета!');
      return;
    }

    graph.getDataModel().beginUpdate();
    try {
      graph.setCellStyles('fillColor', color, cells);
    } finally {
      graph.getDataModel().endUpdate();
    }
  };

  const changeStrokeWidth = (width: number) => {
    if (!graph) return;
    const cells = graph.getSelectionCells();
    
    if (cells.length === 0) {
      alert('Выберите объекты для изменения обводки!');
      return;
    }

    graph.getDataModel().beginUpdate();
    try {
      graph.setCellStyles('strokeWidth', width, cells);
    } finally {
      graph.getDataModel().endUpdate();
    }
  };

  const changeStrokeColor = (color: string) => {
    if (!graph) return;
    const cells = graph.getSelectionCells();
    
    if (cells.length === 0) {
      alert('Выберите объекты!');
      return;
    }

    graph.getDataModel().beginUpdate();
    try {
      graph.setCellStyles('strokeColor', color, cells);
    } finally {
      graph.getDataModel().endUpdate();
    }
  };

  return (
    <div className="bg-white shadow-md p-4">
      <div className="flex items-center gap-4 flex-wrap mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Редактор схем этажей
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => selectTool('select')}
            className={`px-4 py-2 rounded ${
              tool === 'select'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            ✋ Выбор
          </button>
          <button
            onClick={() => selectTool('wall')}
            className={`px-4 py-2 rounded ${
              tool === 'wall'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            🧱 Стена
          </button>
          <button
            onClick={() => selectTool('door')}
            className={`px-4 py-2 rounded ${
              tool === 'door'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            🚪 Дверь
          </button>
        </div>

        {/* НОВОЕ: Переключатель прилипания */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={snapEnabled}
            onChange={(e) => setSnapEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-700">
            🧲 Прилипание дверей к стенам
          </span>
        </label>

        <div className="flex gap-2 ml-auto">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            🗑️ Очистить
          </button>
          <button
            onClick={exportAsJSON}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            💾 Экспорт
          </button>
        </div>
      </div>

      {/* Панель стилей */}
      <div className="flex items-center gap-4 flex-wrap p-3 bg-gray-50 rounded border border-gray-200">
        <span className="font-semibold text-gray-700">Стили выбранных:</span>
        
        {/* Цвет заливки */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Заливка:</label>
          <button
            onClick={() => changeColor('#FF6B6B')}
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: '#FF6B6B' }}
            title="Красный"
          />
          <button
            onClick={() => changeColor('#4ECDC4')}
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: '#4ECDC4' }}
            title="Голубой"
          />
          <button
            onClick={() => changeColor('#95E1D3')}
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: '#95E1D3' }}
            title="Мятный"
          />
          <button
            onClick={() => changeColor('#FFD93D')}
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: '#FFD93D' }}
            title="Желтый"
          />
        </div>

        {/* Цвет обводки */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Обводка:</label>
          <button
            onClick={() => changeStrokeColor('#000000')}
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: '#000000' }}
            title="Черный"
          />
          <button
            onClick={() => changeStrokeColor('#FF0000')}
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: '#FF0000' }}
            title="Красный"
          />
          <button
            onClick={() => changeStrokeColor('#0000FF')}
            className="w-8 h-8 rounded border-2 border-gray-300"
            style={{ backgroundColor: '#0000FF' }}
            title="Синий"
          />
        </div>

        {/* Ширина обводки */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Толщина:</label>
          <button
            onClick={() => changeStrokeWidth(1)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            1px
          </button>
          <button
            onClick={() => changeStrokeWidth(3)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            3px
          </button>
          <button
            onClick={() => changeStrokeWidth(5)}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            5px
          </button>
        </div>
      </div>
    </div>
  );
}