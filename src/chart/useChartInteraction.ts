import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import type { Complex } from '../rf';
import {
  clientPointToReflection,
  constrainReflection,
  moveReflection,
  type ClientBounds,
  type ReflectionMoveDirection,
} from './pointerMapping';

type MarkerEvent = PointerEvent<HTMLDivElement>;

interface Options {
  readonly reflection: Complex;
  readonly snapPointer: boolean;
  readonly onPreview: (reflection: Complex) => void;
  readonly onCommit: (reflection: Complex) => void;
  readonly onCancel: () => void;
}

export interface ChartInteractionBindings {
  readonly activeSource: 'pointer' | 'keyboard' | null;
  readonly tooltipVisible: boolean;
  readonly announcement: string;
  readonly onPointerDown: (event: MarkerEvent) => void;
  readonly onPointerMove: (event: MarkerEvent) => void;
  readonly onPointerUp: (event: MarkerEvent) => void;
  readonly onPointerCancel: (event: MarkerEvent) => void;
  readonly onLostPointerCapture: (event: MarkerEvent) => void;
  readonly onPointerEnter: () => void;
  readonly onPointerLeave: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  readonly onFocus: () => void;
  readonly onBlur: (event: FocusEvent<HTMLDivElement>) => void;
}

const sameReflection = (left: Complex, right: Complex): boolean =>
  left.re === right.re && left.im === right.im;

export function useChartInteraction({
  reflection,
  snapPointer,
  onPreview,
  onCommit,
  onCancel,
}: Options): ChartInteractionBindings {
  const reflectionRef = useRef(reflection);
  const callbacksRef = useRef({ onPreview, onCommit, onCancel });
  const pointerIdRef = useRef<number | null>(null);
  const boundsRef = useRef<ClientBounds | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingRef = useRef<Complex | null>(null);
  const transactionStartRef = useRef<Complex | null>(null);
  const keyboardActiveRef = useRef(false);
  const [activeSource, setActiveSource] = useState<'pointer' | 'keyboard' | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    reflectionRef.current = reflection;
  }, [reflection]);

  useEffect(() => {
    callbacksRef.current = { onPreview, onCommit, onCancel };
  }, [onPreview, onCommit, onCancel]);

  const cancelFrame = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    pendingRef.current = null;
  };

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const preview = (next: Complex) => {
    if (sameReflection(next, reflectionRef.current)) return;
    reflectionRef.current = next;
    callbacksRef.current.onPreview(next);
  };

  const schedulePreview = (next: Complex) => {
    pendingRef.current = next;
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) preview(pending);
    });
  };

  const pointFromEvent = (event: MarkerEvent): Complex | null => {
    if (!boundsRef.current) return null;
    const raw = clientPointToReflection({ x: event.clientX, y: event.clientY }, boundsRef.current);
    return raw ? constrainReflection(raw, snapPointer) : null;
  };

  const settlePointer = (target: HTMLDivElement, cancel: boolean) => {
    const pointerId = pointerIdRef.current;
    pointerIdRef.current = null;
    boundsRef.current = null;
    cancelFrame();
    setActiveSource(null);
    if (cancel) {
      if (transactionStartRef.current) reflectionRef.current = transactionStartRef.current;
      callbacksRef.current.onCancel();
      setAnnouncement('Load marker adjustment canceled.');
    }
    transactionStartRef.current = null;
    if (pointerId !== null && target.hasPointerCapture(pointerId)) {
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        // Capture can be released implicitly before cleanup.
      }
    }
  };

  const onPointerDown = (event: MarkerEvent) => {
    if (
      pointerIdRef.current !== null ||
      !event.isPrimary ||
      ((event.pointerType === 'mouse' || event.pointerType === 'pen') && event.button !== 0)
    )
      return;
    const svg = event.currentTarget.closest('svg');
    if (!svg) return;
    event.preventDefault();
    event.currentTarget.focus({ preventScroll: true });
    boundsRef.current = svg.getBoundingClientRect();
    pointerIdRef.current = event.pointerId;
    transactionStartRef.current = reflectionRef.current;
    setActiveSource('pointer');
    setAnnouncement('');
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      pointerIdRef.current = null;
      boundsRef.current = null;
      transactionStartRef.current = null;
      setActiveSource(null);
      return;
    }
    const next = pointFromEvent(event);
    if (next) preview(next);
  };

  const onPointerMove = (event: MarkerEvent) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const next = pointFromEvent(event);
    if (next) schedulePreview(next);
  };

  const onPointerUp = (event: MarkerEvent) => {
    if (pointerIdRef.current !== event.pointerId) return;
    const next = pointFromEvent(event) ?? reflectionRef.current;
    cancelFrame();
    reflectionRef.current = next;
    callbacksRef.current.onCommit(next);
    transactionStartRef.current = null;
    setAnnouncement('Load marker adjustment committed.');
    settlePointer(event.currentTarget, false);
  };

  const cancelPointer = (event: MarkerEvent) => {
    if (pointerIdRef.current !== event.pointerId) return;
    settlePointer(event.currentTarget, true);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const directions: Partial<Record<string, ReflectionMoveDirection>> = {
      ArrowLeft: 'left',
      ArrowRight: 'right',
      ArrowUp: 'up',
      ArrowDown: 'down',
    };
    const direction = directions[event.key];
    if (direction) {
      event.preventDefault();
      if (!keyboardActiveRef.current) {
        keyboardActiveRef.current = true;
        transactionStartRef.current = reflectionRef.current;
        setActiveSource('keyboard');
        setAnnouncement('');
      }
      preview(moveReflection(reflectionRef.current, direction, event.shiftKey ? 0.02 : 0.002));
      return;
    }
    if (event.key === 'Enter' && keyboardActiveRef.current) {
      event.preventDefault();
      keyboardActiveRef.current = false;
      setActiveSource(null);
      callbacksRef.current.onCommit(reflectionRef.current);
      transactionStartRef.current = null;
      setAnnouncement('Load marker adjustment committed.');
      return;
    }
    if (event.key !== 'Escape') return;
    if (pointerIdRef.current !== null) {
      event.preventDefault();
      settlePointer(event.currentTarget, true);
    } else if (keyboardActiveRef.current) {
      event.preventDefault();
      keyboardActiveRef.current = false;
      setActiveSource(null);
      if (transactionStartRef.current) reflectionRef.current = transactionStartRef.current;
      callbacksRef.current.onCancel();
      transactionStartRef.current = null;
      setAnnouncement('Load marker adjustment canceled.');
    }
  };

  const onBlur = () => {
    setFocused(false);
    if (!keyboardActiveRef.current) return;
    keyboardActiveRef.current = false;
    setActiveSource(null);
    callbacksRef.current.onCommit(reflectionRef.current);
    transactionStartRef.current = null;
    setAnnouncement('Load marker adjustment committed.');
  };

  return {
    activeSource,
    tooltipVisible: hovered || focused || activeSource !== null,
    announcement,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: cancelPointer,
    onLostPointerCapture: cancelPointer,
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => setHovered(false),
    onKeyDown,
    onFocus: () => setFocused(true),
    onBlur,
  };
}
