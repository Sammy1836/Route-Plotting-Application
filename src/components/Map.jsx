import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from "react-redux";
import { updateInitiated, updateIsInput, updateLoading, updateRoute } from "../redux/locationSlice";
import { DivIcon, Icon, latLngBounds } from "leaflet";
import iconO from '../assets/origin-icon.png';
import iconD from '../assets/destination-icon.png';
import iconS from '../assets/stop-icon.png';
import { buildStops, isValidLocation } from "../utils/geo";
import { GEOAPIFY_API_KEY } from "../utils/config";

const TRANSIT_MODE_API = {
    drive: 'drive',
    walk: 'walk',
    motorcycle: 'motorcycle',
    bicycle: 'bicycle',
};

const originIcon = new Icon({
    iconUrl: iconO,
    iconSize: [38, 38],
    popupAnchor: [1, -34]
});

const destinationIcon = new Icon({
    iconUrl: iconD,
    iconSize: [38, 38],
    popupAnchor: [1, -34]
});

const fallbackStopIcon = new Icon({
    iconUrl: iconS,
    iconSize: [38, 38],
    popupAnchor: [1, -34]
});

const stopIcon = (label) => new DivIcon({
    className: 'stopMarker',
    html: `<div class="stopMarkerBubble"><span>${label}</span></div>`,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
});

const pointsKey = (stops) =>
    stops
        .map((stop) => `${stop.lat.toFixed(4)},${stop.lon.toFixed(4)}`)
        .sort()
        .join('|');

function FitBounds({ stops, follow }) {
    const map = useMap();
    const key = pointsKey(stops);

    useEffect(() => {
        if (!follow || stops.length === 0) return;

        if (stops.length === 1) {
            map.flyTo([stops[0].lat, stops[0].lon], 13, { duration: 0.8 });
            return;
        }

        const bounds = latLngBounds(stops.map((stop) => [stop.lat, stop.lon]));
        map.flyToBounds(bounds, { padding: [60, 60], maxZoom: 15, duration: 0.8 });
    }, [key, follow, map]); // eslint-disable-line react-hooks/exhaustive-deps

    return null;
}

FitBounds.propTypes = {
    stops: PropTypes.arrayOf(
        PropTypes.shape({
            lat: PropTypes.number.isRequired,
            lon: PropTypes.number.isRequired,
        })
    ).isRequired,
    follow: PropTypes.bool,
};

const Map = () => {
    const dispatch = useDispatch();

    const origin = useSelector((state) => state.location.origin);
    const destination = useSelector((state) => state.location.destination);
    const waypoints = useSelector((state) => state.location.waypoints);
    const transitMode = useSelector((state) => state.location.transitMode);
    const initiated = useSelector((state) => state.location.initiated);
    const isInput = useSelector((state) => state.location.isInput);
    const showRadial = useSelector((state) => state.location.showRadial);

    const [route, setRoute] = useState([]);

    const validWaypoints = useMemo(
        () => waypoints.filter(isValidLocation),
        [waypoints]
    );

    const stops = useMemo(
        () => buildStops(origin, validWaypoints, destination),
        [origin, validWaypoints, destination]
    );

    useEffect(() => {
        if (!initiated) return;
        if (!isValidLocation(origin) || !isValidLocation(destination)) {
            dispatch(updateInitiated(false));
            return;
        }

        const fetchRoute = async () => {
            dispatch(updateLoading(true));

            const waypointsStr = validWaypoints
                .map((wp) => `${wp.lat},${wp.lon}`)
                .join('|');

            const waypointsParam = validWaypoints.length > 0
                ? `${origin.lat},${origin.lon}|${waypointsStr}|${destination.lat},${destination.lon}`
                : `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`;

            try {
                const response = await axios.get(
                    `https://api.geoapify.com/v1/routing`,
                    {
                        params: {
                            waypoints: waypointsParam,
                            mode: TRANSIT_MODE_API[transitMode] ?? 'drive',
                            apiKey: GEOAPIFY_API_KEY,
                        },
                    }
                );

                const routeData = response.data.features[0];
                const coordinates = routeData.geometry.coordinates.flatMap((line) => line);
                setRoute(coordinates);

                dispatch(updateRoute(routeData.properties));
            } catch (error) {
                setRoute([]);
                if (error.response?.data?.message) {
                    alert(error.response.data.message);
                } else {
                    alert('Enter valid route.');
                    console.log('error: ', error);
                }
            } finally {
                dispatch(updateLoading(false));
                dispatch(updateInitiated(false));
                dispatch(updateIsInput(false));
            }
        };

        fetchRoute();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initiated]);

    return (
        <div className="mapOuter">
            <MapContainer center={[origin.lat, origin.lon]} zoom={12} zoomControl={false}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <FitBounds stops={stops} follow={isInput || stops.length > 1} />

                {route.length > 0 && (
                    <Polyline positions={route.map((coord) => [coord[1], coord[0]])} pathOptions={{ color: '#1B31A8', weight: 5, opacity: 0.85 }} />
                )}

                {showRadial && stops.length > 1 && (
                    <Polyline
                        positions={stops.map((stop) => [stop.lat, stop.lon])}
                        pathOptions={{ color: '#FF7A00', weight: 2, dashArray: '2 8', lineCap: 'round' }}
                    />
                )}

                {isValidLocation(origin) && (
                    <Marker position={[origin.lat, origin.lon]} icon={originIcon}>
                        <Popup>Origin: {origin.formatted}</Popup>
                    </Marker>
                )}

                {isValidLocation(destination) && (
                    <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
                        <Popup>Destination: {destination.formatted}</Popup>
                    </Marker>
                )}

                {validWaypoints.map((way, index) => (
                    <Marker
                        key={way.id}
                        position={[way.lat, way.lon]}
                        icon={isValidLocation(way) ? stopIcon(index + 1) : fallbackStopIcon}
                    >
                        <Popup>Stop {index + 1}: {way.formatted}</Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default Map;
