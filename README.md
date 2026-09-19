# Route Plotting Application

A simple one-page web app using React.js that allows users to input an origin and destination, and plot the route on a map with distance calculations. This project uses `React Leaflet` for maps and Geoapify for route calculation.

## Features

- **Location Input**: Auto-suggest location inputs for origin and destination with keyboard navigation.
- **Organizable Stops**: Add multiple stops and drag-and-drop to reorder them with smooth animations.
- **Route Calculation**: Plot the route on a map and calculate distance and ETA using the Geoapify API.
- **Road vs radial distance**: See the total driving distance alongside the straight-line (as-the-crow-flies) distance, plus a per-leg breakdown.
- **Transit Options**: Choose between car, walk, motorcycle and bicycle.
- **Map tools**: Auto-fit bounds, numbered stop markers and an optional straight-line overlay.
- **Swap & Reset**: Swap origin/destination in one tap or reset the whole trip.

## Technologies Used

- React.js
- React Leaflet
- dnd-kit (drag-and-drop reordering)
- Geoapify API (for route calculation & places autocomplete)
- Axios (for API requests)
- Redux Toolkit

