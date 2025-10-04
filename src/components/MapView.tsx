"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import BuildingPopup from "./BuildingPopup";
import { createRoot } from "react-dom/client";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN as string;

export default function MapView() {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: "mapbox://styles/mapbox/standard",
            center: [-71.1183, 42.3731],
            zoom: 17,
            pitch: 65,
            bearing: -20,
            antialias: true,
        });

        map.current.on("load", () => {
            map.current!.addSource("mapbox-dem", {
                type: "raster-dem",
                url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                tileSize: 512,
                maxzoom: 14,
            });
            map.current!.setTerrain({ source: "mapbox-dem", exaggeration: 1.2 });

            map.current!.addLayer({
                id: "sky",
                type: "sky",
                paint: {
                    "sky-type": "atmosphere",
                    "sky-atmosphere-sun": [90.0, 20.0],
                    "sky-atmosphere-sun-intensity": 8,
                },
            });

            map.current!.addSource("vacant-buildings", {
                type: "geojson",
                data: "/data/vacant_buildings.geojson",
            });

            map.current!.addLayer({
                id: "vacant-highlight",
                type: "circle",
                source: "vacant-buildings",
                paint: {
                    "circle-radius": 28,
                    "circle-color": "rgba(0, 200, 100, 1)",
                    "circle-stroke-width": 4,
                    "circle-stroke-color": "#ffffff",
                },
            });

            const popup = new mapboxgl.Popup({
                closeButton: true,
                closeOnClick: true,
                className: "mapbox-modern-popup",
                maxWidth: "320px",
            });

            map.current!.on("click", "vacant-highlight", (e) => {
                const feature = e.features?.[0];
                if (!feature) return;

                const coordinates = (feature.geometry as any).coordinates.slice();
                const props = feature.properties as Record<string, any>;

                const popupNode = document.createElement("div");
                const root = createRoot(popupNode);
                root.render(<BuildingPopup props={props} />);

                new mapboxgl.Popup({ offset: 25, closeButton: true })
                    .setLngLat(coordinates)
                    .setDOMContent(popupNode)
                    .addTo(map.current!);
            });
        });
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: "100%",
            }}
        />
    );
}
