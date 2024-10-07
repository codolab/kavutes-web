import { NextResponse } from 'next/server';
import axios from 'axios';

const openaiApiKey = process.env.OPENAI_API_KEY;

export async function POST() {
  // const { prompt } = await req.json();

  const prompt = "A beautiful photorealistic morning-themed image with a steaming cup of coffee, a rose. The scene should feel cozy and welcoming, with warm colors and details like coffee beans scattered on the surface. Include a heart symbol or other gentle decoration to emphasize the friendly and inviting tone."

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const imageUrl = response.data.data[0].url;
    console.log(imageUrl);
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error generating image' }, { status: 500 });
  }
}
