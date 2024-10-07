"use client";

import axios from "axios";
import { useState } from "react";
import ReactSelect from "react-select";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import MapComponent from './MapComponent';  // Import the MapComponent

// Dropdown options for meeting purpose
const purposes = [
  { value: 'coffee', label: 'Kava' },
  { value: 'lunch', label: 'Pietūs' },
  { value: 'children playground', label: 'Vaikų žaidimų aikštelė' },
  { value: 'bar', label: 'Baras' },
];

// Define the type of each result object
interface SpotResult {
  name: string;
  formatted_address: string;
  address: string;
  reviews: Review[],
  profile_photo_url: string,
  place_id: string,
}

interface Review {
  profile_photo_url: string;
  author_name: string;
  author_url: string;
  relative_time_description: string;
  text: string;
}

export default function Home() {
  const [purpose, setPurpose] = useState<{ value?: string } | null>(null);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [results, setResults] = useState<SpotResult[]>([]);  // Now results is an array of objects
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ sender: string, text: string }[]>([]); // Messages state

  const handleSearch = async () => {
    setLoading(true); // Show loading indicator
    const newMessages = [...messages, { sender: 'user', text: `Ieškoma vietų ${purpose?.value} tarp ${address1} ir ${address2}.` }];
    setMessages(newMessages);

    try {
      // Request Google Places API to get businesses between two addresses
      const response = await axios.post('/api/find', {
        purpose: purpose?.value,
        address1,
        address2,
      });

      const spots: SpotResult[] = response.data;  // Assuming the response is an array of objects with 'name' and 'address'
      console.log(spots);

      setResults(spots);  // Update results to display the three suggestions
      setMessages([...newMessages, { sender: 'ChatGPT', text: 'Čia yra geriausios vietos, kurias radau:' }]);
    } catch (error) {
      console.error("Klaida randant vietas:", error);
      setMessages([...newMessages, { sender: 'bot', text: 'Atsiprašome, įvyko klaida!' }]);
    } finally {
      setLoading(false); // Hide loading indicator
    }
  };


  // Handle address selection from PlacesAutocomplete
  const handleSelect = async (address: string, setAddress: (value: string) => void) => {
    setAddress(address);
    try {
      const results = await geocodeByAddress(address);
      const latLng = await getLatLng(results[0]);
      console.log(latLng); // Optional: Use lat/lng for further logic
    } catch (error) {
      console.error('Klaida', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-cyan-100 to-blue-200 flex flex-col justify-center items-center p-8 fade-in">
      {/* Main container with smooth transitions */}
      <main className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        {/* Personalized Header */}
        <h1 className="text-4xl font-extrabold mb-4 text-center text-blue-600">Labas! Rask tobulą vietą savo kitam susitikimui</h1>
        <p className="text-xl text-gray-700 text-center mb-8">Sužinok, kur susitikti pusiaukelėje kavutės, pietų ar vaikų žaidimų aikštelėje.</p>

        {/* Purpose Selection */}
        <div className="mb-4 flex justify-center">
          <div className="w-3/4">
            <ReactSelect
              options={purposes}
              onChange={setPurpose}
              placeholder="Pasirinkite tikslą (arba ne!)"
              className="w-full text-black"
            />
          </div>
        </div>

        {/* Address 1 Autocomplete */}
        <div className="mb-4 flex justify-center">
          <div className="w-3/4">
            <PlacesAutocomplete
              value={address1}
              onChange={setAddress1}
              onSelect={(address) => handleSelect(address, setAddress1)}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                  <input
                    {...getInputProps({ placeholder: 'Įveskite pirmą adresą' })}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  />
                  <div className="absolute bg-white shadow-lg mt-1 z-10"> {/* Changed to absolute and z-10 for dropdown positioning */}
                    {loading && <div className="text-center p-2 text-black">Įkeliama...</div>}
                    {suggestions.map(suggestion => (
                      <div
                        {...getSuggestionItemProps(suggestion)}
                        key={suggestion.placeId}
                        className="p-2 cursor-pointer hover:bg-gray-100 text-black"
                      >
                        {suggestion.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
          </div>
        </div>

        {/* Address 2 Autocomplete */}
        <div className="mb-4 flex justify-center relative"> {/* Added relative to parent div */}
          <div className="w-3/4">
            <PlacesAutocomplete
              value={address2}
              onChange={setAddress2}
              onSelect={(address) => handleSelect(address, setAddress2)}
            >
              {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => (
                <div>
                  <input
                    {...getInputProps({ placeholder: 'Įveskite antrą adresą' })}
                    className="w-full p-2 border border-gray-300 rounded text-black"
                  />
                  <div className="absolute bg-white shadow-lg mt-1 w-full z-10"> {/* Changed to absolute and z-10 for dropdown positioning */}
                    {loading && <div className="text-center p-2 hover:bg-gray-100 text-black">Įkeliama...</div>}
                    {suggestions.map(suggestion => (
                      <div
                        {...getSuggestionItemProps(suggestion)}
                        key={suggestion.placeId}
                        className="p-2 cursor-pointer hover:bg-gray-100 text-black"
                      >
                        {suggestion.description}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </PlacesAutocomplete>
          </div>
        </div>

        {/* Search Button with Spinner */}
        <div className="mb-6 flex justify-center">
          {loading ? (
            <div className="spinner-border text-blue-500 animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          ) : (
            <button
              onClick={handleSearch}
              className="w-3/4 p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition ease-in-out duration-300"
            >
              Rasti vietas
            </button>
          )}
        </div>

        {/* Display Results with Maps */}
        <div className="flex flex-wrap justify-center">
          {results.map((result, index) => (
            <div key={index} className="border p-4 w-1/2 rounded bg-gray-100 mb-4 fade-in">
              <a
                href={`https://maps.google.com/?q=place_id:${result.place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline transition ease-in-out duration-300"
              >
                <p className="font-semibold">{result.name}</p>
              </a>
              <p className="text-gray-600">{result.formatted_address}</p>

              <MapComponent address={result.formatted_address} />  {/* Display map for each result */}
              <br /><br />
              <div className="text-gray-600">Ką sako entuziastai:</div>

              {/* Display user reviews */}
              {result.reviews?.map((review, reviewIndex) => (
                <div key={reviewIndex} className="mt-4 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <img
                      src={review.profile_photo_url}
                      alt={`${review.author_name}'s profile`}
                      className="w-8 h-8 rounded-full"
                    />
                    <a
                      href={review.author_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {review.author_name}
                    </a>
                  </div>
                  <p className="text-gray-500 text-sm">{review.relative_time_description}</p>
                  <p className="mt-2 text-gray-700">{review.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>

      </main>

      <footer className="mt-8 text-gray-600 text-sm">
        Powered by Codo Lab
      </footer>
    </div>

  );
}
