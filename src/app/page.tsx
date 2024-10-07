"use client";

import axios from "axios";
import { useState } from "react";
import ReactSelect from "react-select";
import PlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-places-autocomplete';
import MapComponent from './MapComponent';  // Import the MapComponent
import Image from "next/image";

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

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const generateImage = async () => {
    setImageLoading(true);
    setImageUrl(null);

    try {
      const response = await axios.post('/api/generate-image', {
        prompt: 'A beautiful morning-themed image with a steaming cup of coffee, a rose, and warm colors. Include coffee beans scattered on the surface and a heart symbol or other gentle decoration to emphasize the friendly and inviting tone.',
      });

      setImageUrl(response.data.url);
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setImageLoading(false);
    }
  };

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
    <div className="min-h-screen bg-gradient-to-r from-amber-100 via-cyan-100 to-amber-200 flex flex-col justify-center items-center p-8 fade-in">
      {/* Main container with smooth transitions */}
      <main className="bg-white p-8 rounded-lg shadow-lg w-full max-w-4xl">
        {/* Personalized Header */}
        <br></br>
        <h1 className="text-4xl font-extrabold mb-4 text-center text-amber-600">Labas! Rask tobulą vietą savo kitam susitikimui</h1>
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
                    {...getInputProps({ placeholder: 'Įvesk pirmą adresą (pvz. savo namus arba ofisą)' })}
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
                    {...getInputProps({ placeholder: 'Įvesk antrą adresą (pvz. draugės namus arba ofisą)' })}
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
            <div className="spinner-border animate-spin rounded-full h-10 w-10 border-4 border-b-amber-600 border-t-transparent border-l-amber-500 border-r-transparent"></div>
          ) : (
            <button
              onClick={handleSearch}
              className="w-3/4 p-3 bg-amber-700 text-white rounded hover:bg-amber-600 transition ease-in-out duration-300"
            >
              Rasti vietas
            </button>
          )}
        </div>

        {/* Display Results with Maps */}
        <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-4 justify-centerflex flex-wrap justify-center">
          {results.map((result, index) => (
            <div key={index} className="border p-4 rounded bg-gray-100 mb-4 fade-in">
              <a
                href={`https://maps.google.com/?q=place_id:${result.place_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:underline transition ease-in-out duration-300"
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
                      className="text-amber-700 hover:underline"
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
        <br /><br /><br /><br /><br />

        <button
          onClick={generateImage}
          className={`${imageLoading
            ? "animate-colorChange"
            : "bg-amber-700 hover:bg-amber-600"
            } text-white px-4 py-2 rounded transition-colors duration-300 ease-in-out`}
          disabled={imageLoading}
        >
          {imageLoading ? 'Tuoj, minutėlę...' : 'Noriu kavytės paveikslėlio gerai dienai ☕'}
        </button>

        <br />
        <br />
        <br />

        <a
          href={"https://buy.stripe.com/00g9EcfRS96Vb3qdQQ"}
          target="_blank"
          className={`${imageLoading
            ? "animate-colorChange"
            : "bg-amber-700 hover:bg-amber-600"
            } text-white px-4 py-2 rounded transition-colors duration-300 ease-in-out`}
        >
          O gal norite nupirkti mums kavos? :)
        </a>

        {imageUrl && (
          <div className="mt-6">
            <Image
              height={1024}
              width={1024}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAKAAoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwDfooorwj2j/9k="
              src={imageUrl}
              alt="Generated Morning Image"
              className="max-w-full rounded-lg shadow-lg"
            />
          </div>
        )}

      </main>

      <footer className="mt-8 text-gray-600 text-sm">
        Powered by <a href={"https://www.codolab.com/"}>Codo Lab</a>
      </footer>
    </div>

  );
}
