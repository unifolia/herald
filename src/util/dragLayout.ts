export type LayoutRect = Pick<
  DOMRect,
  "top" | "right" | "bottom" | "left" | "width" | "height"
>;

export interface DragSlot {
  rect: LayoutRect;
  orderIndex: number;
}

export interface DragLayout {
  slots: DragSlot[];
  singleColumn: boolean;
  dragOrderIndex: number;
}

export const EDGE_SWAP_PROGRESS = 2 / 3;

export const rectsShareRow = (a: LayoutRect, b: LayoutRect) =>
  a.top < b.bottom - 1 && b.top < a.bottom - 1;

export const isSingleColumn = (orderedRects: LayoutRect[]) => {
  for (let i = 1; i < orderedRects.length; i++) {
    if (rectsShareRow(orderedRects[i], orderedRects[i - 1])) return false;
  }
  return true;
};

export const buildDragLayout = (
  currentOrder: number[],
  rectById: Map<number, LayoutRect>,
  dragId: number,
): DragLayout => {
  const slots: DragSlot[] = [];
  const orderedRects: LayoutRect[] = [];

  currentOrder.forEach((id, orderIndex) => {
    const rect = rectById.get(id);
    if (!rect) return;

    orderedRects.push(rect);
    if (id !== dragId) slots.push({ rect, orderIndex });
  });

  return {
    slots,
    singleColumn: isSingleColumn(orderedRects),
    dragOrderIndex: currentOrder.indexOf(dragId),
  };
};

export const computeTargetIndex = (
  layout: DragLayout,
  pointerY: number,
  dragRect: LayoutRect,
): number => {
  const { slots, singleColumn, dragOrderIndex } = layout;

  for (let i = 0; i < slots.length; i++) {
    const { rect, orderIndex } = slots[i];

    if (singleColumn) {
      if (orderIndex < dragOrderIndex) {
        const threshold = rect.bottom - rect.height * EDGE_SWAP_PROGRESS;
        if (dragRect.top < threshold) return i;
      } else {
        const threshold = rect.top + rect.height * EDGE_SWAP_PROGRESS;
        if (dragRect.bottom < threshold) return i;
      }
    } else {
      if (pointerY < rect.top) return i;
      if (pointerY < rect.bottom) {
        if (orderIndex < dragOrderIndex) {
          const threshold = rect.right - rect.width * EDGE_SWAP_PROGRESS;
          if (dragRect.left < threshold) return i;
        } else {
          const threshold = rect.left + rect.width * EDGE_SWAP_PROGRESS;
          if (dragRect.right < threshold) return i;
        }
      }
    }
  }

  return slots.length;
};
