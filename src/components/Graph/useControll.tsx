import { useEffect } from 'react';
import { 
  Graph, 
  InternalEvent,
  Point,
  type CellStyle,
  Cell,
  Geometry
} from '@maxgraph/core';

// Интерфейс для связи двери со стеной
interface DoorWallConnection {
  doorId: string;
  wallId: string;
  side: 'top' | 'bottom' | 'left' | 'right';
  offset: number; // Смещение вдоль стороны стены (0-1)
  length: number; // Длина двери относительно стороны стены (0-1)
}

// Глобальное хранилище связей (в реальном приложении лучше использовать React Context или state management)
const doorWallConnections: Map<string, DoorWallConnection> = new Map();

// Вспомогательная функция для определения расстояния от точки до прямоугольника
function distanceToRect(px: number, py: number, rx: number, ry: number, rw: number, rh: number) {
  const closestX = Math.max(rx, Math.min(px, rx + rw));
  const closestY = Math.max(ry, Math.min(py, ry + rh));
  const dx = px - closestX;
  const dy = py - closestY;
  return Math.sqrt(dx * dx + dy * dy);
}

// Функция для нахождения ближайшей стены
function findNearestWall(graph: Graph, point: Point, maxDistance: number = 50):Cell | null {
  const cells = graph.getChildVertices(graph.getDefaultParent());
  let nearestWall: Cell | null = null;
  let minDistance = maxDistance;

  cells.forEach(cell => {
    if (cell.value !== 'Стена') return;

    const geo = cell.geometry;
    if (!geo) return;

    const distance = distanceToRect(point.x, point.y, geo.x, geo.y, geo.width, geo.height);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestWall = cell;
    }
  });

  return nearestWall;
}

// Определение стороны стены и создание связи
function snapDoorToWall(
  door: { x: number; y: number; width: number; height: number }, 
  wallGeo: Geometry,
  doorCell: Cell,
  wallCell: Cell
) {
  const doorCenterX = door.x + door.width / 2;
  const doorCenterY = door.y + door.height / 2;

  // Расстояния до каждой стороны стены
  const distTop = Math.abs(doorCenterY - wallGeo.y);
  const distBottom = Math.abs(doorCenterY - (wallGeo.y + wallGeo.height));
  const distLeft = Math.abs(doorCenterX - wallGeo.x);
  const distRight = Math.abs(doorCenterX - (wallGeo.x + wallGeo.width));

  const minDist = Math.min(distTop, distBottom, distLeft, distRight);

  const doorThickness = 10;
  let side: 'top' | 'bottom' | 'left' | 'right';
  let newDoor: { x: number; y: number; width: number; height: number };
  let offset: number;
  let length: number;

  if (minDist === distTop) {
    side = 'top';
    const doorX = Math.max(wallGeo.x, Math.min(wallGeo.x + wallGeo.width - door.width, door.x));
    offset = (doorX - wallGeo.x) / wallGeo.width;
    length = Math.min(door.width, wallGeo.width) / wallGeo.width;
    newDoor = {
      x: doorX,
      y: wallGeo.y,
      width: Math.min(door.width, wallGeo.width),
      height: Math.max(Math.min(door.height, wallGeo.height), wallGeo.height)
    };
  } else if (minDist === distBottom) {
    side = 'bottom';
    const doorX = Math.max(wallGeo.x, Math.min(wallGeo.x + wallGeo.width - door.width, door.x));
    offset = (doorX - wallGeo.x) / wallGeo.width;
    length = Math.min(door.width, wallGeo.width) / wallGeo.width;
    newDoor = {
      x: doorX,
      y: wallGeo.y,
      width: Math.min(door.width, wallGeo.width),
      height: Math.max(door.height, wallGeo.height)
    };
  } else if (minDist === distLeft) {
    side = 'left';
    const doorY = Math.max(wallGeo.y, Math.min(wallGeo.y + wallGeo.height - door.height, door.y));
    offset = (doorY - wallGeo.y) / wallGeo.height;
    length = Math.min(door.height, wallGeo.height) / wallGeo.height;
    newDoor = {
      x: wallGeo.x - doorThickness / 2,
      y: doorY,
      width: doorThickness,
      height: Math.min(door.height, wallGeo.height)
    };
  } else {
    side = 'right';
    const doorY = Math.max(wallGeo.y, Math.min(wallGeo.y + wallGeo.height - door.height, door.y));
    offset = (doorY - wallGeo.y) / wallGeo.height;
    length = Math.min(door.height, wallGeo.height) / wallGeo.height;
    newDoor = {
      x: wallGeo.x + wallGeo.width - doorThickness / 2,
      y: doorY,
      width: doorThickness,
      height: Math.min(door.height, wallGeo.height)
    };
  }

  // Сохраняем связь
  doorWallConnections.set(doorCell.id!, {
    doorId: doorCell.id!,
    wallId: wallCell.id!,
    side,
    offset,
    length
  });

  return newDoor;
}

