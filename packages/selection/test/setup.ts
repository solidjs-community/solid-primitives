const selections = new Map<HTMLInputElement, { start: number; end: number; }>();

(window as any)._selections = selections;

Object.defineProperties(HTMLInputElement.prototype, {
  selectionStart: { get: function() { return selections.get(this)?.start; } },
  selectionEnd: { get: function() { return selections.get(this)?.end; } },
  setSelectionRange: { get: function() { 
    const field = this; return (start: number, end: number) => selections.set(field, { start, end });
  } }
});
