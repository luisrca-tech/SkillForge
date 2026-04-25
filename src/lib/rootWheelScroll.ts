/**
 * When wheel lands on a non-scrollable (or at-scroll-boundary) element inside a
 * custom scroll root, the browser may not scroll that root — e.g. fixed overlay
 * stacks, overflow:hidden chains. This forwards wheel delta to `root` while
 * leaving inner scrollable regions (overflow auto/scroll) to native behavior.
 */
export function shouldDelegateWheelToInner(
  start: EventTarget | null,
  root: HTMLElement,
  e: WheelEvent,
): boolean {
  function deltaYPixels(): number {
    if (e.deltaMode === 0) {
      return e.deltaY;
    }
    if (e.deltaMode === 1) {
      return e.deltaY * 16;
    }
    if (e.deltaMode === 2) {
      return e.deltaY * root.clientHeight;
    }
    return e.deltaY;
  }

  const d = deltaYPixels();
  if (d === 0) {
    return false;
  }
  let el: Node | null = start as Node;
  while (el && el !== root) {
    if (el instanceof HTMLElement) {
      const { overflowY } = getComputedStyle(el);
      if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
        const { scrollTop, scrollHeight, clientHeight } = el;
        if (scrollHeight > clientHeight + 2) {
          const atTop = scrollTop <= 0;
          const atBottom = scrollTop + clientHeight >= scrollHeight - 2;
          if (d < 0 && !atTop) {
            return true;
          }
          if (d > 0 && !atBottom) {
            return true;
          }
        }
      }
    }
    el = el.parentNode;
  }
  return false;
}

export function applyWheelToScrollRoot(root: HTMLElement, e: WheelEvent): void {
  if (e.deltaY === 0) {
    return;
  }
  const max = Math.max(0, root.scrollHeight - root.clientHeight);
  let d: number;
  if (e.deltaMode === 0) {
    d = e.deltaY;
  } else if (e.deltaMode === 1) {
    d = e.deltaY * 16;
  } else {
    d = e.deltaY * root.clientHeight;
  }
  root.scrollTop = Math.max(0, Math.min(max, root.scrollTop + d));
}