// Обновление позиции двери на основе связи со стеной
function updateDoorPosition(graph: Graph, doorCell: Cell, wallCell: Cell) {
  const connection = doorWallConnections.get(doorCell.id!);
  if (!connection) return;

  const wallGeo = wallCell.geometry;
  if (!wallGeo) return;

  const doorThickness = 10;
  let newGeo: { x: number; y: number; width: number; height: number };

  switch (connection.side) {
    case 'top':
      newGeo = {
        x: wallGeo.x + wallGeo.width * connection.offset,
        y: wallGeo.y - doorThickness / 2,
        width: wallGeo.width * connection.length,
        height: doorThickness
      };
      break;
    case 'bottom':
      newGeo = {
        x: wallGeo.x + wallGeo.width * connection.offset,
        y: wallGeo.y + wallGeo.height - doorThickness / 2,
        width: wallGeo.width * connection.length,
        height: doorThickness
      };
      break;
    case 'left':
      newGeo = {
        x: wallGeo.x - doorThickness / 2,
        y: wallGeo.y + wallGeo.height * connection.offset,
        width: doorThickness,
        height: wallGeo.height * connection.length
      };
      break;
    case 'right':
      newGeo = {
        x: wallGeo.x + wallGeo.width - doorThickness / 2,
        y: wallGeo.y + wallGeo.height * connection.offset,
        width: doorThickness,
        height: wallGeo.height * connection.length
      };
      break;
  }

  const geo = doorCell.geometry?.clone();
  if (geo) {
    geo.x = newGeo.x;
    geo.y = newGeo.y;
    geo.width = newGeo.width;
    geo.height = newGeo.height;
    graph.getDataModel().setGeometry(doorCell, geo);
  }
}

// Хук для отслеживания перемещения стен
function useWallMovementTracking(graph: Graph | null) {
  useEffect(() => {
    if (!graph) return;

    const handleCellsMoved = (sender: any, evt: any) => {
      const cells = evt.getProperty('cells') as Cell[];
      
      // Проверяем, есть ли среди перемещенных ячеек стены
      const movedWalls = cells.filter(cell => cell.value === 'Стена');
      
      if (movedWalls.length === 0) return;

      // Для каждой перемещенной стены обновляем связанные двери
      movedWalls.forEach(wall => {
        // Ищем все двери, связанные с этой стеной
        const connectedDoors: Cell[] = [];
        doorWallConnections.forEach(connection => {
          if (connection.wallId === wall.id) {
            const doorCell = graph.getDataModel().getCell(connection.doorId);
            if (doorCell) {
              connectedDoors.push(doorCell);
            }
          }
        });

        // Обновляем позиции всех связанных дверей
        graph.getDataModel().beginUpdate();
        try {
          connectedDoors.forEach(door => {
            updateDoorPosition(graph, door, wall);
          });
        } finally {
          graph.getDataModel().endUpdate();
        }
      });
    };

    // Слушаем событие перемещения ячеек
    graph.addListener(InternalEvent.CELLS_MOVED, handleCellsMoved);

    return () => {
      graph.removeListener(handleCellsMoved);
    };
  }, [graph]);
}

