export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/unity/data") {
      return fetch(
        "https://github.com/Exchange-HTW/htwvideos/releases/download/webpageunity/VirtualTourVRweb.data",
        {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    if (url.pathname === "/unity/wasm") {
      return fetch(
        "https://github.com/Exchange-HTW/htwvideos/releases/download/webpageunity/VirtualTourVRweb.wasm",
        {
          headers: {
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    return fetch(request);
  }
};
