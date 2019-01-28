import { IPoint } from "../classes/vector";
import { IRay, ISegment } from "../classes/ray";

class DrawingHelper {
    drawGrid(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement) {
        //drawLine(context, { x: 0, y: -canvas.height / 2 }, { x: 0, y: canvas.height / 2 }, "silver", .5);

        let i;
        for (i = -canvas.width / 2; i <= canvas.width / 2; i+=50)
            this.drawLine(context, { x: i, y: -canvas.height / 2 }, { x: i, y: canvas.height / 2 }, "silver", 0.5);

        for (i = -canvas.height / 2; i <= canvas.height / 2; i+=50) {
            this.drawLine(context, { x: -canvas.width / 2, y: i }, { x: canvas.width / 2, y: i }, "silver", 0.5);
        }

        this.drawCircle(context, { x: 0, y: 0 }, 2, "silver");
    }

    drawObstacles(context: CanvasRenderingContext2D, obstacles: any) {
        obstacles.forEach((obstacle: any) => {
            this.drawLine(context, obstacle.from, obstacle.to, (obstacle.selected ? "red" : "gray"), 2);
        });
    }

    drawText(context: CanvasRenderingContext2D, x: number, y: number, text: string, font: string, color: string) {
        context.font = font;
        context.fillStyle = color;
        context.fillText(text, x, y);
    }

    drawCircle(context: CanvasRenderingContext2D, point: IPoint, radius: number, color: string) {
        context.beginPath();
        context.arc(point.x, point.y, radius, 0, Math.PI * 2, false);
        context.fillStyle = color;
        context.fill();
    }

    drawRaySegment(context: CanvasRenderingContext2D, segment: ISegment, color: string) {
        context.beginPath();
        context.moveTo(segment.startPosition.x, segment.startPosition.y);
        context.lineTo(segment.endPosition.x, segment.endPosition.y);
        context.strokeStyle = color;
        context.lineWidth = 2;
        context.stroke();
    }

    drawLine(context: CanvasRenderingContext2D, fromPoint: IPoint, toPoint: IPoint, color: string, lineWidth: number) {
        context.beginPath();
        context.moveTo(fromPoint.x, fromPoint.y);
        context.lineTo(toPoint.x, toPoint.y);
        context.strokeStyle = color;
        context.lineWidth = lineWidth;
        context.stroke();
    }
}

export default new DrawingHelper();