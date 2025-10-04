"use client";

import { useEffect, useRef } from "react";
import mapboxgl, { Map } from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { MdLocationOn } from "react-icons/md";

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
            attributionControl: false,
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

            // Fetch and check the data first
            fetch("/data/vacant_buildings.geojson")
                .then(response => response.json())
                .then(data => {
                    // Check if there are any recommended buildings
                    const hasRecommended = data.features.some((feature: any) => 
                        feature.properties && feature.properties.recommended === true
                    );

                    // Add vacant buildings data source
                    map.current!.addSource("vacant-buildings", {
                        type: "geojson",
                        data: data,
                    });

                    // Create location pin icon with specified color
                    const createLocationPin = (color: string, imageName: string) => {
                        const canvas = document.createElement('canvas');
                        const size = 48;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext('2d')!;
                        
                        // Create a container div to render the React icon
                        const container = document.createElement('div');
                        container.style.width = `${size}px`;
                        container.style.height = `${size}px`;
                        container.style.color = color;
                        container.style.fontSize = `${size}px`;
                        container.style.display = 'flex';
                        container.style.alignItems = 'center';
                        container.style.justifyContent = 'center';
                        
                        // Render the MdLocationOn icon
                        const root = createRoot(container);
                        root.render(<MdLocationOn />);
                        
                        // Wait for the icon to render, then draw it on canvas
                        setTimeout(() => {
                            const svgElement = container.querySelector('svg');
                            if (svgElement) {
                                // Set the fill color
                                svgElement.style.fill = color;
                                svgElement.style.color = color;
                                
                                const svgData = new XMLSerializer().serializeToString(svgElement);
                                const img = new Image();
                                img.onload = () => {
                                    ctx.drawImage(img, 0, 0, size, size);
                                    const imageData = ctx.getImageData(0, 0, size, size);
                                    map.current!.addImage(imageName, {
                                        width: size,
                                        height: size,
                                        data: imageData.data
                                    });
                                };
                                img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
                            }
                        }, 100);
                    };

                    // Add vacant buildings with conditional coloring based on recommended field
                    map.current!.addLayer({
                        id: "vacant-locations",
                        type: "symbol",
                        source: "vacant-buildings",
                        layout: {
                            "icon-image": [
                                "case",
                                ["==", ["get", "recommended"], true],
                                "green-location-pin",
                                "red-location-pin"
                            ],
                            "icon-size": [
                                "case",
                                ["==", ["get", "recommended"], true],
                                1.0,
                                hasRecommended ? 0.5 : 1.0
                            ],
                            "icon-allow-overlap": true,
                            "icon-ignore-placement": true,
                        },
                    });

                    // Create both red and green location pin icons
                    createLocationPin('#dc2626', 'red-location-pin'); // Red for non-recommended
                    createLocationPin('#16a34a', 'green-location-pin'); // Green for recommended

                    // Add click handler for location markers
                    map.current!.on("click", "vacant-locations", (e) => {
                        const feature = e.features?.[0];
                        if (!feature) return;

                        const props = feature.properties as Record<string, any>;

                        // Remove existing popup if any
                        const existingPopup = document.getElementById('left-side-popup');
                        if (existingPopup) {
                            existingPopup.remove();
                        }

                        // Create fixed popup on the left side
                        const popup = document.createElement('div');
                        popup.id = 'left-side-popup';
                        popup.style.cssText = `
                            position: fixed;
                            top: 0;
                            left: 0;
                            width: 340px;
                            height: 100vh;
                            padding: 20px;
                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                            background: linear-gradient(135deg, rgba(0, 0, 0, 0.18), rgba(0, 0, 0, 0.12));
                            backdrop-filter: blur(12px);
                            border-right: 1px solid rgba(255, 255, 255, 0.1);
                            z-index: 1000;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            overflow-y: auto;
                            box-sizing: border-box;
                        `;

                        // Add close button
                        const closeButton = document.createElement('button');
                        closeButton.innerHTML = '×';
                        closeButton.style.cssText = `
                            position: absolute;
                            top: 24px;
                            right: 24px;
                            width: 32px;
                            height: 32px;
                            border: none;
                            border-radius: 50%;
                            background: rgba(255, 255, 255, 0.2);
                            color: white;
                            font-size: 20px;
                            font-weight: 300;
                            cursor: pointer;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            z-index: 1001;
                            transition: all 0.2s ease;
                            backdrop-filter: blur(4px);
                            border: 1px solid rgba(255, 255, 255, 0.15);
                        `;

                        closeButton.addEventListener('mouseenter', () => {
                            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                            closeButton.style.transform = 'scale(1.05)';
                        });

                        closeButton.addEventListener('mouseleave', () => {
                            closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                            closeButton.style.transform = 'scale(1)';
                        });

                        closeButton.addEventListener('click', () => {
                            popup.remove();
                        });

                        popup.appendChild(closeButton);

                        // Add header text
                        const headerText = document.createElement('div');
                        headerText.style.cssText = `
                            text-align: center;
                            color: white;
                            font-size: 20px;
                            font-weight: 500;
                            margin-bottom: 24px;
                            margin-top: 8px;
                            padding: 0 50px 0 10px;
                            text-shadow: 0 2px 8px rgba(0,0,0,0.8);
                            line-height: 1.3;
                            letter-spacing: 0.3px;
                        `;
                        headerText.textContent = 'Select a general category of the type of business';

                        popup.appendChild(headerText);

                        // Create the popup content container
                        const popupContent = document.createElement('div');
                        popupContent.style.cssText = `
                            text-align: center;
                            padding: 0;
                            min-height: fit-content;
                            display: flex;
                            flex-direction: column;
                            gap: 20px;
                            height: 100%;
                        `;

                        // Function to create a model viewer with proper initialization
                        const createModelViewer = (src: string, alt: string, label: string) => {
                            const container = document.createElement('div');
                            container.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                flex: 1;
                                min-height: 0;
                            `;

                            // Ensure model-viewer custom element is defined
                            if (!customElements.get('model-viewer')) {
                                console.warn('model-viewer custom element not defined, waiting for script to load...');
                                // Wait for the script to load and define the custom element
                                const checkForModelViewer = () => {
                                    if (customElements.get('model-viewer')) {
                                        createModelViewerElement();
                                    } else {
                                        setTimeout(checkForModelViewer, 100);
                                    }
                                };
                                
                                const createModelViewerElement = () => {
                                    const modelViewer = document.createElement('model-viewer');
                                    setupModelViewer(modelViewer, src, alt, container, label);
                                };
                                
                                checkForModelViewer();
                                return container;
                            }

                            const modelViewer = document.createElement('model-viewer');
                            setupModelViewer(modelViewer, src, alt, container, label);
                            return container;
                        };

                        // Helper function to setup model viewer attributes and events
                        const setupModelViewer = (modelViewer: any, src: string, alt: string, container: HTMLElement, label: string) => {
                            modelViewer.setAttribute('src', src);
                            modelViewer.setAttribute('alt', alt);
                            modelViewer.setAttribute('auto-rotate', '');
                            modelViewer.setAttribute('rotation-per-second', '30deg');
                            modelViewer.setAttribute('background-color', 'transparent');
                            modelViewer.setAttribute('disable-zoom', '');
                            modelViewer.setAttribute('disable-pan', '');
                            modelViewer.setAttribute('disable-tap', '');
                            modelViewer.setAttribute('interaction-policy', 'none');
                            modelViewer.style.cssText = `
                                width: 100%; 
                                height: 100%; 
                                max-width: 300px;
                                max-height: 300px;
                                margin: 0 auto; 
                                display: block; 
                                cursor: default;
                                flex: 1;
                                min-height: 0;
                                border-radius: 12px;
                                overflow: hidden;
                                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                            `;

                            // Add loading and error handling
                            modelViewer.addEventListener('load', () => {
                                console.log(`Model loaded: ${alt}`);
                            });

                            modelViewer.addEventListener('error', (e: Event) => {
                                console.error(`Error loading model ${alt}:`, e);
                                // Show fallback text if model fails to load
                                const fallback = document.createElement('div');
                                fallback.style.cssText = `
                                    width: 100%; 
                                    height: 100%; 
                                    max-width: 300px;
                                    max-height: 300px;
                                    margin: 0 auto; 
                                    display: flex; 
                                    align-items: center; 
                                    justify-content: center;
                                    background: rgba(255,255,255,0.08);
                                    border: 2px dashed rgba(255,255,255,0.2);
                                    color: white;
                                    font-size: 12px;
                                    flex: 1;
                                    min-height: 0;
                                    border-radius: 12px;
                                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                                `;
                                fallback.textContent = `Failed to load ${alt}`;
                                container.replaceChild(fallback, modelViewer);
                            });

                            const labelElement = document.createElement('p');
                            labelElement.style.cssText = `
                                margin: 8px 0 0 0; 
                                color: white; 
                                font-size: 17px; 
                                font-weight: 500; 
                                text-shadow: 0 2px 6px rgba(0,0,0,0.8);
                                text-align: center;
                                flex-shrink: 0;
                                letter-spacing: 0.2px;
                            `;
                            labelElement.textContent = label;

                            container.appendChild(modelViewer);
                            container.appendChild(labelElement);
                        };

                        // Add all three models
                        popupContent.appendChild(createModelViewer('/stylized_building.glb', 'Stylized Building 3D Model', 'Food and beverages'));
                        popupContent.appendChild(createModelViewer('/mid_rise_wall_to_wall_office_building.glb', 'Office Building 3D Model', 'Office Building'));
                        popupContent.appendChild(createModelViewer('/low_poly_school.glb', 'School Building 3D Model', 'Educational Institution'));

                        popup.appendChild(popupContent);

                        document.body.appendChild(popup);
                    });

                    // Change cursor on hover
                    map.current!.on("mouseenter", "vacant-locations", () => {
                        map.current!.getCanvas().style.cursor = "pointer";
                    });

                    map.current!.on("mouseleave", "vacant-locations", () => {
                        map.current!.getCanvas().style.cursor = "";
                    });
                })
                .catch(error => {
                    console.error('Error loading vacant buildings data:', error);
                });


        });
    }, []);

    return (
        <div
            ref={mapContainer}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
                height: "100vh",
            }}
        />
    );
}
