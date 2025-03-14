import { Monochrome } from "./monochrome";

function runLength(a: ReadonlyArray<boolean>): ReadonlyArray<number> {
    let current = true;
    let run = 0;
    const runs = [];
    for (const value of a) {
        if (value !== current) {
            runs.push(run);
            current = value;
            run = 1;
        } else {
            run++;
        }
    }
    runs.push(run);
    return runs;
}

function detect11311(a: ReadonlyArray<boolean>): ReadonlyArray<Readonly<{
    position: number,
    size: number,
}>> {
    const hits = [];
    const runs = runLength(a);
    for (let i = 0, p = 0; i < runs.length - 4; p += runs[i] + runs[i + 1], i = i + 2) {
        const a = runs[i];
        const b = runs[i + 1];
        const c = runs[i + 2];
        const d = runs[i + 3];
        const e = runs[i + 4];
        const avg = (a + b + c + d + e) / 7;
        const dev = avg / 5;
        const min = avg - dev;
        const max = avg + dev;
        if (avg >= 4 && avg < 100 &&
            min <= a && max >= a &&
            min <= b && max >= b &&
            3 * min <= c && 3 * max >= c &&
            min <= d && max >= d &&
            min <= e && max >= e
        ) {
            hits.push({
                position: p + Math.floor(avg * 3.5),
                size: avg,
            });
        }
    }
    return hits;
}

const similarSize = (a: number, b: number): boolean => Math.abs(a - b) * 5 < a + b;

type Hit = Readonly<{
    x: number;
    y: number;
    size: number;
}>;

const key = (x: number, y: number): string => `${x}|${y}`;

function intersectHits(rowHits: ReadonlyArray<Hit>, columnHits: ReadonlyArray<Hit>): ReadonlyArray<Hit> {
    const hits = new Map<string, Hit>();
    const isNewHit = ({ x, y, size }: Hit): boolean => {
        const s = Math.ceil(size);
        for (let dx = -s; dx <= s; dx++) {
            for (let dy = -s; dy <= s; dy++) {
                if (hits.get(key(x + dx, y + dy)) != null) {
                    return false;
                }
            }
        }
        return true;
    }
    const addHit = (h: Hit) => {
        if (isNewHit(h)) {
            hits.set(key(h.x, h.y), h);
        }
    }

    for (const { x: x1, y: y1, size: s1 } of rowHits) {
        for (const { x: x2, y: y2, size: s2 } of columnHits) {
            if ((Math.abs(x1 - x2) <= 2) && (Math.abs(y1 - y2) <= 2) &&
                similarSize(s1, s2)) {
                addHit({ x: x1, y: y2, size: (s1 + s2) / 2 });
            }
        }
    }
    return Array.from(hits.values());
}

type Grid = Readonly<{
    top: number,
    left: number,
    bottom: number,
    right: number,
    size: number,
}>;

function detectGrids(hits: ReadonlyArray<Hit>): ReadonlyArray<Grid> {
    const grids: Array<Grid> = [];

    const sortedHits = [...hits];
    sortedHits.sort((a, b) => (a.x - b.x) + 2 * (a.y - b.y));

    for (let i = 0; i < hits.length - 2; i++) {
        const tl = hits[i];
        const size = tl.size;
        const dev = size / 5;
        for (let j = i + 1; j < hits.length - 1; j++) {
            const tr = hits[j];
            const dx = tr.x - tl.x;
            if (dx < size * 10 || Math.abs(tr.y - tl.y) > dev || !similarSize(tr.size, tl.size)) {
                continue;
            }
            for (let k = j + 1; k < hits.length; k++) {
                const bl = hits[k];
                const dy = bl.y - tl.y;
                if (dy < size * 10 || Math.abs(bl.x - tl.x) > dev || !similarSize(bl.size, tl.size) || !similarSize(dy, dx)) {
                    continue;
                }
                const w = Math.round(dx / size) + 7;
                const h = Math.round(dy / size) + 7;
                if (w === h) {
                    grids.push({
                        top: tl.y - size * 3.5,
                        left: tl.x - size * 3.5,
                        bottom: bl.y + bl.size * 3.5,
                        right: tr.x + tr.size * 3.5,
                        size: w,
                    });
                }
            }
        }
    }

    return grids;
}

