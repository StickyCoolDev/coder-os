export const gitHTTP = {
  async request({ url, method, headers, body }: any) {
    const res = await fetch(url, { method, headers, body });
    const arrayBuffer = await res.arrayBuffer();
    return {
      url: res.url,
      method: method,
      headers: Object.fromEntries(res.headers.entries()),
      body: [new Uint8Array(arrayBuffer)],
      statusCode: res.status,
      statusMessage: res.statusText,
    };
  },
};

