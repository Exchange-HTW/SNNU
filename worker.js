export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/unity/data") {
      const response = await fetch(
        "https://github.com/Exchange-HTW/htwvideos/releases/download/webpageunity/VirtualTourVRweb.data"
      );

      return new Response(response.body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/octet-stream"
        }
      });
    }

    if (url.pathname === "/unity/wasm") {
      const response = await fetch(
        "https://github.com/Exchange-HTW/htwvideos/releases/download/webpageunity/VirtualTourVRweb.wasm"
      );

      return new Response(response.body, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/wasm"
        }
      });
    }

    return fetch(request);
  }
};
