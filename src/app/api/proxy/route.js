import axios from 'axios';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const path = searchParams.get('path'); // Get the 'path' query parameter

  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing "path" query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const url = `https://teal-nearby-swift-686.mypinata.cloud/ipfs/${path}`;

  try {
    const response = await axios.get(url, {
      headers: { 'Content-Type': 'application/json' },
      responseType: 'stream',
    });

    return new Response(response.data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '14400',
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch data from Pinata.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
