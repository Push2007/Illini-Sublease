"use client";

import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  CHAMPAIGN_URBANA_BIAS,
  isGoogleMapsConfigured,
  loadGoogleMapsPlaces,
  parsePlaceLocation,
} from "@/lib/google-maps";

type AddressAutocompleteProps = {
  apiKey?: string;
  defaultValue?: string;
  defaultLatitude?: string;
  defaultLongitude?: string;
  fieldError?: string;
};

export function AddressAutocomplete({
  apiKey = "",
  defaultValue = "",
  defaultLatitude = "",
  defaultLongitude = "",
  fieldError,
}: AddressAutocompleteProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const latInputRef = useRef<HTMLInputElement>(null);
  const lngInputRef = useRef<HTMLInputElement>(null);
  const [address, setAddress] = useState(defaultValue);
  const [latitude, setLatitude] = useState(defaultLatitude);
  const [longitude, setLongitude] = useState(defaultLongitude);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapsConfigured = isGoogleMapsConfigured(apiKey);

  function applySelection(formatted: string, lat: number, lng: number) {
    const latStr = String(lat);
    const lngStr = String(lng);
    setAddress(formatted);
    setLatitude(latStr);
    setLongitude(lngStr);
    setLoadError(null);
    // Sync DOM immediately so FormData is correct even if React hasn't re-rendered yet.
    if (addressInputRef.current) addressInputRef.current.value = formatted;
    if (latInputRef.current) latInputRef.current.value = latStr;
    if (lngInputRef.current) lngInputRef.current.value = lngStr;
  }

  useEffect(() => {
    setAddress(defaultValue);
    setLatitude(defaultLatitude);
    setLongitude(defaultLongitude);
    if (addressInputRef.current) addressInputRef.current.value = defaultValue;
    if (latInputRef.current) latInputRef.current.value = defaultLatitude;
    if (lngInputRef.current) lngInputRef.current.value = defaultLongitude;
  }, [defaultValue, defaultLatitude, defaultLongitude]);

  useEffect(() => {
    if (!mapsConfigured || !containerRef.current) return;

    let widget: google.maps.places.PlaceAutocompleteElement | null = null;
    let cancelled = false;

    loadGoogleMapsPlaces(apiKey)
      .then(async () => {
        if (cancelled || !containerRef.current || !window.google?.maps?.importLibrary) return;

        const { PlaceAutocompleteElement } = await window.google.maps.importLibrary("places");
        if (cancelled || !containerRef.current) return;

        containerRef.current.replaceChildren();

        const autocomplete = new PlaceAutocompleteElement({
          includedRegionCodes: ["us"],
          locationBias: CHAMPAIGN_URBANA_BIAS,
        });

        widget = autocomplete;
        containerRef.current.appendChild(autocomplete);

        autocomplete.addEventListener("gmp-select", async (ev: Event) => {
          const event = ev as google.maps.places.PlacePredictionSelectEvent;
          try {
            const place = event.placePrediction.toPlace();
            await place.fetchFields({ fields: ["formattedAddress", "location"] });

            const formatted =
              place.formattedAddress?.trim() ||
              event.placePrediction.text?.text?.trim() ||
              "";
            const coords = parsePlaceLocation(place.location);

            if (!formatted || !coords) {
              setAddress("");
              setLatitude("");
              setLongitude("");
              if (addressInputRef.current) addressInputRef.current.value = "";
              if (latInputRef.current) latInputRef.current.value = "";
              if (lngInputRef.current) lngInputRef.current.value = "";
              setLoadError("Could not read that address. Try another suggestion.");
              return;
            }

            applySelection(formatted, coords.lat, coords.lng);
          } catch {
            setLoadError("Could not load that address. Try another suggestion.");
          }
        });
      })
      .catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Address suggestions could not load.";
        console.error("[address-autocomplete]", err);
        setLoadError(message);
      });

    return () => {
      cancelled = true;
      widget?.remove();
    };
  }, [apiKey, mapsConfigured]);

  if (!mapsConfigured) {
    return (
      <div>
        <Input
          id="address"
          name="address"
          defaultValue={defaultValue}
          placeholder="509 E Green St, Champaign, IL"
          className="mt-1.5"
          required
        />
        <p className="mt-1 text-xs text-amber-700">
          Address autocomplete is not configured. Add{" "}
          <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
          enable Google Places suggestions.
        </p>
        {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
      </div>
    );
  }

  return (
    <div>
      <div ref={containerRef} className="address-autocomplete mt-1.5" />
      <input ref={addressInputRef} type="hidden" name="address" value={address} readOnly />
      <input ref={latInputRef} type="hidden" name="latitude" value={latitude} readOnly />
      <input ref={lngInputRef} type="hidden" name="longitude" value={longitude} readOnly />
      {address ? (
        <p className="mt-1 text-xs text-emerald-700">Selected: {address}</p>
      ) : (
        <p className="mt-1 text-xs text-zinc-500">
          Select your address from the Google suggestions so &quot;View on map&quot; opens the right
          spot.
        </p>
      )}
      {loadError && <p className="mt-1 text-xs text-amber-700">{loadError}</p>}
      {fieldError && <p className="mt-1 text-xs text-red-600">{fieldError}</p>}
    </div>
  );
}
