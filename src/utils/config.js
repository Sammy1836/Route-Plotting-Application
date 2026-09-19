const apiKey = import.meta.env.VITE_API_KEY;

if (!apiKey) {
    console.warn(
        '[config] VITE_API_KEY is not set. Copy .env.example to .env and add your Geoapify API key.'
    );
}

export const GEOAPIFY_API_KEY = apiKey;
