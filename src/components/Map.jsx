import axios from "axios";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import { useDispatch, useSelector } from "react-redux";
import { updateInitiated, updateIsInput, updateRoute } from "../redux/locationSlice";

const Map = () => {
    const dispatch = useDispatch();

    const origin = useSelector((state) => state.location.origin);
    const destination = useSelector((state) => state.location.destination);
    const transitMode = useSelector((state) => state.location.transitMode);
    const initiated = useSelector((state) => state.location.initiated);
    const isInput = useSelector((state) => state.location.isInput);

    const [center, setCenter] = useState([28.6138954, 77.2090057]);
    const [route, setRoute] = useState(null);

    useEffect(() => {
        if (initiated && origin.formatted && destination.formatted) {
            const fetchRoute = async () => {
                try {
                    const response = await axios.get(
                        `https://api.geoapify.com/v1/routing`,
                        {
                            params: {
                                waypoints: `${origin.lat},${origin.lon}|${destination.lat},${destination.lon}`,
                                mode: transitMode,
                                apiKey: API_KEY,
                            },
                        }
                    );
                    console.log({ transitMode });

                    const routeData = response.data.features[0];
                    setRoute(routeData.geometry.coordinates[0]);
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
                    }
                }
            }
            fetchRoute();
        }

        if (isInput) {
            setCenter([origin.lat, origin.lon]);
        }

    }, [initiated, origin, destination, dispatch, isInput, transitMode])

    function ChangeView() {
        const map = useMap();
        map.flyTo(center, 13);
        if (origin.formatted != '' && destination.formatted != '') {
            map.fitBounds(getBounds());
        }
        return null;
    }

    const getBounds = () => {
        if (origin && destination) {
            const bounds = [
                [Math.min(origin.lat, destination.lat), Math.min(origin.lon, destination.lon)],
                [Math.max(origin.lat, destination.lat), Math.max(origin.lon, destination.lon)]
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
                    {route && <Polyline positions={route.map(coord => [coord[1], coord[0]])} color="blue" />}
                    {(origin.formatted != '') && <Marker position={[origin.lat, origin.lon]}>
                        <Popup>Origin: {origin.formatted}</Popup>
                    </Marker>}
                    {(destination.formatted != '') && <Marker position={[destination.lat, destination.lon]}>
                        <Popup>Destination: {destination.formatted}</Popup>
                    </Marker>}
                </MapContainer>
            </div>
        </>
    )
}

export default Map;
