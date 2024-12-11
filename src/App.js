import './App.css';
import { useEffect, useState } from 'react';

const App = () => {
  const [countries, setCountries] = useState([]); // All countries fetched from API
  const [visibleCountries, setVisibleCountries] = useState([]); // Countries progressively displayed
  const [searchTerm, setSearchTerm] = useState(''); // The search term entered by the user
  const [loading, setLoading] = useState(true); // Loading state for API requests
  const [error, setError] = useState(''); // Error state for any API errors

  // Fetch countries from API based on search term
  const fetchCountries = async (term) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        term
          ? `https://restcountries.com/v3.1/name/${term}?fields=name,flags,population`
          : 'https://restcountries.com/v3.1/all?fields=name,flags,population'
      );
      
      if (!response.ok) {
        throw new Error('No countries found.');
      }

      const data = await response.json();
      setCountries(data); // Set fetched countries
      setVisibleCountries([]); // Reset visible countries when search is updated
    } catch (err) {
      setError(err.message || 'Error while fetching countries.');
      setCountries([]);
      setVisibleCountries([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all countries when component mounts
  useEffect(() => {
    fetchCountries(); // Fetch countries initially without a search term
  }, []);

  // Effect to progressively show countries
  useEffect(() => {
    if (countries.length > 0) {
      let index = 0;
      const interval = setInterval(() => {
        if (index < countries.length) {
          // Prevent adding duplicate countries
          setVisibleCountries((prev) => {
            if (!prev.some((item) => item?.name?.common === countries[index]?.name?.common)) {
              return [...prev, countries[index]];
            }
            return prev;
          });
          index += 1;
        } else {
          clearInterval(interval); // Stop when all countries are displayed
        }
      }, 1000); // 1-second delay for each card
    }
  }, [countries]);

  // Handle search input change and fetch countries
  const handleSearchChange = (e) => {
    const term = e.target.value.trim();
    setSearchTerm(term);
    fetchCountries(term); // Fetch countries based on the search term
  };

  return (
    <div className="app">
      <h1>Country Explorer</h1>
      
      {/* Search Bar */}
      <input
        type="text"
        className="search-bar"
        placeholder="Search for a country..."
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {loading && (
        <div className="skeleton-container">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="skeleton-card"></div>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {!loading && !visibleCountries.length && !error && (
        <p className="no-results">No countries found.</p>
      )}

      <div className="countries-list">
        {visibleCountries.map((country) => (
          <div className="country-card" key={country?.name?.common || 'unknown'}>
            <img
              src={country?.flags?.png || 'https://via.placeholder.com/150'}
              alt={country?.name?.common || 'Unknown Country'}
              className="country-flag"
            />
            <h2 className="country-name">{country?.name?.common || 'Unknown Country'}</h2>
            <p className="country-population">
              Population: {country?.population ? country?.population?.toLocaleString() : 'N/A'}
            </p>
          </div>
        ))}

        {/* Skeleton Loaders for Remaining Cards */}
        {visibleCountries.length < countries.length &&
          Array(countries.length - visibleCountries.length)
            .fill(0)
            .map((_, i) => (
              <div className="skeleton-card" key={`skeleton-${i}`}></div>
            ))}
      </div>
    </div>
  );
};

export default App;
