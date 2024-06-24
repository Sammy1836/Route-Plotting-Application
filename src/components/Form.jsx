import { Button, Typography } from "@mui/material";
import Map from "./Map";
import Autocomplete from "./Autocomplete";
import { deleteWaypoints, updateDestination, updateInitiated, updateOrigin, updateTransitMode, updateWaypoints } from "../redux/locationSlice";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DirectionsBikeOutlined, DirectionsWalkOutlined, DriveEtaOutlined, TwoWheelerOutlined } from "@mui/icons-material";
import { icon } from "leaflet";

const apikey = import.meta.env.VITE_API_KEY;

const Form = () => {
    const dispatch = useDispatch();

    const [addStop, setAddStop] = useState(false);

    const origin = useSelector((state) => state.location.origin);
    const destination = useSelector((state) => state.location.destination);
    const waypoints = useSelector((state) => state.location.waypoints);
    const transitMode = useSelector((state) => state.location.transitMode);
    const distance = useSelector((state) => state.location.distance);
    const eta = useSelector((state) => state.location.eta);

    const handleCalculate = () => {
        dispatch(updateInitiated(true));
    }

    const changeTransitMode = (mode) => {
        dispatch(updateTransitMode(mode));
    }

    const transitModeOptions = [
        {
            mode: 'drive',
            icon: <DriveEtaOutlined />
        },
        {
            mode: 'walk',
            icon: <DirectionsWalkOutlined />,
        },
        {
            mode: 'motorcycle',
            icon: <TwoWheelerOutlined />
        },
        {
            mode: 'bicycle',
            icon: <DirectionsBikeOutlined />,
        }
    ]

    const addWaypoint = () => {
        setAddStop(true);
        dispatch(updateWaypoints(''));
        console.log(waypoints);
    }

    const removeWaypoint = (index) => {
        dispatch(deleteWaypoints(index));
    }

    return (
        <>
            <div className="formOuter">
                <div className="formHeading">
                    <Typography variant="h6" style={{ textAlign: "center", color: "#1B31A8" }}>
                        Let's calculate <b>distance</b> from Google maps
                    </Typography>
                </div>
                <div className="formBody">
                    <div className="mapComponent">
                        <Map />
                    </div>
                    <div className="formInner">
                        <div className="formUp">
                            <div className="formLeft">
                                <div className="originField">
                                    <label htmlFor="origin">Origin</label>
                                    <Autocomplete placeholder={'Enter Origin'} reducer={updateOrigin} />
                                </div>

                                {waypoints.map((waypoint, index) => (
                                    <div key={index}>
                                        <Autocomplete placeholder={`Enter Stop ${index + 1}`} reducer={updateWaypoints} index={index} />

                                        <Button onClick={() => removeWaypoint(index)} variant="outlined" style={{ fontSize: '0.8rem', color: '#1B31A8', border: '2px solid #1B31A8' }} >Remove</Button>
                                    </div>
                                ))}
                                <div className="addStopButton">
                                    <Button variant="outlined" onClick={addWaypoint} style={{ fontSize: '0.8rem', color: '#1B31A8', border: '2px solid #1B31A8' }}>Add another stop</Button>

                                </div>

                                <div className="destinationField">
                                    <label htmlFor="destination">Destination</label>
                                    <Autocomplete placeholder={"Enter Destination"} reducer={updateDestination} />
                                </div>
                                <div className="transitOption">
                                    {transitModeOptions.map((mode) => (
                                        <div key={mode.mode} className={`transitMode ${transitMode === mode.mode ? 'active' : ''}`} onClick={() => changeTransitMode(mode.mode)} title={mode.mode}>
                                            {mode.icon}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="formRight">
                                <Button variant="contained" style={{ backgroundColor: "#1B31A8", color: "#fff", borderRadius: "30px", padding: "10px 20px" }} onClick={handleCalculate}>Calculate</Button>
                            </div>
                        </div>
                        <div className="formDown">
                            <div className="formDownDistance">
                                <div className="distanceText">
                                    <Typography variant="h6">
                                        <b>Distance</b>
                                    </Typography>
                                </div>
                                <div className="calculatedDistance">
                                    <Typography variant="h4" style={{ color: '#1B31A8' }}>
                                        {distance && (distance + 'kms')}
                                    </Typography>
                                </div>
                            </div>
                            <div className="formDownDescription">
                                {distance && <Typography variant="body1">
                                    The distance between <b>{origin.formatted}</b> and <b>{destination.formatted}</b> via the seleted route is <b>{distance} kms</b>. The estimated time of arrival by <b>{transitMode}</b> is <b>{eta} hours</b>.
                                </Typography>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Form;