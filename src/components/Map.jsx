import axios from "axios";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from "react-redux";
import { updateInitiated, updateIsInput, updateRoute } from "../redux/locationSlice";
import { Icon } from "leaflet";
import iconO from '../assets/origin-icon.png';
import iconD from '../assets/destination-icon.png';
import iconS from '../assets/stop-icon.png'

const Map = () => {
    const dispatch = useDispatch();

    const origin = useSelector((state) => state.location.origin);
    const destination = useSelector((state) => state.location.destination);
    const waypointss = useSelector((state) => state.location.waypoints);
    const transitMode = useSelector((state) => state.location.transitMode);
    const initiated = useSelector((state) => state.location.initiated);
    const isInput = useSelector((state) => state.location.isInput);

    const [center, setCenter] = useState([28.6138954, 77.2090057]);
    const [route, setRoute] = useState([]);
    const [minLat, setMinLat] = useState(origin.lat);
    const [minLon, setMinLon] = useState(origin.lon);
    const [maxLat, setMaxLat] = useState(origin.lat);
    const [maxLon, setMaxLon] = useState(origin.lon);

    const originIcon = new Icon({
        iconUrl: iconO,
        iconSize: [38, 38],
        popupAnchor: [1, -34]
    })

    const destinationIcon = new Icon({
        iconUrl: iconD,
        iconSize: [38, 38],
        popupAnchor: [1, -34]
    })

    const stopIcon = new Icon({
        iconUrl: iconS,
        iconSize: [38, 38],
        popupAnchor: [1, -34]
    })

    useEffect(() => {
        if (initiated && origin.formatted && destination.formatted) {
            const fetchRoute = async () => {
                const waypointsStr = waypointss
                    .map((wp) => `${wp.lat},${wp.lon}`)
                    .join('|');
                const transit = {
                    drive: 'car',
                    bike: 'bike',
                    walk: 'walk',
                }[transitMode];

                try {
                    const response = await axios.get(
                        `https://api.geoapify.com/v1/routing`,
                        {
                            params: {
                                waypoints: waypointss.length > 0
                                    ? `${origin.lat},${origin.lon}|${waypointsStr}|${destination.lat},${destination.lon}`
                                    : `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`,

                                mode: transitMode,
                                apiKey: 'd7d862e3a8b446009c7d46ace01d67f0',
                            },
                        }
                    );
                    console.log(response.data);
                    const routeData = response.data.features[0];
                    setRoute([]);
                    routeData.geometry.coordinates.forEach((coor) => {
                        setRoute((prevRoutes) => [
                            ...prevRoutes,
                            ...coor
                        ]);
                    });

                    console.log(route);
                    dispatch(updateRoute(routeData.properties));
                    dispatch(updateInitiated(false));
                    dispatch(updateIsInput(false));
                } catch (error) {
                    // console.error("Error fetching route:", error);
                    dispatch(updateInitiated(false));
                    dispatch(updateIsInput(false));
                    if (error.response && error.response.data && error.response.data.message) {
                        alert(error.response.data.message);
                    } else {
                        alert('Enter valid route.');
                        console.log('error: ', error);
                    }
                }
            }
            fetchRoute();
        }

        if (isInput) {
            setCenter([origin.lat, origin.lon]);
        }

    }, [initiated, origin, destination, dispatch, isInput, transitMode])

    useEffect(() => {
        if (waypointss.every(way => way !== '')) {
            const lat = waypointss.map(way => way.lat);
            const lon = waypointss.map(way => way.lon);

            setMinLat(Math.min(...lat));
            setMinLon(Math.min(...lon));
            setMaxLat(Math.max(...lat));
            setMaxLon(Math.max(...lon));
        }
    }, [waypointss]);

    function ChangeView() {
        const map = useMap();
        useEffect(() => {
            map.flyTo(center, 13);
            if (origin.formatted !== '' && destination.formatted !== '') {
                map.fitBounds(getBounds());
            }
        }, [center, map]);
        return null;
    }

    const getBounds = () => {
        if (origin && destination) {

            if (waypointss.every(way => way != '')) {
                const lat = waypointss.map(way => (way !== '' && way.lat));
                const lon = waypointss.map(way => (way !== '' && way.lon));

                setMinLat(Math.min(...lat));
                setMinLon(Math.min(...lon));
                setMaxLat(Math.max(...lat));
                setMaxLon(Math.max(...lon));

                // minLat = Math.min(...lat);
                // minLon = Math.min(...lon);
                // maxLat = Math.max(...lat);
                // maxLon = Math.max(...lon);

                console.log(lat, lon);
            }

            const bounds = [
                [Math.min(origin.lat, destination.lat, minLat), Math.min(origin.lon, destination.lon, minLon)],
                [Math.max(origin.lat, destination.lat, maxLat), Math.max(origin.lon, destination.lon, maxLat)]
            ];
            console.log(bounds);
            return bounds;
        }
        return null;
    };

    return (
        <>
            <div className="mapOuter">
                <MapContainer center={center} zoom={13}>
                    <ChangeView />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {route &&
                        <Polyline positions={route.map(coord => [coord[1], coord[0]])} color="blue" />
                    }

                    {(origin.formatted != '') &&
                        <Marker position={[origin.lat, origin.lon]} icon={originIcon}>
                            <Popup>Origin: {origin.formatted}</Popup>
                        </Marker>
                    }

                    {(destination.formatted != '') && <Marker position={[destination.lat, destination.lon]} icon={destinationIcon}>
                        <Popup>Destination: {destination.formatted}</Popup>
                    </Marker>
                    }

                    {(waypointss.map((way, key) => (
                        (way !== '') &&
                        <Marker key={key} position={[way.lat, way.lon]} icon={stopIcon}>
                            <Popup>Stop {key + 1}: {way.formatted}</Popup>
                        </Marker>
                    )))}

                </MapContainer>
            </div>
        </>
    )
}

export default Map;
