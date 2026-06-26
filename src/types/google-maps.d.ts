declare global {
  interface Window {
    google?: typeof google;
  }

  namespace google.maps {
    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
    interface LatLngBoundsLiteral {
      west: number;
      north: number;
      east: number;
      south: number;
    }
    interface CircleLiteral {
      center: LatLngLiteral;
      radius: number;
    }
    function importLibrary(name: "places"): Promise<{
      PlaceAutocompleteElement: new (
        options?: google.maps.places.PlaceAutocompleteElementOptions
      ) => google.maps.places.PlaceAutocompleteElement;
    }>;
  }

  namespace google.maps.places {
    interface PlaceAutocompleteElementOptions {
      includedRegionCodes?: string[];
      includedPrimaryTypes?: string[];
      locationBias?: google.maps.LatLngBoundsLiteral | google.maps.CircleLiteral | null;
      locationRestriction?: google.maps.LatLngBoundsLiteral | null;
    }

    class PlaceAutocompleteElement extends HTMLElement {
      constructor(options?: PlaceAutocompleteElementOptions);
    }

    interface PlacePredictionSelectEvent extends Event {
      placePrediction: PlacePrediction;
    }

    interface PlacePrediction {
      toPlace(): Place;
      text?: { text?: string };
    }

    interface Place {
      formattedAddress?: string;
      location?: google.maps.LatLngLiteral;
      fetchFields(options: { fields: string[] }): Promise<void>;
    }
  }

  const google: {
    maps: typeof google.maps;
  };
}

export {};
