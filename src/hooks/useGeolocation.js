import { useState } from "react";

export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  function getPosition() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setIsLoading(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setError("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            setError("An unknown error occurred.");
            break;
          default:
            setError("An error occurred while fetching geolocation.");
        }
        setIsLoading(false);
      }
    );
  }

  return { isLoading, position, error, getPosition };
}
