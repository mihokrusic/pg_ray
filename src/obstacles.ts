let obstacles = [
	// outer
	{ from: { x: -490, y: -290 }, to: { x: 490, y: -290 }, selected: false },
	{ from: { x: 490, y: -290 }, to: { x: 490, y: 290 }, selected: false },
	{ from: { x: 490, y: 290 }, to: { x: -490, y: 290 }, selected: false },
	{ from: { x: -490, y: 290 }, to: { x: -490, y: -290 }, selected: false },
	// inner
	{ from: { x: -100, y: -150 }, to: { x: -50, y: 50 }, selected: false },
	{ from: { x: -400, y: 50 }, to: { x: -100, y: 150 }, selected: false },
	{ from: { x: 150, y: 50 }, to: { x: 400, y: -150 }, selected: false },
	{ from: { x: 400, y: -130 }, to: { x: 300, y: -130 }, selected: false },
	{ from: { x: 50, y: -50 }, to: { x: 300, y: 100 }, selected: false },
];

export default obstacles;