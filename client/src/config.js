const localServerUrl = "http://127.0.0.1:8000";

export const serverUrl =
  import.meta.env.VITE_SERVER_URL || localServerUrl;
