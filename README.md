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

## Environment Variables

Create a `.env` file in the project root (copy `.env.example`) and set:

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_KEY` | Yes | Geoapify API key used for routing and places autocomplete. Get one at https://myprojects.geoapify.com. |

```bash
cp .env.example .env
# then edit .env and paste your key
```

`.env` is gitignored; never commit real keys. Note that Vite inlines `VITE_*`
variables into the client bundle, so the key is still visible to end users at
runtime — restrict it by domain in the Geoapify dashboard.


