// Genuinely the most complex part of this app

import {
  useState,
  useRef,
  useCallback,
  useLayoutEffect,
  useEffect,
} from "react";

import type { DragLayout, LayoutRect } from "../util/dragLayout";
import { buildDragLayout, computeTargetIndex } from "../util/dragLayout";
import {
  DRAG_ACTIVATION_DISTANCE_PX,
  DRAG_EASING,
  DRAG_SETTLE_MS,
} from "../constants";
import { prefersReducedMotion } from "../util/motion";

const getAnimationlessRect = (el: HTMLElement): LayoutRect => {
  const rect = el.getBoundingClientRect();
  const transform = window.getComputedStyle(el).transform;

  if (!transform || transform === "none") return rect;

  try {
    const matrix = new DOMMatrixReadOnly(transform);
    const left = rect.left - matrix.m41;
    const top = rect.top - matrix.m42;

    return {
      top,
      right: left + rect.width,
      bottom: top + rect.height,
      left,
      width: rect.width,
      height: rect.height,
    };
  } catch {
    return rect;
  }
};

const useDragReorder = (
  items: { id: number }[],
  onCommit: (orderedIds: number[]) => void,
) => {
  const [orderedIds, setOrderedIds] = useState<number[]>(() =>
    items.map((i) => i.id),
  );
  const [draggedId, setDraggedId] = useState<number | null>(null);

  const orderedIdsRef = useRef(orderedIds);
  const onCommitRef = useRef(onCommit);
  const itemElsRef = useRef(new Map<number, HTMLElement>());
  const refCacheRef = useRef(
    new Map<number, (el: HTMLElement | null) => void>(),
  );
  const prevRectsRef = useRef(new Map<number, DOMRect>());
  const dragLayoutRef = useRef<DragLayout | null>(null);
  const needsFlipRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragActiveRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => () => cleanupRef.current?.(), []);

  useEffect(() => {
    const newIds = items.map((i) => i.id);
    const liveIds = new Set(newIds);

    itemElsRef.current.forEach((_el, id) => {
      if (!liveIds.has(id)) itemElsRef.current.delete(id);
    });
    refCacheRef.current.forEach((_ref, id) => {
      if (!liveIds.has(id)) refCacheRef.current.delete(id);
    });

    if (dragActiveRef.current) return;
    setOrderedIds(newIds);
    orderedIdsRef.current = newIds;
  }, [items]);

  useEffect(() => {
    orderedIdsRef.current = orderedIds;
  }, [orderedIds]);

  const invalidateDragLayout = useCallback(() => {
    dragLayoutRef.current = null;
  }, []);

  useLayoutEffect(() => {
    invalidateDragLayout();

    if (!needsFlipRef.current) return;
    needsFlipRef.current = false;

    if (prefersReducedMotion()) return;

    const oldRects = prevRectsRef.current;

    itemElsRef.current.forEach((el, id) => {
      if (id === draggedId) return;

      const oldRect = oldRects.get(id);
      if (!oldRect) return;

      const newRect = el.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;

      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;

      el.getAnimations().forEach((a) => a.cancel());

      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" },
        ],
        {
          duration: DRAG_SETTLE_MS,
          easing: DRAG_EASING,
        },
      );
    });
  }, [orderedIds, draggedId, invalidateDragLayout]);

  const snapshotRects = () => {
    itemElsRef.current.forEach((el) => {
      el.getAnimations().forEach((a) => a.cancel());
    });
    const rects = new Map<number, DOMRect>();
    itemElsRef.current.forEach((el, id) => {
      rects.set(id, el.getBoundingClientRect());
    });
    prevRectsRef.current = rects;
    needsFlipRef.current = true;
    dragLayoutRef.current = null;
  };

  const getDragLayout = (dragId: number): DragLayout => {
    const cached = dragLayoutRef.current;
    if (cached) return cached;

    const rectById = new Map<number, LayoutRect>();
    itemElsRef.current.forEach((el, id) => {
      rectById.set(id, getAnimationlessRect(el));
    });

    const layout = buildDragLayout(orderedIdsRef.current, rectById, dragId);
    dragLayoutRef.current = layout;
    return layout;
  };

  const registerRef = useCallback((id: number) => {
    let fn = refCacheRef.current.get(id);
    if (!fn) {
      fn = (el: HTMLElement | null) => {
        if (el) itemElsRef.current.set(id, el);
        else {
          itemElsRef.current.delete(id);
          refCacheRef.current.delete(id);
        }
      };
      refCacheRef.current.set(id, fn);
    }
    return fn;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, id: number) => {
    if (cleanupRef.current) return;
    if (e.button !== 0) return;
    if (!orderedIdsRef.current.includes(id)) return;

    const el = itemElsRef.current.get(id);
    if (!el) return;

    e.preventDefault();
    e.stopPropagation();

    const pointerId = e.pointerId;
    const handleEl = e.currentTarget as HTMLElement;
    try {
      handleEl.setPointerCapture(pointerId);
    } catch {
      //
    }

    const rect = el.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    const previousBodyCursor = document.body.style.cursor;
    const previousBodyUserSelect = document.body.style.userSelect;

    let clone: HTMLElement | null = null;
    let cloneBaseLeft = 0;
    let cloneBaseTop = 0;
    let activated = false;
    let finished = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;
    const originalOrder = [...orderedIdsRef.current];

    const activate = () => {
      activated = true;
      dragActiveRef.current = true;
      invalidateDragLayout();

      clone = el.cloneNode(true) as HTMLElement;
      const currentRect = el.getBoundingClientRect();
      cloneBaseLeft = currentRect.left;
      cloneBaseTop = currentRect.top;

      clone.style.position = "fixed";
      clone.style.left = `${currentRect.left}px`;
      clone.style.top = `${currentRect.top}px`;
      clone.style.width = `${currentRect.width}px`;
      clone.style.height = `${currentRect.height}px`;
      clone.style.zIndex = "9999";
      clone.style.margin = "0";
      clone.style.pointerEvents = "none";
      clone.style.opacity = "0.85";
      clone.style.boxShadow = "0 20px 60px rgba(7,5,3,0.58)";
      clone.style.cursor = "grabbing";
      clone.style.willChange = "transform";
      clone.style.transition = "box-shadow 200ms, opacity 200ms";

      window.addEventListener("scroll", invalidateDragLayout, true);
      window.addEventListener("resize", invalidateDragLayout);

      document.body.appendChild(clone);
      document.body.style.cursor = "grabbing";
      document.body.style.userSelect = "none";

      el.style.opacity = "0";
      el.style.transition = "none";

      setDraggedId(id);
    };

    const onMove = (me: PointerEvent) => {
      if (me.pointerId !== pointerId) return;

      if (!activated) {
        const dx = me.clientX - startX;
        const dy = me.clientY - startY;
        if (Math.sqrt(dx * dx + dy * dy) < DRAG_ACTIVATION_DISTANCE_PX) return;
        activate();
      }

      const dragLeft = me.clientX - offsetX;
      const dragTop = me.clientY - offsetY;
      const dragRect = {
        top: dragTop,
        right: dragLeft + rect.width,
        bottom: dragTop + rect.height,
        left: dragLeft,
        width: rect.width,
        height: rect.height,
      };

      if (clone) {
        clone.style.transform = `translate3d(${dragLeft - cloneBaseLeft}px, ${
          dragTop - cloneBaseTop
        }px, 0)`;
      }

      const targetIdx = computeTargetIndex(
        getDragLayout(id),
        me.clientY,
        dragRect,
      );
      const currentOrder = orderedIdsRef.current;
      const withoutDragged = currentOrder.filter((cid) => cid !== id);
      const newOrder = [...withoutDragged];
      newOrder.splice(targetIdx, 0, id);

      if (newOrder.some((nid, i) => nid !== currentOrder[i])) {
        snapshotRects();
        orderedIdsRef.current = newOrder;
        setOrderedIds(newOrder);
      }
    };

    const cleanup = () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("blur", onWindowBlur);
      window.removeEventListener("scroll", invalidateDragLayout, true);
      window.removeEventListener("resize", invalidateDragLayout);
      document.body.style.cursor = previousBodyCursor;
      document.body.style.userSelect = previousBodyUserSelect;

      try {
        if (handleEl.hasPointerCapture(pointerId)) {
          handleEl.releasePointerCapture(pointerId);
        }
      } catch {
        // The browser can release capture before our cleanup runs.
      }
    };

    const abort = (resetDraggedId = true) => {
      if (finished) return;
      finished = true;
      cleanup();
      if (settleTimer !== null) {
        clearTimeout(settleTimer);
        settleTimer = null;
      }
      if (clone) clone.remove();
      el.style.opacity = "";
      el.style.transition = "";
      if (resetDraggedId) setDraggedId(null);
      dragActiveRef.current = false;
      cleanupRef.current = null;
    };

    const onUp = (ue: PointerEvent) => {
      if (ue.pointerId !== pointerId) return;
      if (finished) return;
      cleanup();

      if (!activated || !clone) {
        finished = true;
        dragActiveRef.current = false;
        cleanupRef.current = null;
        return;
      }

      const suppressClick = (ce: MouseEvent) => {
        ce.stopPropagation();
        ce.preventDefault();
      };
      document.addEventListener("click", suppressClick, { capture: true });
      requestAnimationFrame(() => {
        document.removeEventListener("click", suppressClick, {
          capture: true,
        });
      });

      const settleMs = prefersReducedMotion() ? 0 : DRAG_SETTLE_MS;
      const finalRect = el.getBoundingClientRect();
      clone.style.transition = settleMs
        ? `transform ${settleMs}ms ${DRAG_EASING}, box-shadow ${settleMs}ms, opacity ${settleMs}ms`
        : "none";
      clone.style.transform = `translate3d(${finalRect.left - cloneBaseLeft}px, ${
        finalRect.top - cloneBaseTop
      }px, 0)`;
      clone.style.boxShadow = "";
      clone.style.opacity = "1";

      const cloneToRemove = clone;
      settleTimer = setTimeout(() => {
        settleTimer = null;
        if (finished) return;
        finished = true;
        cloneToRemove.remove();
        el.style.opacity = "";
        el.style.transition = "";
        setDraggedId(null);
        dragActiveRef.current = false;
        cleanupRef.current = null;
        onCommitRef.current(orderedIdsRef.current);
      }, settleMs);
    };

    const onCancel = (ce: PointerEvent) => {
      if (ce.pointerId !== pointerId) return;
      abort();
    };

    const onWindowBlur = () => {
      abort();
    };

    const onKeyDown = (ke: KeyboardEvent) => {
      if (ke.key === "Escape") {
        snapshotRects();
        orderedIdsRef.current = originalOrder;
        setOrderedIds(originalOrder);
        setDraggedId(null);
        abort(false);
      }
    };

    cleanupRef.current = () => abort(false);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onCancel);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", onWindowBlur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveItem = useCallback((id: number, direction: -1 | 1) => {
    if (dragActiveRef.current) return;

    const currentOrder = orderedIdsRef.current;
    const index = currentOrder.indexOf(id);
    if (index === -1) return;

    const target = index + direction;
    if (target < 0 || target >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    [newOrder[index], newOrder[target]] = [newOrder[target], newOrder[index]];

    snapshotRects();
    orderedIdsRef.current = newOrder;
    setOrderedIds(newOrder);
    onCommitRef.current(newOrder);
  }, []);

  return {
    orderedIds,
    draggedId,
    handlePointerDown,
    moveItem,
    registerRef,
    containerRef,
  };
};

export default useDragReorder;
