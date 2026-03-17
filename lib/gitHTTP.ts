export const gitHTTP = {
  async request({ url, method, headers, body }: any) {
    let fetchBody: Uint8Array | undefined;

    if (body) {
      const chunks = [];
      let totalLength = 0;
      for await (const chunk of body) {
        chunks.push(chunk);
        totalLength += chunk.length;
      }
      
      fetchBody = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        fetchBody.set(chunk, offset);
        offset += chunk.length;
      }
    }

    const res = await fetch(url, { 
      method, 
      headers, 
      body: fetchBody 
    });
    
    const arrayBuffer = await res.arrayBuffer();
    
    return {
      url: res.url,
      method: res.method || method,
      headers: Object.fromEntries(res.headers.entries()),
      body: [new Uint8Array(arrayBuffer)],
      statusCode: res.status,
      statusMessage: res.statusText,
    };
  },
};

