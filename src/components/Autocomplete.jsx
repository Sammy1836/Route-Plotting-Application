import React, { useState } from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { updateIsInput } from '../redux/locationSlice';

const Autocomplete = ({ placeholder, reducer }) => {
    const dispatch = useDispatch();

    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [debounceTimer, setDebounceTimer] = useState(null);

    const handleChange = (event) => {
        const value = event.target.value;
        setQuery(value);

        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        setDebounceTimer(setTimeout(() => {
            fetchSuggestions(value);
        }, 500));
    };

    const fetchSuggestions = async (value) => {
        if (value.length > 2) {
            try {
                const response = await axios.get(
                    `https://api.geoapify.com/v1/geocode/autocomplete`,
                    {
                        params: {
                            text: value,
                            apiKey: API_KEY,
                        }
                    }
                );

                setSuggestions(response.data.features);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (suggestion) => {
        setQuery(suggestion.properties.formatted);
        dispatch(reducer(suggestion.properties));
        dispatch(updateIsInput(true));
        setSuggestions([]);
    };

    return (
        <div className='autocompleteInput'>
            <input
                type="text"
                value={query}
                onChange={handleChange}
                placeholder={placeholder}
            />
            {suggestions.length > 0 && (
                <div className='suggestionsTab'>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(suggestion)}
                            style={{ cursor: 'pointer', listStyleType: 'none', padding: '5px' }}
                        >
                            <div className="suggestionPlace">
                                <LocationOnIcon style={{
                                    paddingRight: '5px'
                                }} />
                                {suggestion.properties.formatted}
                            </div>
                        </li>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Autocomplete;
