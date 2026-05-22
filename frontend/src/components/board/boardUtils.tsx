import type { Box, TabType } from '../../types';

export const filterBoxes = (boxes: Box[], tab: TabType) => ({
    ALL: boxes,
    ACTIVE: boxes.filter(b => b.state !== 'DONE'),
    DONE: boxes.filter(b => b.state === 'DONE'),
    BOOKMARK: boxes.filter(b => b.bookmark),
}[tab]);

export const DropZone = () => (
    <div className="drop-zone" onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}>
        <i className="ti ti-arrow-down" aria-hidden="true" />
    </div>
);