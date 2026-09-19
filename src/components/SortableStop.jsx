import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import CloseIcon from '@mui/icons-material/Close';
import Autocomplete from './Autocomplete';

const SortableStop = ({ waypoint, index, onSelect, onRemove }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: waypoint.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 5 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`stopField ${isDragging ? 'dragging' : ''}`}
        >
            <div className="stopFieldHeader">
                <button
                    type="button"
                    ref={setActivatorNodeRef}
                    className="dragHandle"
                    {...attributes}
                    {...listeners}
                    aria-label={`Reorder stop ${index + 1}`}
                    title="Drag to reorder"
                >
                    <DragIndicatorIcon fontSize="small" />
                </button>
                <span className="stopBadge">{index + 1}</span>
                <label>Stop {index + 1}</label>
                <IconButton
                    size="small"
                    className="removeStop"
                    onClick={() => onRemove(waypoint.id)}
                    aria-label={`Remove stop ${index + 1}`}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </div>
            <Autocomplete
                placeholder={`Enter Stop ${index + 1}`}
                value={waypoint.formatted}
                onSelect={(location) => onSelect(waypoint.id, location)}
            />
        </div>
    );
};

SortableStop.propTypes = {
    waypoint: PropTypes.shape({
        id: PropTypes.string.isRequired,
        lat: PropTypes.number,
        lon: PropTypes.number,
        formatted: PropTypes.string,
    }).isRequired,
    index: PropTypes.number.isRequired,
    onSelect: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
};

export default SortableStop;