type Modules = ReadonlyArray<ReadonlyArray<boolean>>;

function extractModules(m: Monochrome, grid: Grid): { threshold: number, modules: Modules } {
    const { top, left, bottom, right, size } = grid;

    let threshold = 0;
    const w = (right - left) / size;
    const h = (bottom - top) / size;
    const modules = [];
    for (let j = 0; j < size; j++) {
        const line: Array<boolean> = [];
        modules.push(line);
        const y1 = Math.ceil(top + h * j) + 1;
        const y2 = Math.floor(y1 + h) - 1;
        for (let i = 0; i < size; i++) {
            const x1 = Math.ceil(left + w * i) + 1;
            const x2 = Math.floor(x1 + w) - 1;
            let counter = 0;
            let total = 0;
            for (let y = y1; y < y2; y++) {
                for (let x = x1; x < x2; x++) {
                    total++;
                    if (m.get(x, y)) {
                        counter++;
                    }
                }
            }
            if (2 * counter > total) {
                line.push(true);
                threshold = Math.max(threshold, (total - counter) / total);
            } else {
                line.push(false);
                threshold = Math.max(threshold, counter / total);
            }

        }
    }

    return { threshold, modules };
}

export type QR = Readonly<{
    grid: Grid;
    modules: Modules;
    valid: boolean;
}>;

function extractQR(m: Monochrome, grid: Grid): QR {
    let bestGrid = grid;
    let { modules: bestModules, threshold: bestThreshold } = extractModules(m, grid);
    console.log(`Initial threshold ${bestThreshold} ${bestGrid.left}-${bestGrid.right}x${bestGrid.top}-${bestGrid.bottom}`);
    const tryGrids = (grids: ReadonlyArray<Grid>): boolean => {
        let improvement = false;
        for (const g of grids) {
            const { threshold, modules } = extractModules(m, g);
            if (threshold < bestThreshold) {
                bestGrid = g;
                bestModules = modules;
                bestThreshold = threshold;
                console.log(` better threshold ${bestThreshold} ${bestGrid.left}-${bestGrid.right}x${bestGrid.top}-${bestGrid.bottom}`);
                improvement = true;
            }
        }
        return improvement;
    }
    let tries = 5;
    while (
        tries > 0 &&
        tryGrids([-1, -0.5, 0.5, 1].flatMap(d => [
            { ...bestGrid, top: bestGrid.top + d },
            { ...bestGrid, bottom: bestGrid.bottom + d },
            { ...bestGrid, left: bestGrid.left + d },
            { ...bestGrid, right: bestGrid.right + d },
        ])
        )) { tries--; }
    const valid = bestThreshold <= 0.25;
    if (!valid) {
        console.log('%c%s', 'color:red', `Unclear QR with threshold ${bestThreshold}`);
    }
    return { valid, modules: bestModules, grid: bestGrid };
}

export function detectQR(m: Monochrome): ReadonlyArray<QR> {

    const rowHits: Array<Hit> = [];
    for (let y = 0; y < m.height; y++) {
        rowHits.push(...detect11311(m.row(y)).map(({ position: x, size }) => ({ x, y, size })));
    }

    const columnHits: Array<Hit> = [];
    for (let x = 0; x < m.width; x++) {
        columnHits.push(...detect11311(m.column(x)).map(({ position: y, size }) => ({ x, y, size })));
    }

    const hits = intersectHits(rowHits, columnHits);

    const grids = detectGrids(hits);

    return grids.map(grid => extractQR(m, grid));
}

export function drawQR(modules: Modules, canvas: OffscreenCanvas) {
    const len = modules.length;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error("No 2d context for QR?");
    }
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    const size = Math.floor(Math.min(canvas.width, canvas.height) / len);
    const px = Math.floor((canvas.width - size * len) / 2);
    const py = Math.floor((canvas.height - size * len) / 2);
    for (let j = 0; j < len; j++) {
        for (let i = 0; i < len; i++) {
            context.fillStyle = modules[j][i] ? 'black' : 'white';
            context.fillRect(px + size * i, py + size * j, size, size);
        }
    }
}
