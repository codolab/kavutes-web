import { CoreMessage, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { purpose, address1, address2 } = await req.json();

  // ChatGPT prompt messages
  const messages: CoreMessage[] = [
    {
      role: 'system',
      content: 'You are a helpful assistant that helps find meeting spots between two addresses. The address has to be highly rated, and the location has to be convenient for both parties.',
    },
    {
      role: 'user',
      content: `Find the best four spots for ${purpose} between ${address1} and ${address2}. The address has to be valid, ensure it is a real business. Each name and address pair (one line) has to be ended with a new line. No numbering.`,
    },
  ];

  // Get suggestions from ChatGPT
  const { text } = await generateText({
    model: openai('gpt-4o'),
    messages,
  });

  // Split the response from ChatGPT into separate locations (assuming new line separates them)
  const chatgptSuggestions = text.split('\n').filter(Boolean);

  console.log(chatgptSuggestions);

  // Google Place Search API URL
  const placesSearchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?inputtype=textquery&language=lt&input=`;

  // Google Place Details API URL
  const placeDetailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?language=lt&place_id=`;

  // Now validate the suggestions via Google Places API and fetch additional details
  const googlePlacesResults = await Promise.all(
    chatgptSuggestions.map(async (suggestion) => {
      // Fetch the place_id using the Find Place API
      const placesRes = await fetch(`${placesSearchUrl}${encodeURIComponent(suggestion)}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`);
      const placesData = await placesRes.json();

      // If a place_id is found, use it to fetch details
      if (placesData.candidates.length > 0) {
        const placeId = placesData.candidates[0].place_id;

        // Fetch place details using the place_id
        const placeDetailsRes = await fetch(`${placeDetailsUrl}${placeId}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`);
        const placeDetailsData = await placeDetailsRes.json();

        if (placeDetailsData.result) {
          const place = placeDetailsData.result;
          console.log(place);

          return place;
        }
      }

      // Return null if no place_id or details found
      return null;
    })
  );

  // Filter out null results (in case a place wasn't found by Google Places)
  const validPlaces = googlePlacesResults.filter(Boolean);
  console.log(validPlaces);

  return new Response(JSON.stringify(validPlaces), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
