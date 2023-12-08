// Import  modules and initialize environment variables
import Replicate from 'replicate';
import express from 'express';
import bodyParser from 'body-parser';
// Import EventSource for handling Server-Sent Events (SSE)
import EventSource from 'eventsource';
import * as dotenv from 'dotenv';
dotenv.config();

// Set up Express app and middleware
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

app.post('/api/text', async (request, response) => {
  // Define the model version and input options
  const version = '8e6975e5ed6174911a6ff3d60540dfd4844201974602551e10e9e87ab143d81e';
  const model = 'meta/llama-2-7b-chat';
  const options = {
    version,
    input: {
      prompt: request.body.prompt,
      system_prompt: 'You are the Llama AI model hosted on Replicate.',
    },
    // Enable streaming
    stream: true,
  };
  // Create a prediction request to Replicate API
  const prediction = await replicate.predictions.create(options);
  // console.log(prediction);

  // Check if streaming URL is available in the prediction response
  if (prediction && prediction.urls && prediction.urls.stream) {
    // Initialize EventSource for streaming
    const source = new EventSource(prediction.urls.stream, { withCredentials: true });

    // Handle 'output' event for streaming data to client
    source.addEventListener('output', (e) => {
      response.write(e.data);
    });

    // Handle 'error' event during streaming
    source.addEventListener('error', (e) => {
      console.error('error', e);
      response.end();
    });

    // Handle 'done' event when streaming is complete
    source.addEventListener('done', (e) => {
      source.close();
      console.log('done', e);
      response.end();
    });
  } else {
    // Send error response if streaming is not supported or prediction failed
    response.status(500).send('Streaming not supported or prediction failed');
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
