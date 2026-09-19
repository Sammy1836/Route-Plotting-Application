import { Button, Chip, CircularProgress, IconButton, Tooltip, Typography } from "@mui/material";
import Map from "./Map";
import Autocomplete from "./Autocomplete";
import SortableStop from "./SortableStop";
import {
    addWaypoint,
    deleteWaypoint,
    reorderWaypoints,
    resetAll,
    swapEndpoints,
    toggleShowRadial,
    updateDestination,
    updateInitiated,
    updateOrigin,
    updateTransitMode,
    updateWaypoint,
} from "../redux/locationSlice";
import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Add as AddIcon,
    AltRouteOutlined,
    AccessTimeOutlined,
    DirectionsBikeOutlined,
    DirectionsWalkOutlined,
    DriveEtaOutlined,
    RestartAltOutlined,
    StraightenOutlined,
    SwapVertOutlined,
    TwoWheelerOutlined,
} from "@mui/icons-material";
import {
    DndContext,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    buildStops,
    formatDuration,
    formatKm,
    isValidLocation,
    radialSegments,
    totalRadialKm,
} from "../utils/geo";

const Form = () => {
    const dispatch = useDispatch();

    const origin = useSelector((state) => state.location.origin);
    const destination = useSelector((state) => state.location.destination);
    const waypoints = useSelector((state) => state.location.waypoints);
    const transitMode = useSelector((state) => state.location.transitMode);
    const distance = useSelector((state) => state.location.distance);
    const eta = useSelector((state) => state.location.eta);
    const legs = useSelector((state) => state.location.legs);
    const loading = useSelector((state) => state.location.loading);
    const showRadial = useSelector((state) => state.location.showRadial);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const validWaypoints = useMemo(() => waypoints.filter(isValidLocation), [waypoints]);
    const stops = useMemo(
        () => buildStops(origin, validWaypoints, destination),
        [origin, validWaypoints, destination]
    );
    const radialKm = useMemo(() => totalRadialKm(stops), [stops]);
    const radialLegs = useMemo(() => radialSegments(stops), [stops]);

    const canCalculate = isValidLocation(origin) && isValidLocation(destination);

    const handleCalculate = () => {
        if (canCalculate) dispatch(updateInitiated(true));
    };

    const handleReset = () => {
        dispatch(resetAll());
    };

    const handleDragEnd = ({ active, over }) => {
        if (over && active.id !== over.id) {
            dispatch(reorderWaypoints({ activeId: active.id, overId: over.id }));
        }
    };

    const transitModeOptions = [
        { mode: 'drive', label: 'Car', icon: <DriveEtaOutlined /> },
        { mode: 'walk', label: 'Walk', icon: <DirectionsWalkOutlined /> },
        { mode: 'motorcycle', label: 'Motorcycle', icon: <TwoWheelerOutlined /> },
        { mode: 'bicycle', label: 'Bicycle', icon: <DirectionsBikeOutlined /> },
    ];

    const waypointString = validWaypoints.length > 0
        ? validWaypoints.map((way) => way.formatted).join(' → ')
        : 'the selected route';

    const hasResult = Boolean(distance);

    return (
        <div className="formOuter">
            <div className="formHeading">
                <Typography variant="h6" className="formHeadingText">
                    Let&apos;s calculate <b>distance</b> from Google maps
                </Typography>
            </div>
            <div className="formBody">
                <div className="mapComponent">
                    <Map />
                </div>
                <div className="formInner">
                    <div className="formUp">
                        <div className="formLeft">
                            <div className="endpointField">
                                <div className="endpointLabel">
                                    <span className="endpointDot origin" />
                                    <label htmlFor="origin">Origin</label>
                                </div>
                                <Autocomplete
                                    placeholder="Enter Origin"
                                    value={origin.formatted}
                                    onSelect={(location) => dispatch(updateOrigin(location))}
                                />
                                <Tooltip title="Swap origin and destination">
                                    <IconButton
                                        className="swapButton"
                                        size="small"
                                        onClick={() => dispatch(swapEndpoints())}
                                        disabled={!origin.formatted && !destination.formatted}
                                    >
                                        <SwapVertOutlined fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </div>

                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={waypoints.map((way) => way.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="stopsList">
                                        {waypoints.map((waypoint, index) => (
                                            <SortableStop
                                                key={waypoint.id}
                                                waypoint={waypoint}
                                                index={index}
                                                onSelect={(id, location) => dispatch(updateWaypoint({ id, location }))}
                                                onRemove={(id) => dispatch(deleteWaypoint(id))}
                                            />
                                        ))}
                                    </div>
                                </SortableContext>
                            </DndContext>

                            <div className="addStopButton">
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => dispatch(addWaypoint())}
                                    className="addStopBtn"
                                >
                                    Add another stop
                                </Button>
                            </div>

                            <div className="endpointField">
                                <div className="endpointLabel">
                                    <span className="endpointDot destination" />
                                    <label htmlFor="destination">Destination</label>
                                </div>
                                <Autocomplete
                                    placeholder="Enter Destination"
                                    value={destination.formatted}
                                    onSelect={(location) => dispatch(updateDestination(location))}
                                />
                            </div>

                            <div className="transitOption">
                                {transitModeOptions.map((mode) => (
                                    <Tooltip key={mode.mode} title={mode.label}>
                                        <div
                                            className={`transitMode ${transitMode === mode.mode ? 'active' : ''}`}
                                            onClick={() => dispatch(updateTransitMode(mode.mode))}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(event) => event.key === 'Enter' && dispatch(updateTransitMode(mode.mode))}
                                        >
                                            {mode.icon}
                                            <span>{mode.label}</span>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>

                        <div className="formRight">
                            <Button
                                variant="contained"
                                className="calculateButton"
                                onClick={handleCalculate}
                                disabled={!canCalculate || loading}
                                startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                            >
                                {loading ? 'Calculating…' : 'Calculate'}
                            </Button>
                            <Button
                                variant="text"
                                className="resetButton"
                                onClick={handleReset}
                                startIcon={<RestartAltOutlined />}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>

                    <div className="formDown">
                        <div className="formDownDistance">
                            <div className="metric">
                                <div className="metricLabel">
                                    <StraightenOutlined fontSize="small" />
                                    <span>Distance by road</span>
                                </div>
                                <Typography className="metricValue" style={{ color: '#1B31A8' }}>
                                    {distance ? `${distance} km` : '—'}
                                </Typography>
                            </div>
                            <div className="metric">
                                <div className="metricLabel">
                                    <AltRouteOutlined fontSize="small" />
                                    <span>Radial distance</span>
                                    <Tooltip title="Straight-line distance between each point">
                                        <span className="metricInfo">?</span>
                                    </Tooltip>
                                </div>
                                <Typography className="metricValue" style={{ color: '#E8590C' }}>
                                    {hasResult ? formatKm(radialKm) : '—'}
                                </Typography>
                            </div>
                            {hasResult && (
                                <div className="metric">
                                    <div className="metricLabel">
                                        <AccessTimeOutlined fontSize="small" />
                                        <span>Estimated time</span>
                                    </div>
                                    <Typography className="metricValue">
                                        {formatDuration(Number(eta))}
                                    </Typography>
                                </div>
                            )}
                        </div>

                        {hasResult && (
                            <>
                                <div className="formDownControls">
                                    <Chip
                                        label="Show straight-line overlay"
                                        size="small"
                                        clickable
                                        color={showRadial ? 'warning' : 'default'}
                                        variant={showRadial ? 'filled' : 'outlined'}
                                        onClick={() => dispatch(toggleShowRadial())}
                                    />
                                </div>
                                <div className="formDownDescription">
                                    <Typography variant="body1">
                                        The route from <b>{origin.formatted}</b> to <b>{destination.formatted}</b>
                                        {validWaypoints.length > 0 && <> via <b>{waypointString}</b></>} is{' '}
                                        <b>{distance} km</b> by road, while the straight-line distance is{' '}
                                        <b>{formatKm(radialKm)}</b>. The estimated travel time by{' '}
                                        <b>{transitMode}</b> is <b>{formatDuration(Number(eta))}</b>.
                                    </Typography>
                                </div>
                                {legs.length > 0 && stops.length > 1 && (
                                    <div className="legsTable">
                                        {legs.map((leg, index) => (
                                            <div className="legRow" key={index}>
                                                <span className="legIndex">{index + 1}</span>
                                                <span className="legName">
                                                    {stops[index].formatted} → {stops[index + 1].formatted}
                                                </span>
                                                <span className="legRadial">{formatKm(radialLegs[index]?.distanceKm)}</span>
                                                <span className="legRoad">{leg.distance.toFixed(2)} km</span>
                                            </div>
                                        ))}
                                        <div className="legHint">
                                            <span>
                                                <b>Road</b> legs in bold · <span className="legRadial">orange</span> is straight-line
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Form;
