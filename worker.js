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

    if (url.pathname === "/unity/video360") {
      // Manejar solicitudes OPTIONS (Preflight)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            "Access-Control-Allow-Headers": "Range",
            "Access-Control-Max-Age": "86400"
          }
        });
      }

      const requestHeaders = new Headers(request.headers);
      const response = await fetch(
        "https://github.com/Exchange-HTW/SNNU/releases/download/360/360Vid.mp4",
        {
          method: request.method,
          headers: requestHeaders,
          redirect: "follow"
        }
      );

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("Access-Control-Expose-Headers", "Content-Length, Content-Range");
      responseHeaders.set("Content-Type", "video/mp4");

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }

    return fetch(request);
  }
};
