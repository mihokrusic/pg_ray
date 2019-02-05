import { IPoint } from './vector'
import { IRay } from './ray'

export interface IState {
	activate(): void;

	onMouseMove(event: MouseEvent): void;
	onMouseDown(event: MouseEvent): void;
	onMouseUp(event: MouseEvent): void;

	onTouchStart(event: TouchEvent): void;
	onTouchEnd(event: TouchEvent): void;
	onTouchCancel(event: TouchEvent): void;
	onTouchMove(event: TouchEvent): void;

	onKeyUp(event: KeyboardEvent): void;

	onUpdate(dt: number): void;
	onRender(dt: number): void;
}

export class State implements IState {

	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	canvasOffset: ClientRect;

	pointerMoveEvent: IPoint = null;
	pointerDownEvent: IPoint = null;
	pointerUpEvent: IPoint = null;

	rays: IRay[];

	constructor(canvas: HTMLCanvasElement) {
		if (new.target === State) {
	        throw new TypeError("Cannot construct State instances directly");
	    }

		this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.canvasOffset = canvas.getBoundingClientRect();

		// TODO: maybe somewhere else?
		this.rays = [];
	}

	/*
		Lifecycle methods
	*/
	activate() {}


	/*
		DOM EVENTS
	*/
	onMouseMove(event: MouseEvent) {
		this.pointerMoveEvent = this._getCordinatesFromEvent(event);
	}
	onMouseDown(event: MouseEvent) {
		this.pointerDownEvent = this._getCordinatesFromEvent(event);
	}
	onMouseUp(event: MouseEvent) {
		this.pointerUpEvent = this._getCordinatesFromEvent(event);
	}


	onTouchStart(event: TouchEvent) {
		this.pointerDownEvent = this._getCordinatesFromEvent(event.touches[0]);
	}
	onTouchEnd(event: TouchEvent) {
		this.pointerUpEvent = this._getCordinatesFromEvent(event.changedTouches[0]);
	}
	onTouchCancel(event: TouchEvent) {
		this.pointerDownEvent = null;
		this.pointerUpEvent = null;
	}
	onTouchMove(event: TouchEvent) {
		this.pointerMoveEvent = this._getCordinatesFromEvent(event.touches[0]);
	}


	onKeyUp(event: KeyboardEvent) {}

	onUpdate(dt: number) {}
	onRender(dt: number) {}

	private _getCordinatesFromEvent(event: any): IPoint {
		return {
			x: event.clientX - this.canvasOffset.left - this.canvas.width / 2,
			y: (event.clientY * -1) + this.canvasOffset.top + this.canvas.height / 2
		};
	}
}