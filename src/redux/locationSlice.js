import { createSlice, nanoid } from "@reduxjs/toolkit";

const emptyLocation = { lat: null, lon: null, formatted: "" };

const initialState = {
    origin: {
        lat: 28.6138954,
        lon: 77.2090057,
        formatted: ''
    },
    destination: {
        lat: null,
        lon: null,
        formatted: ''
    },
    waypoints: [],
    transitMode: 'drive',
    distance: null,
    eta: null,
    legs: [],
    initiated: false,
    isInput: false,
    loading: false,
    showRadial: false,
}

export const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        updateOrigin: (state, action) => {
            state.origin = { ...state.origin, ...action.payload };
        },
        updateDestination: (state, action) => {
            state.destination = { ...state.destination, ...action.payload };
        },
        addWaypoint: (state) => {
            state.waypoints.push({ id: nanoid(), ...emptyLocation });
        },
        updateWaypoint: (state, action) => {
            const { id, location } = action.payload;
            const waypoint = state.waypoints.find((way) => way.id === id);
            if (waypoint) {
                waypoint.lat = location.lat ?? null;
                waypoint.lon = location.lon ?? null;
                waypoint.formatted = location.formatted ?? '';
            }
        },
        deleteWaypoint: (state, action) => {
            state.waypoints = state.waypoints.filter((way) => way.id !== action.payload);
        },
        reorderWaypoints: (state, action) => {
            const { activeId, overId } = action.payload;
            const from = state.waypoints.findIndex((way) => way.id === activeId);
            const to = state.waypoints.findIndex((way) => way.id === overId);
            if (from === -1 || to === -1 || from === to) return;

            const [moved] = state.waypoints.splice(from, 1);
            state.waypoints.splice(to, 0, moved);
        },
        swapEndpoints: (state) => {
            const { origin, destination } = state;
            state.origin = destination;
            state.destination = origin;
            state.waypoints = [...state.waypoints].reverse();
        },
        updateTransitMode: (state, action) => {
            state.transitMode = action.payload;
        },
        updateRoute: (state, action) => {
            const { distance, time, legs } = action.payload;
            state.distance = (distance / 1000).toFixed(2);
            state.eta = (time / (60 * 60)).toFixed(2);
            state.legs = (legs ?? []).map((leg) => ({
                distance: leg.distance / 1000,
                time: leg.time / (60 * 60),
            }));
        },
        clearRoute: (state) => {
            state.distance = null;
            state.eta = null;
            state.legs = [];
        },
        resetAll: () => initialState,
        updateInitiated: (state, action) => {
            state.initiated = action.payload;
        },
        updateIsInput: (state, action) => {
            state.isInput = action.payload;
        },
        updateLoading: (state, action) => {
            state.loading = action.payload;
            if (action.payload) {
                state.initiated = false;
            }
        },
        toggleShowRadial: (state) => {
            state.showRadial = !state.showRadial;
        }
    }
})

export const {
    updateOrigin,
    updateDestination,
    addWaypoint,
    updateWaypoint,
    deleteWaypoint,
    reorderWaypoints,
    swapEndpoints,
    updateTransitMode,
    updateRoute,
    clearRoute,
    resetAll,
    updateInitiated,
    updateIsInput,
    updateLoading,
    toggleShowRadial,
} = locationSlice.actions;

export default locationSlice.reducer;