// Хук для управления инструментами
export function useControll(props: { graph: Graph | null; tool: string; snapEnabled: boolean }) {
  const { graph, tool, snapEnabled } = props;
    useWallMovementTracking(graph)
  useEffect(() => {
    if (!graph) return;

    let startPoint: Point | null = null;
    let previewCell: any = null;

    const handleMouseDown = (_: any, evt: any) => {
      if (tool === 'select' || !graph) return;

      const me = evt.getProperty('event')['evt'];
      const pt = graph.getPointForEvent(me);
      const cell = graph.getCellAt(pt.x, pt.y);

      if (cell && (cell.isVertex() || cell.isEdge())) {
        return;
      }

      startPoint = new Point(pt.x, pt.y);
    };

    const handleMouseMove = (_: any, evt: any) => {
      if (tool === 'select' || !startPoint || !graph) return;

      const me = evt.getProperty('event')['evt'];
      const currentPoint = graph.getPointForEvent(me);
      const sides = normilizeSides(startPoint, currentPoint);

      const parent = graph.getDefaultParent();
      graph.getDataModel().beginUpdate();

      try {
        if (previewCell) {
          graph.removeCells([previewCell], false);
        }

        if (sides.width > 5 || sides.height > 5) {
          previewCell = graph.insertVertex({
            parent,
            value: '',
            position: [sides.x, sides.y],
            size: [sides.width, sides.height],
          });
        }
      } finally {
        graph.getDataModel().endUpdate();
      }
    };

    const handleMouseUp = (_: any, evt: any) => {
      if (tool === 'select' || !startPoint || !graph) return;

      const me = evt.getProperty('event')['evt'];

      graph.getDataModel().beginUpdate();
      try {
        if (previewCell) {
          graph.removeCells([previewCell], false);
          previewCell = null;
        }

        const currentPoint = graph.getPointForEvent(me);
        let normalized = normilizeSides(startPoint, currentPoint);

        if (normalized.width < 20 && normalized.height < 20) {
          startPoint = null;
          return;
        }

        const label = tool === 'wall' ? 'Стена' : 'Дверь';
        const style = tool === 'wall' ? 'wall' : 'door';

        // Создаем ячейку
        const cell = graph.insertVertex({
          parent: graph.getDefaultParent(),
          value: label,
          position: [normalized.x, normalized.y],
          size: [normalized.width, normalized.height],
          style: getCellStyle(style),
        });

        // Если это дверь и включено прилипание, создаем связь со стеной
        if (tool === 'door' && snapEnabled) {
          const doorCenter = new Point(
            normalized.x + normalized.width / 2,
            normalized.y + normalized.height / 2
          );
          const nearestWall = findNearestWall(graph, doorCenter, 100);

          if (nearestWall && nearestWall.geometry && cell) {
            // Прилепляем дверь к стене и создаем связь
            const snapped = snapDoorToWall(normalized, nearestWall.geometry, cell, nearestWall);
            
            // Обновляем геометрию двери
            const geo = cell.geometry?.clone();
            
            if (geo) {
              geo.x = snapped.x;
              geo.y = snapped.y;
              geo.width = snapped.width;
              geo.height = snapped.height;
              graph.getDataModel().setGeometry(cell, geo);
            }
          }
        }
      } finally {
        graph.getDataModel().endUpdate();
      }

      startPoint = null;
    };

    const listener = (sender: any, evt: any) => {
      const eventName = evt.getProperty('eventName');
      if (eventName === 'mouseDown') {
        handleMouseDown(sender, evt);
      } else if (eventName === 'mouseMove') {
        handleMouseMove(sender, evt);
      } else if (eventName === 'mouseUp') {
        handleMouseUp(sender, evt);
      }
    };

    graph.addListener(InternalEvent.FIRE_MOUSE_EVENT, listener);

    return () => {
      graph.removeListener(listener);
    };
  }, [graph, tool, snapEnabled]);
}

// Стили
const wallStyle: CellStyle = {
  fillColor: '#9E9E9E',
  strokeColor: '#424242',
  strokeWidth: 3,
  shape: 'rectangle',
  fontColor: '#ffffff',
  fontSize: 12,
};

const doorStyle: CellStyle = {
  fillColor: '#8B4513',
  strokeColor: '#654321',
  strokeWidth: 2,
  shape: 'rectangle',
  fontColor: '#ffffff',
  fontSize: 10,
};

function getCellStyle(type: 'wall' | 'door'): CellStyle {
  return type === 'door' ? doorStyle : wallStyle;
}

function normilizeSides(startPoint: Point, currentPoint: Point) {
  const x = Math.min(startPoint.x, currentPoint.x);
  const y = Math.min(startPoint.y, currentPoint.y);
  const width = Math.abs(currentPoint.x - startPoint.x);
  const height = Math.abs(currentPoint.y - startPoint.y);
  return { x, y, width, height };
}