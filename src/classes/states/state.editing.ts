import { State } from './../state';
import { IPoint } from '../vector';
import drawingHelper from '../../helpers/drawing.helper';

export class EditingState extends State {

	private firstPoint: IPoint = null;
	private lastPoint: IPoint = null;

	constructor(canvas: HTMLCanvasElement) {
		super(canvas);
	}

	activate() {
		console.log("editing, activate!");
	}

	onMouseUp(event: MouseEvent) {
		super.onMouseUp(event);

		if (!this.firstPoint)
			this.firstPoint = this.pointerMoveEvent;
		else
			this.lastPoint = this.pointerMoveEvent;

	}

	onUpdate(dt: number) {
		if (this.firstPoint && this.lastPoint) {
			this.obstacles.push({
				from: {
					x: this.firstPoint.x,
					y: this.firstPoint.y
				},
				to: {
					x: this.lastPoint.x,
					y: this.lastPoint.y
				},
				selected: false
			});

			this.firstPoint = null;
			this.lastPoint = null;
		}
	}

	onRender(dt: number) {
	    drawingHelper.drawObstacles(this.context, this.obstacles);

    	if (this.firstPoint) {
	    	drawingHelper.drawCircle(this.context, this.firstPoint, 4, "green");
	    	drawingHelper.drawLine(this.context, this.firstPoint, this.pointerMoveEvent, "green", 1);
	    	drawingHelper.drawCircle(this.context, this.pointerMoveEvent, 4, "green");
    	}
	}

}
