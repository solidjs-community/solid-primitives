function getTextWidth(text: string, font: string): number {
  // re-use canvas object for better performance
  const canvas: HTMLCanvasElement =
    // @ts-ignore
    getTextWidth.canvas ||
    // @ts-ignore
    (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d")!;
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}
export default getTextWidth;
