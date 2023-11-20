function setup() {
  noCanvas();

  // Create input field and button for user prompt
  let prompt = createInput('Type your prompt here');
  prompt.style('width', '400px');
  createButton('generateText').mousePressed(generateText);
  // Response from model
  let botRepsonse = createP('');

  async function generateText() {
    // Send a POST request to the server with the user's prompt
    const response = await fetch('/api/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: prompt.value() }),
    });

    // Initialize a stream reader from the server response
    const reader = response.body.getReader();
    // Continuously read data from the stream
    while (true) {
      const { done, value } = await reader.read();
      // Stop when it's done!
      if (done) break;
      // The 'value' is a Uint8Array containing the streamed binary data
      // TextDecoder converts this binary data into a human-readable string
      botRepsonse.html(botRepsonse.html() + new TextDecoder().decode(value));
    }
  }
}
