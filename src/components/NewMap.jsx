import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

const NewMap = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [route, setRoute] = useState(null);
  const [transitMode, setTransitMode] = useState('drive');
  const [distance, setDistance] = useState(null);
  const [eta, setEta] = useState(null);

  const geoapifyApiKey = 'd7d862e3a8b446009c7d46ace01d67f0';

  const addWaypoint = () => {
    setWaypoints([...waypoints, '']);
  };

  const removeWaypoint = (index) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints.splice(index, 1);
    setWaypoints(updatedWaypoints);
  };

  const handleChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handlePlaceSelect = async (value, setter) => {
    try {
      const response = await axios.get(
        `https://api.geoapify.com/v1/geocode/autocomplete`,
        {
          params: {
            text: value,
            apiKey: geoapifyApiKey,
          },
        }
      );
      const place = response.data.features[0];
      const location = {
        lat: place.properties.lat,
        lng: place.properties.lon,
        formatted: place.properties.formatted,
      };
      setter(location);
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const fetchRoute = async () => {
    const waypointsStr = waypoints
      .map((wp) => `${wp.lat},${wp.lng}`)
      .join('|');
    const transit = {
      drive: 'car',
      bike: 'bike',
      walk: 'walk',
    }[transitMode];

    const response = await axios.get(
      `https://api.geoapify.com/v1/routing`,
      {
        params: {
          waypoints: `${origin.lat},${origin.lng}|${waypointsStr}|${destination.lat},${destination.lng}`,
          mode: transit,
          apiKey: geoapifyApiKey,
        },
      }
    );

    const routeData = response.data.features[0];
    setRoute(routeData.geometry.coordinates);
    setDistance(routeData.properties.distance);
    setEta(routeData.properties.time);
  };

  return (
    <div className="App">
      <h1>Geoapify Routing with Stops</h1>
      <div className="input-container">
        <input
          type="text"
          placeholder="Origin"
          value={origin.formatted || ''}
          onChange={handleChange((value) => handlePlaceSelect(value, setOrigin))}
        />
        <input
          type="text"
          placeholder="Destination"
          value={destination.formatted || ''}
          onChange={handleChange((value) => handlePlaceSelect(value, setDestination))}
        />
        {waypoints.map((waypoint, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder={`Stop ${index + 1}`}
              value={waypoint.formatted || ''}
              onChange={handleChange((value) => handlePlaceSelect(value, (location) => {
                const updatedWaypoints = [...waypoints];
                updatedWaypoints[index] = location;
                setWaypoints(updatedWaypoints);
              }))}
            />
            <button onClick={() => removeWaypoint(index)}>Delete</button>
          </div>
        ))}
        <button onClick={addWaypoint}>Add Stop</button>
      </div>
      <div className="transit-options">
        <label>
          <input
            type="radio"
            value="drive"
            checked={transitMode === 'drive'}
            onChange={(e) => setTransitMode(e.target.value)}
          />
          Car
        </label>
        <label>
          <input
            type="radio"
            value="bike"
            checked={transitMode === 'bike'}
            onChange={(e) => setTransitMode(e.target.value)}
          />
          Bike
        </label>
        <label>
          <input
            type="radio"
            value="walk"
            checked={transitMode === 'walk'}
            onChange={(e) => setTransitMode(e.target.value)}
          />
          Walk
        </label>
      </div>
      <button onClick={fetchRoute}>Get Route</button>
      {route && (
        <MapContainer center={[origin.lat, origin.lng]} zoom={13} style={{ height: '500px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <Polyline positions={route.map(coord => [coord[1], coord[0]])} color="blue" />
          <Marker position={[origin.lat, origin.lng]}>
            <Popup>Origin: {origin.formatted}</Popup>
          </Marker>
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>Destination: {destination.formatted}</Popup>
          </Marker>
          {waypoints.map((waypoint, index) => (
            <Marker key={index} position={[waypoint.lat, waypoint.lng]}>
              <Popup>Stop {index + 1}: {waypoint.formatted}</Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
      {distance && <p>Distance: {distance} meters</p>}
      {eta && <p>ETA: {Math.round(eta / 60)} minutes</p>}
    </div>
  );
};

export default NewMap;
