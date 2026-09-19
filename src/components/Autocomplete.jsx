import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateIsInput } from '../redux/locationSlice';

const apikey = import.meta.env.VITE_API_KEY || 'd7d862e3a8b446009c7d46ace01d67f0';

const Autocomplete = ({ placeholder, value = '', onSelect }) => {
    const dispatch = useDispatch();

    const [query, setQuery] = useState(value);
    const [suggestions, setSuggestions] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const debounceRef = useRef(null);
    const requestRef = useRef(0);
    const containerRef = useRef(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        return () => clearTimeout(debounceRef.current);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (text) => {
        if (text.trim().length < 3) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        const requestId = ++requestRef.current;
        setLoading(true);
        try {
            const response = await axios.get(
                `https://api.geoapify.com/v1/geocode/autocomplete`,
                {
                    params: {
                        text,
                        limit: 6,
                        apiKey: apikey,
                    },
                }
            );

            if (requestId !== requestRef.current) return;
            setSuggestions(response.data.features ?? []);
            setActiveIndex(-1);
        } catch (error) {
            if (requestId === requestRef.current) {
                console.error('Error fetching suggestions:', error);
            }
        } finally {
            if (requestId === requestRef.current) {
                setLoading(false);
            }
        }
    };

    const handleChange = (event) => {
        const next = event.target.value;
        setQuery(next);
        setOpen(true);

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => fetchSuggestions(next), 300);
    };

    const choose = (suggestion) => {
        const place = suggestion.properties;
        setQuery(place.formatted);
        setSuggestions([]);
        setOpen(false);
        setActiveIndex(-1);
        onSelect?.({
            lat: place.lat,
            lon: place.lon,
            formatted: place.formatted,
        });
        dispatch(updateIsInput(true));
    };

    const handleKeyDown = (event) => {
        if (!open || suggestions.length === 0) {
            if (event.key === 'ArrowDown') setOpen(true);
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setActiveIndex((prev) => (prev + 1) % suggestions.length);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        } else if (event.key === 'Enter') {
            event.preventDefault();
            choose(suggestions[activeIndex === -1 ? 0 : activeIndex]);
        } else if (event.key === 'Escape') {
            setOpen(false);
        }
    };

    const showSuggestions = open && (suggestions.length > 0 || loading);

    return (
        <div className='autocompleteInput' ref={containerRef}>
            <input
                type="text"
                value={query}
                onChange={handleChange}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck="false"
            />
            {showSuggestions && (
                <div className='suggestionsTab'>
                    {loading && suggestions.length === 0 && (
                        <div className="suggestionStatus">Searching…</div>
                    )}
                    {suggestions.map((suggestion, index) => (
                        <button
                            type="button"
                            key={suggestion.properties.place_id ?? index}
                            onClick={() => choose(suggestion)}
                            onMouseEnter={() => setActiveIndex(index)}
                            className={`suggestionItem ${index === activeIndex ? 'active' : ''}`}
                        >
                            <LocationOnIcon fontSize="small" />
                            <span className="suggestionText">
                                <span className="suggestionTitle">
                                    {suggestion.properties.name || suggestion.properties.address_line1 || suggestion.properties.formatted}
                                </span>
                                {suggestion.properties.formatted !== suggestion.properties.name && (
                                    <span className="suggestionSubtitle">{suggestion.properties.formatted}</span>
                                )}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

Autocomplete.propTypes = {
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onSelect: PropTypes.func,
};

export default Autocomplete;
