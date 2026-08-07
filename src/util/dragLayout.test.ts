import { describe, expect, it } from "vitest";
import type { LayoutRect } from "./dragLayout";
import { buildDragLayout, computeTargetIndex } from "./dragLayout";

const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 50;

const rect = (left: number, top: number): LayoutRect => ({
  left,
  top,
  right: left + BLOCK_WIDTH,
  bottom: top + BLOCK_HEIGHT,
  width: BLOCK_WIDTH,
  height: BLOCK_HEIGHT,
});

const layoutFor = (rects: LayoutRect[], dragId: number) =>
  buildDragLayout(
    rects.map((_rect, index) => index + 1),
    new Map(rects.map((r, index) => [index + 1, r])),
    dragId,
  );

const twoColumnsOfThree = [rect(0, 0), rect(110, 0), rect(0, 60)];
const stackedThree = [rect(0, 0), rect(0, 60), rect(0, 120)];
const twoColumnsOfFour = [rect(0, 0), rect(110, 0), rect(0, 60), rect(110, 60)];

describe("buildDragLayout column detection", () => {
  it("reports multi-column for a 3-block 2-column grid, whichever block is dragged", () => {
    for (const dragId of [1, 2, 3]) {
      expect(layoutFor(twoColumnsOfThree, dragId).singleColumn).toBe(false);
    }
  });

  it("reports single-column for three stacked blocks, whichever is dragged", () => {
    for (const dragId of [1, 2, 3]) {
      expect(layoutFor(stackedThree, dragId).singleColumn).toBe(true);
    }
  });

  it("reports multi-column for two blocks side by side", () => {
    expect(layoutFor([rect(0, 0), rect(110, 0)], 1).singleColumn).toBe(false);
  });

  it("reports single-column for two stacked blocks", () => {
    expect(layoutFor([rect(0, 0), rect(0, 60)], 1).singleColumn).toBe(true);
  });

  it("reports single-column for a lone block", () => {
    expect(layoutFor([rect(0, 0)], 1).singleColumn).toBe(true);
  });

  it("reports multi-column for a 4-block 2-column grid, whichever is dragged", () => {
    for (const dragId of [1, 2, 3, 4]) {
      expect(layoutFor(twoColumnsOfFour, dragId).singleColumn).toBe(false);
    }
  });

  it("excludes the dragged block from the slots but keeps its order index", () => {
    const layout = layoutFor(stackedThree, 2);

    expect(layout.dragOrderIndex).toBe(1);
    expect(layout.slots.map((slot) => slot.orderIndex)).toEqual([0, 2]);
  });
});

describe("computeTargetIndex", () => {
  it("keeps a stacked block in place while it has not crossed a neighbour", () => {
    const layout = layoutFor(stackedThree, 1);

    expect(computeTargetIndex(layout, 25, rect(0, 0))).toBe(0);
  });

  it("moves a stacked block past a neighbour it has crossed", () => {
    const layout = layoutFor(stackedThree, 1);

    expect(computeTargetIndex(layout, 75, rect(0, 50))).toBe(1);
  });

  it("keeps a grid block in place while it has not crossed a neighbour", () => {
    const layout = layoutFor(twoColumnsOfThree, 1);

    expect(computeTargetIndex(layout, 25, rect(0, 0))).toBe(0);
  });

  it("moves a grid block past the neighbour on its row", () => {
    const layout = layoutFor(twoColumnsOfThree, 1);

    expect(computeTargetIndex(layout, 25, rect(110, 0))).toBe(1);
  });
});
