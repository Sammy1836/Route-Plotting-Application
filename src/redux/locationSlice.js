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

export const { updateOrigin, updateDestination, updateTransitMode, updateRoute, updateInitiated, updateIsInput } = locationSlice.actions;

export default locationSlice.reducer;