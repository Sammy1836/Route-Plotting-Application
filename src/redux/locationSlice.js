import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    origin: {
        lat: 28.6138954,
        lon: 77.2090057,
        formatted: ''
    },
    destination: {
        lat: 0,
        lon: 0,
        formatted: ''
    },
    waypoints: [],
    transitMode: 'drive',
    distance: null,
    eta: null,
    initiated: false,
    isInput: false,
}

export const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        updateOrigin: (state, action) => {
            state.origin.lat = action.payload.lat;
            state.origin.lon = action.payload.lon;
            state.origin.formatted = action.payload.formatted;
        },
        updateDestination: (state, action) => {
            state.destination.lat = action.payload.lat;
            state.destination.lon = action.payload.lon;
            state.destination.formatted = action.payload.formatted;
        },
        updateWaypoints: (state, action) => {
            {
                if (action.payload.length > 0) {
                    const lat = action.payload[0].lat;
                    const lon = action.payload[0].lon;
                    const formatted = action.payload[0].formatted;
                    const index = action.payload[1];

                    state.waypoints[index] =
                    {
                        lat: lat,
                        lon: lon,
                        formatted: formatted
                    };

                }
                else
                    state.waypoints = [...state.waypoints, '']
            }
            console.log(state.waypoints);
        },
        deleteWaypoints: (state, action) => {
            state.waypoints = state.waypoints.filter((_, index) => index !== action.payload)
        },
        updateTransitMode: (state, action) => {
            state.transitMode = action.payload;
        },
        updateRoute: (state, action) => {
            state.distance = (action.payload.distance / 1000).toFixed(2);
            state.eta = (action.payload.time / (60 * 60)).toFixed(2);
        },
        updateInitiated: (state, action) => {
            state.initiated = action.payload;
        },
        updateIsInput: (state, action) => {
            state.isInput = action.payload;
        }
    }
})

export const { updateOrigin, updateDestination, updateWaypoints, deleteWaypoints, updateTransitMode, updateRoute, updateInitiated, updateIsInput } = locationSlice.actions;

export default locationSlice.reducer;