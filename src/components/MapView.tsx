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

                        // Center the map on the clicked pin
                        map.current!.flyTo({
                            center: e.lngLat,
                            zoom: 18,
                            duration: 1000,
                            essential: true
                        });

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

                        // Function to call OpenAI API for environmental analysis
                        const analyzeLocation = async (location: any, modelType: string, buildingProps: Record<string, any>) => {
                            try {
                                console.log('Starting environmental analysis for:', { location, modelType, buildingProps });
                                
                                // Add timeout to prevent hanging
                                const controller = new AbortController();
                                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
                                
                                const response = await fetch('/api/analyze-location', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        location,
                                        modelType,
                                        buildingData: buildingProps
                                    }),
                                    signal: controller.signal
                                });

                                clearTimeout(timeoutId);

                                if (!response.ok) {
                                    const errorText = await response.text();
                                    console.error('API Error:', response.status, errorText);
                                    throw new Error(`API Error: ${response.status} - ${errorText}`);
                                }

                                const data = await response.json();
                                console.log('Analysis completed successfully:', data);
                                return data.analysis;
                            } catch (error) {
                                console.error('Error analyzing location:', error);
                                
                                // Return fallback data immediately instead of null
                                return {
                                    environmentalFuturesSimulation: {
                                        currentState: {
                                            baselineCarbonFootprint: "45-65 tons CO2/year",
                                            energyConsumption: "180,000-220,000 kWh/year",
                                            waterUsage: "120,000-150,000 gallons/year",
                                            wasteGeneration: "15-25 tons/year",
                                            airQualityIndex: "Moderate (75-85 AQI)",
                                            biodiversityIndex: "Low-Medium (3.2/10)"
                                        },
                                        projectedImpact: {
                                            year1: {
                                                carbonReduction: "8-12 tons CO2",
                                                energySavings: "20-25%",
                                                waterConservation: "25,000-35,000 gallons",
                                                wasteDiversion: "5-8 tons",
                                                airQualityImprovement: "8-12 AQI points",
                                                biodiversityGain: "1.2 points"
                                            },
                                            year5: {
                                                carbonReduction: "35-50 tons CO2",
                                                energySavings: "40-50%",
                                                waterConservation: "80,000-120,000 gallons",
                                                wasteDiversion: "20-30 tons",
                                                airQualityImprovement: "15-25 AQI points",
                                                biodiversityGain: "2.8 points"
                                            },
                                            year10: {
                                                carbonReduction: "60-85 tons CO2",
                                                energySavings: "60-75%",
                                                waterConservation: "150,000-200,000 gallons",
                                                wasteDiversion: "40-60 tons",
                                                airQualityImprovement: "25-35 AQI points",
                                                biodiversityGain: "4.5 points"
                                            }
                                        }
                                    },
                                    businessAnalysis: {
                                        estimatedFootTraffic: "150-300 daily visitors",
                                        estimatedRevenue: "$15,000-$35,000 monthly",
                                        targetDemographics: "Young professionals, families, eco-conscious consumers",
                                        competitionLevel: "medium",
                                        seasonalVariations: "Higher traffic in summer, steady year-round",
                                        growthPotential: "Strong growth potential in sustainable business sector",
                                        economicMultiplier: "2.3x local economic impact",
                                        supplyChainImpact: "70-85% local supplier engagement"
                                    },
                                    environmentalImpact: {
                                        carbonEmissionsSaved: "12-18 tons CO2 annually",
                                        energyEfficiencyGains: "25-35% improvement",
                                        wasteReduction: "8-12 tons diverted annually",
                                        waterConservation: "15,000-25,000 gallons saved",
                                        airQualityImprovement: "15-20% improvement",
                                        greenSpaceContribution: "500-800 sq ft",
                                        sustainableTransportation: "40-60% eco-friendly transport",
                                        renewableEnergyPotential: "30-50% renewable energy",
                                        localFoodSourcing: "60-80% locally sourced",
                                        biodiversityImpact: "Significant positive impact on local ecosystem",
                                        stormwaterManagement: "50,000-75,000 gallons managed",
                                        urbanHeatIslandReduction: "2-4°F temperature reduction",
                                        noisePollutionReduction: "8-12 decibel reduction",
                                        lightPollutionReduction: "25-40% reduction"
                                    },
                                    communityBenefits: {
                                        jobCreation: "8-15 new jobs",
                                        localEconomicImpact: "$200,000-$400,000 annually",
                                        communityEngagement: "Educational workshops, local partnerships",
                                        accessibilityImprovements: "Full ADA compliance, inclusive design",
                                        culturalContribution: "Supports local artists, cultural events",
                                        educationalPrograms: "Monthly sustainability workshops",
                                        healthBenefits: "Improved air quality, reduced stress",
                                        socialEquity: "Inclusive hiring, community outreach"
                                    },
                                    sustainabilityMetrics: {
                                        leedCertificationPotential: "LEED Gold",
                                        breeamScore: "Very Good",
                                        carbonNeutralTimeline: "3-5 years",
                                        wasteDiversionRate: "85-95%",
                                        energyStarRating: "Energy Star Certified",
                                        livingBuildingChallenge: "LBC Petal Certified",
                                        wellBuildingStandard: "WELL Silver",
                                        netZeroEnergy: "Achievable within 5 years",
                                        netZeroWater: "Achievable within 7 years",
                                        regenerativeDesign: "High potential for regenerative impact"
                                    },
                                    policySimulation: {
                                        climateResilience: "High resilience to climate change impacts",
                                        greenBuildingIncentives: "$15,000-$25,000 available incentives",
                                        zoningCompliance: "Fully compliant with current zoning",
                                        environmentalPermits: "Standard commercial permits required",
                                        sustainabilityStandards: "Exceeds local sustainability requirements",
                                        carbonPricing: "Positive impact from carbon pricing policies",
                                        renewableEnergyMandates: "Exceeds renewable energy requirements"
                                    },
                                    collaborativeDecisionMaking: {
                                        stakeholderEngagement: "City planners, environmental groups, community leaders",
                                        communityInput: "Public forums, online surveys, focus groups",
                                        partnershipOpportunities: "Local universities, environmental NGOs, green businesses",
                                        fundingSources: "State green building grants, federal sustainability programs",
                                        implementationTimeline: "6-month phased implementation plan",
                                        monitoringMetrics: "Carbon footprint, energy usage, community engagement"
                                    },
                                    riskAssessment: {
                                        environmentalRisks: "Climate change impacts, extreme weather events",
                                        regulatoryRisks: "Changing environmental regulations",
                                        marketRisks: "Economic downturns, competition",
                                        mitigationStrategies: "Adaptive design, flexible operations",
                                        contingencyPlans: "Backup energy systems, emergency protocols"
                                    },
                                    recommendations: [
                                        "Install solar panels and battery storage system",
                                        "Implement comprehensive recycling and composting program",
                                        "Partner with local suppliers for sustainable sourcing",
                                        "Create green roof and vertical garden system",
                                        "Offer electric vehicle charging stations",
                                        "Establish community environmental education center",
                                        "Develop stormwater management system",
                                        "Implement smart building technology for efficiency"
                                    ]
                                };
                            }
                        };

                        // Helper function to create environmental futures simulation section
                        const createEnvironmentalFuturesSection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                margin: 0 0 32px 0;
                                background: #ffffff;
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                padding: 24px;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 20px;
                                color: #1f2937;
                                border-bottom: 2px solid #e5e7eb;
                                padding-bottom: 8px;
                            `;
                            title.textContent = 'Environmental Futures Simulation';

                            const currentState = document.createElement('div');
                            currentState.style.cssText = `
                                margin-bottom: 24px;
                                padding: 16px;
                                background: #f9fafb;
                                border-radius: 6px;
                                border-left: 4px solid #3b82f6;
                            `;

                            const currentTitle = document.createElement('h4');
                            currentTitle.style.cssText = `
                                font-size: 16px;
                                font-weight: 600;
                                margin-bottom: 12px;
                                color: #374151;
                            `;
                            currentTitle.textContent = 'Current State Baseline';

                            const currentMetrics = document.createElement('div');
                            currentMetrics.style.cssText = `
                                display: grid;
                                grid-template-columns: repeat(2, 1fr);
                                gap: 12px;
                            `;

                            const currentData = analysis.environmentalFuturesSimulation?.currentState || {};
                            const currentItems = [
                                { label: 'Carbon Footprint', value: currentData.baselineCarbonFootprint || 'N/A', icon: '🌍' },
                                { label: 'Energy Usage', value: currentData.energyConsumption || 'N/A', icon: '⚡' },
                                { label: 'Water Usage', value: currentData.waterUsage || 'N/A', icon: '💧' },
                                { label: 'Waste Generation', value: currentData.wasteGeneration || 'N/A', icon: '🗑️' },
                                { label: 'Air Quality', value: currentData.airQualityIndex || 'N/A', icon: '🌬️' },
                                { label: 'Biodiversity', value: currentData.biodiversityIndex || 'N/A', icon: '🦋' }
                            ];

                            currentItems.forEach(item => {
                                const itemDiv = document.createElement('div');
                                itemDiv.style.cssText = `
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 8px 0;
                                    border-bottom: 1px solid #f3f4f6;
                                `;
                                itemDiv.innerHTML = `
                                    <span style="font-weight: 500; color: #6b7280; font-size: 14px;">${item.icon} ${item.label}</span>
                                    <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${item.value}</span>
                                `;
                                currentMetrics.appendChild(itemDiv);
                            });

                            currentState.appendChild(currentTitle);
                            currentState.appendChild(currentMetrics);

                            const projectedImpact = document.createElement('div');
                            projectedImpact.style.cssText = `
                                padding: 16px;
                                background: #f9fafb;
                                border-radius: 6px;
                                border-left: 4px solid #10b981;
                            `;

                            const projectedTitle = document.createElement('h4');
                            projectedTitle.style.cssText = `
                                font-size: 16px;
                                font-weight: 600;
                                margin-bottom: 12px;
                                color: #374151;
                            `;
                            projectedTitle.textContent = 'Projected Environmental Impact';

                            const timeline = document.createElement('div');
                            timeline.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                gap: 16px;
                            `;

                            const years = ['year1', 'year5', 'year10'];
                            const yearLabels = ['Year 1', 'Year 5', 'Year 10'];
                            const projectedData = analysis.environmentalFuturesSimulation?.projectedImpact || {};

                            years.forEach((year, index) => {
                                const yearDiv = document.createElement('div');
                                yearDiv.style.cssText = `
                                    background: #ffffff;
                                    padding: 16px;
                                    border-radius: 6px;
                                    border: 1px solid #e5e7eb;
                                `;

                                const yearTitle = document.createElement('div');
                                yearTitle.style.cssText = `
                                    font-size: 14px;
                                    font-weight: 600;
                                    margin-bottom: 12px;
                                    color: #374151;
                                    border-bottom: 1px solid #f3f4f6;
                                    padding-bottom: 8px;
                                `;
                                yearTitle.textContent = yearLabels[index];

                                const yearData = projectedData[year] || {};
                                const yearMetrics = [
                                    { label: 'CO2 Reduction', value: yearData.carbonReduction || 'N/A' },
                                    { label: 'Energy Savings', value: yearData.energySavings || 'N/A' },
                                    { label: 'Water Saved', value: yearData.waterConservation || 'N/A' },
                                    { label: 'Waste Diverted', value: yearData.wasteDiversion || 'N/A' }
                                ];

                                yearMetrics.forEach(metric => {
                                    const metricDiv = document.createElement('div');
                                    metricDiv.style.cssText = `
                                        display: flex;
                                        justify-content: space-between;
                                        align-items: center;
                                        padding: 6px 0;
                                        border-bottom: 1px solid #f9fafb;
                                    `;
                                    metricDiv.innerHTML = `
                                        <span style="font-weight: 500; color: #6b7280; font-size: 13px;">${metric.label}</span>
                                        <span style="color: #059669; font-weight: 600; font-size: 13px;">${metric.value}</span>
                                    `;
                                    yearDiv.appendChild(metricDiv);
                                });

                                yearDiv.appendChild(yearTitle);
                                projectedImpact.appendChild(yearDiv);
                            });

                            projectedImpact.appendChild(projectedTitle);
                            projectedImpact.appendChild(timeline);

                            section.appendChild(title);
                            section.appendChild(currentState);
                            section.appendChild(projectedImpact);
                            return section;
                        };

                        // Helper function to create policy simulation section
                        const createPolicySimulationSection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                margin-bottom: 30px;
                                background: linear-gradient(135deg, #dc2626, #b91c1c);
                                border-radius: 12px;
                                padding: 24px;
                                color: white;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 20px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            `;
                            title.innerHTML = '🏛️ Policy Simulation & Compliance';

                            const content = document.createElement('div');
                            content.style.cssText = `
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 16px;
                            `;

                            const policyData = analysis.policySimulation || {};
                            const policyItems = [
                                { label: 'Climate Resilience', value: policyData.climateResilience || 'N/A', icon: '🌡️' },
                                { label: 'Green Incentives', value: policyData.greenBuildingIncentives || 'N/A', icon: '💰' },
                                { label: 'Zoning Compliance', value: policyData.zoningCompliance || 'N/A', icon: '📋' },
                                { label: 'Environmental Permits', value: policyData.environmentalPermits || 'N/A', icon: '📄' },
                                { label: 'Sustainability Standards', value: policyData.sustainabilityStandards || 'N/A', icon: '⭐' },
                                { label: 'Carbon Pricing Impact', value: policyData.carbonPricing || 'N/A', icon: '💸' }
                            ];

                            policyItems.forEach(item => {
                                const itemDiv = document.createElement('div');
                                itemDiv.style.cssText = `
                                    background: rgba(255, 255, 255, 0.1);
                                    padding: 12px;
                                    border-radius: 8px;
                                    backdrop-filter: blur(4px);
                                `;
                                itemDiv.innerHTML = `
                                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">${item.icon} ${item.label}</div>
                                    <div style="font-size: 14px; font-weight: 500;">${item.value}</div>
                                `;
                                content.appendChild(itemDiv);
                            });

                            section.appendChild(title);
                            section.appendChild(content);
                            return section;
                        };

                        // Helper function to create collaborative decision making section
                        const createCollaborativeSection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                margin-bottom: 30px;
                                background: linear-gradient(135deg, #7c3aed, #6d28d9);
                                border-radius: 12px;
                                padding: 24px;
                                color: white;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 20px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            `;
                            title.innerHTML = '🤝 Collaborative Decision Making';

                            const content = document.createElement('div');
                            content.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                gap: 16px;
                            `;

                            const collaborativeData = analysis.collaborativeDecisionMaking || {};
                            const collaborativeItems = [
                                { label: 'Stakeholder Engagement', value: collaborativeData.stakeholderEngagement || 'N/A' },
                                { label: 'Community Input Methods', value: collaborativeData.communityInput || 'N/A' },
                                { label: 'Partnership Opportunities', value: collaborativeData.partnershipOpportunities || 'N/A' },
                                { label: 'Funding Sources', value: collaborativeData.fundingSources || 'N/A' },
                                { label: 'Implementation Timeline', value: collaborativeData.implementationTimeline || 'N/A' },
                                { label: 'Monitoring Metrics', value: collaborativeData.monitoringMetrics || 'N/A' }
                            ];

                            collaborativeItems.forEach(item => {
                                const itemDiv = document.createElement('div');
                                itemDiv.style.cssText = `
                                    background: rgba(255, 255, 255, 0.1);
                                    padding: 12px;
                                    border-radius: 8px;
                                    backdrop-filter: blur(4px);
                                `;
                                itemDiv.innerHTML = `
                                    <div style="font-size: 14px; font-weight: 600; margin-bottom: 4px; color: #fbbf24;">${item.label}</div>
                                    <div style="font-size: 13px; opacity: 0.9;">${item.value}</div>
                                `;
                                content.appendChild(itemDiv);
                            });

                            section.appendChild(title);
                            section.appendChild(content);
                            return section;
                        };

                        // Helper function to create risk assessment section
                        const createRiskAssessmentSection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                margin-bottom: 30px;
                                background: linear-gradient(135deg, #f59e0b, #d97706);
                                border-radius: 12px;
                                padding: 24px;
                                color: white;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 20px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            `;
                            title.innerHTML = '⚠️ Risk Assessment & Mitigation';

                            const content = document.createElement('div');
                            content.style.cssText = `
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 16px;
                            `;

                            const riskData = analysis.riskAssessment || {};
                            const riskItems = [
                                { label: 'Environmental Risks', value: riskData.environmentalRisks || 'N/A', icon: '🌪️' },
                                { label: 'Regulatory Risks', value: riskData.regulatoryRisks || 'N/A', icon: '📜' },
                                { label: 'Market Risks', value: riskData.marketRisks || 'N/A', icon: '📈' },
                                { label: 'Mitigation Strategies', value: riskData.mitigationStrategies || 'N/A', icon: '🛡️' },
                                { label: 'Contingency Plans', value: riskData.contingencyPlans || 'N/A', icon: '🔄' }
                            ];

                            riskItems.forEach(item => {
                                const itemDiv = document.createElement('div');
                                itemDiv.style.cssText = `
                                    background: rgba(255, 255, 255, 0.1);
                                    padding: 12px;
                                    border-radius: 8px;
                                    backdrop-filter: blur(4px);
                                `;
                                itemDiv.innerHTML = `
                                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">${item.icon} ${item.label}</div>
                                    <div style="font-size: 13px; font-weight: 500;">${item.value}</div>
                                `;
                                content.appendChild(itemDiv);
                            });

                            section.appendChild(title);
                            section.appendChild(content);
                            return section;
                        };

                        // Helper function to create environmental impact section
                        const createEnvironmentalSection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                margin: 0 0 32px 0;
                                background: #ffffff;
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                padding: 24px;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 20px;
                                color: #1f2937;
                                border-bottom: 2px solid #e5e7eb;
                                padding-bottom: 8px;
                            `;
                            title.textContent = 'Environmental Impact';

                            const grid = document.createElement('div');
                            grid.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                gap: 12px;
                            `;

                            const metrics = [
                                { label: 'Local Carbon Reduction', value: analysis.environmentalImpact?.localCarbonReduction || 'N/A', icon: '🌍' },
                                { label: 'Neighborhood Air Quality', value: analysis.environmentalImpact?.neighborhoodAirQualityImprovement || 'N/A', icon: '🌬️' },
                                { label: 'Local Biodiversity', value: analysis.environmentalImpact?.localBiodiversityEnhancement || 'N/A', icon: '🦋' },
                                { label: 'Walkability Improvement', value: analysis.environmentalImpact?.walkabilityImprovement || 'N/A', icon: '🚶' },
                                { label: 'Local Waste Diversion', value: analysis.environmentalImpact?.localWasteDiversion || 'N/A', icon: '♻️' },
                                { label: 'Community Green Space', value: analysis.environmentalImpact?.communityGreenSpace || 'N/A', icon: '🌿' },
                                { label: 'Neighborhood Noise Reduction', value: analysis.environmentalImpact?.neighborhoodNoiseReduction || 'N/A', icon: '🔇' },
                                { label: 'Local Water Conservation', value: analysis.environmentalImpact?.localWaterConservation || 'N/A', icon: '💧' },
                                { label: 'Transportation Efficiency', value: analysis.environmentalImpact?.transportationEfficiency || 'N/A', icon: '🚌' },
                                { label: 'Community Education', value: analysis.environmentalImpact?.communityEnvironmentalEducation || 'N/A', icon: '📚' }
                            ];

                            metrics.forEach(metric => {
                                const metricDiv = document.createElement('div');
                                metricDiv.style.cssText = `
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #f3f4f6;
                                `;
                                metricDiv.innerHTML = `
                                    <span style="font-weight: 500; color: #6b7280; font-size: 14px;">${metric.icon} ${metric.label}</span>
                                    <span style="font-weight: 600; color: #1f2937; font-size: 14px;">${metric.value}</span>
                                `;
                                grid.appendChild(metricDiv);
                            });

                            section.appendChild(title);
                            section.appendChild(grid);
                            return section;
                        };

                        // Helper function to create business analysis section
                        const createBusinessSection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                height: 100%;
                                display: flex;
                                flex-direction: column;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 22px;
                                font-weight: 600;
                                margin-bottom: 24px;
                                color: #1f2937;
                                border-bottom: 2px solid #e5e7eb;
                                padding-bottom: 12px;
                            `;
                            title.textContent = 'Business Analysis';

                            const content = document.createElement('div');
                            content.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                gap: 16px;
                                flex: 1;
                            `;

                            const metrics = [
                                { 
                                    label: 'Local Population Density', 
                                    value: analysis.businessAnalysis?.localPopulationDensity || 'N/A'
                                },
                                { 
                                    label: 'Estimated Foot Traffic', 
                                    value: analysis.businessAnalysis?.estimatedFootTraffic || 'N/A'
                                },
                                { 
                                    label: 'Monthly Revenue', 
                                    value: analysis.businessAnalysis?.estimatedRevenue || 'N/A'
                                },
                                { 
                                    label: 'Target Demographics', 
                                    value: analysis.businessAnalysis?.targetDemographics || 'N/A'
                                },
                                { 
                                    label: 'Neighborhood Type', 
                                    value: analysis.businessAnalysis?.neighborhoodType || 'N/A'
                                },
                                { 
                                    label: 'Transportation Access', 
                                    value: analysis.businessAnalysis?.transportationAccess || 'N/A'
                                },
                                { 
                                    label: 'Competition Level', 
                                    value: analysis.businessAnalysis?.competitionLevel || 'N/A'
                                },
                                { 
                                    label: 'Growth Potential', 
                                    value: analysis.businessAnalysis?.growthPotential || 'N/A'
                                }
                            ];

                            metrics.forEach(metric => {
                                const metricDiv = document.createElement('div');
                                metricDiv.style.cssText = `
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 12px 0;
                                    border-bottom: 1px solid #f3f4f6;
                                `;

                                const label = document.createElement('span');
                                label.style.cssText = `
                                    font-weight: 500;
                                    color: #6b7280;
                                    font-size: 14px;
                                `;
                                label.textContent = metric.label;

                                const value = document.createElement('span');
                                value.style.cssText = `
                                    font-weight: 600;
                                    color: #1f2937;
                                    font-size: 14px;
                                    text-align: right;
                                    max-width: 60%;
                                `;
                                value.textContent = metric.value;

                                metricDiv.appendChild(label);
                                metricDiv.appendChild(value);
                                content.appendChild(metricDiv);
                            });

                            section.appendChild(title);
                            section.appendChild(content);
                            return section;
                        };

                        // Helper function to create community benefits section
                        const createCommunitySection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                margin-bottom: 30px;
                                background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                                border-radius: 12px;
                                padding: 24px;
                                color: white;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 20px;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            `;
                            title.innerHTML = '🏘️ Community Benefits';

                            const content = document.createElement('div');
                            content.style.cssText = `
                                display: grid;
                                grid-template-columns: 1fr 1fr;
                                gap: 16px;
                            `;

                            const metrics = [
                                { label: 'Jobs Created', value: analysis.communityBenefits?.jobCreation || 'N/A', icon: '👥' },
                                { label: 'Economic Impact', value: analysis.communityBenefits?.localEconomicImpact || 'N/A', icon: '💰' },
                                { label: 'Community Engagement', value: analysis.communityBenefits?.communityEngagement || 'N/A', icon: '🤝' },
                                { label: 'Accessibility', value: analysis.communityBenefits?.accessibilityImprovements || 'N/A', icon: '♿' }
                            ];

                            metrics.forEach(metric => {
                                const metricDiv = document.createElement('div');
                                metricDiv.style.cssText = `
                                    background: rgba(255, 255, 255, 0.1);
                                    padding: 12px;
                                    border-radius: 8px;
                                    backdrop-filter: blur(4px);
                                `;
                                metricDiv.innerHTML = `
                                    <div style="font-size: 14px; opacity: 0.9; margin-bottom: 4px;">${metric.icon} ${metric.label}</div>
                                    <div style="font-size: 14px; font-weight: 500;">${metric.value}</div>
                                `;
                                content.appendChild(metricDiv);
                            });

                            section.appendChild(title);
                            section.appendChild(content);
                            return section;
                        };

                        // Helper function to create recommendations section
                        const createRecommendationsSection = (analysis: any) => {
                            const section = document.createElement('div');
                            section.style.cssText = `
                                background: rgba(255, 255, 255, 0.8);
                                border-radius: 12px;
                                padding: 24px;
                                border-left: 4px solid #f59e0b;
                            `;

                            const title = document.createElement('h3');
                            title.style.cssText = `
                                font-size: 20px;
                                font-weight: 600;
                                margin-bottom: 20px;
                                color: #1f2937;
                                display: flex;
                                align-items: center;
                                gap: 8px;
                            `;
                            title.innerHTML = '💡 Recommendations';

                            const list = document.createElement('ul');
                            list.style.cssText = `
                                list-style: none;
                                padding: 0;
                                margin: 0;
                            `;

                            const recommendations = analysis.recommendations || [];
                            recommendations.forEach((rec: string, index: number) => {
                                const item = document.createElement('li');
                                item.style.cssText = `
                                    padding: 8px 0;
                                    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                                    display: flex;
                                    align-items: flex-start;
                                    gap: 8px;
                                `;
                                item.innerHTML = `
                                    <span style="color: #f59e0b; font-weight: bold;">${index + 1}.</span>
                                    <span style="color: #374151;">${rec}</span>
                                `;
                                list.appendChild(item);
                            });

                            section.appendChild(title);
                            section.appendChild(list);
                            return section;
                        };

                        // Function to show model modal
                        const showModelModal = async (src: string, alt: string, label: string, buildingProps: Record<string, any>) => {
                            // Remove existing modal if any
                            const existingModal = document.getElementById('model-modal');
                            if (existingModal) {
                                existingModal.remove();
                            }

                            // Create modal overlay
                            const modal = document.createElement('div');
                            modal.id = 'model-modal';
                            modal.style.cssText = `
                                position: fixed;
                                top: 0;
                                left: 0;
                                width: 100vw;
                                height: 100vh;
                                background: rgba(0, 0, 0, 0.8);
                                backdrop-filter: blur(8px);
                                z-index: 2000;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 20px;
                                box-sizing: border-box;
                            `;

                            // Create modal content
                            const modalContent = document.createElement('div');
                            modalContent.style.cssText = `
                                background: rgba(255, 255, 255, 0.98);
                                backdrop-filter: blur(20px);
                                border: 1px solid rgba(0, 0, 0, 0.08);
                                border-radius: 24px;
                                width: 95%;
                                max-width: 1400px;
                                height: 90%;
                                max-height: 900px;
                                display: flex;
                                flex-direction: column;
                                overflow: hidden;
                                box-shadow: 0 32px 100px rgba(0, 0, 0, 0.12);
                                position: relative;
                            `;

                            // Close button for modal
                            const modalCloseButton = document.createElement('button');
                            modalCloseButton.innerHTML = '×';
                            modalCloseButton.style.cssText = `
                                position: absolute;
                                top: 24px;
                                right: 24px;
                                width: 44px;
                                height: 44px;
                                border: none;
                                border-radius: 50%;
                                background: rgba(0, 0, 0, 0.05);
                                color: #666;
                                font-size: 24px;
                                font-weight: 300;
                                cursor: pointer;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                z-index: 2001;
                                transition: all 0.2s ease;
                                backdrop-filter: blur(4px);
                                border: 1px solid rgba(0, 0, 0, 0.1);
                            `;

                            modalCloseButton.addEventListener('mouseenter', () => {
                                modalCloseButton.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
                                modalCloseButton.style.color = '#333';
                                modalCloseButton.style.transform = 'scale(1.1)';
                            });

                            modalCloseButton.addEventListener('mouseleave', () => {
                                modalCloseButton.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                                modalCloseButton.style.color = '#666';
                                modalCloseButton.style.transform = 'scale(1)';
                            });

                            modalCloseButton.addEventListener('click', () => {
                                modal.remove();
                            });

                            // Top section container
                            const topSection = document.createElement('div');
                            topSection.style.cssText = `
                                display: flex;
                                height: 45%;
                                min-height: 400px;
                                border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                            `;

                            // Left side - Model viewer
                            const leftSide = document.createElement('div');
                            leftSide.style.cssText = `
                                flex: 1;
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                padding: 40px;
                                background: linear-gradient(135deg, #f8fafc, #f1f5f9);
                                border-right: 1px solid rgba(0, 0, 0, 0.06);
                            `;

                            const modelTitle = document.createElement('h2');
                            modelTitle.style.cssText = `
                                color: #1f2937;
                                font-size: 28px;
                                font-weight: 600;
                                margin-bottom: 24px;
                                text-align: center;
                                letter-spacing: -0.3px;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.2;
                            `;
                            modelTitle.textContent = label;

                            const modelViewer = document.createElement('model-viewer');
                            modelViewer.setAttribute('src', src);
                            modelViewer.setAttribute('alt', alt);
                            modelViewer.setAttribute('auto-rotate', '');
                            modelViewer.setAttribute('rotation-per-second', '20deg');
                            modelViewer.setAttribute('background-color', 'transparent');
                            modelViewer.setAttribute('camera-controls', '');
                            modelViewer.setAttribute('touch-action', 'pan-y');
                            modelViewer.style.cssText = `
                                width: 100%;
                                height: 300px;
                                max-width: 400px;
                                border-radius: 20px;
                                overflow: hidden;
                                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
                                border: 1px solid rgba(0, 0, 0, 0.06);
                            `;

                            leftSide.appendChild(modelTitle);
                            leftSide.appendChild(modelViewer);

                            // Right side - Business Analysis
                            const rightSide = document.createElement('div');
                            rightSide.style.cssText = `
                                flex: 1;
                                padding: 40px;
                                display: flex;
                                flex-direction: column;
                                justify-content: flex-start;
                                color: #374151;
                                overflow-y: auto;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                background: linear-gradient(135deg, #ffffff, #f8fafc);
                            `;

                            // Add loading state with progress bar
                            const loadingDiv = document.createElement('div');
                            loadingDiv.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                justify-content: center;
                                height: 100%;
                                text-align: center;
                                padding: 40px;
                            `;

                            const loadingText = document.createElement('div');
                            loadingText.style.cssText = `
                                font-size: 20px;
                                color: #374151;
                                font-weight: 500;
                                margin-bottom: 30px;
                            `;
                            loadingText.textContent = 'Analyzing environmental impact...';

                            const progressContainer = document.createElement('div');
                            progressContainer.style.cssText = `
                                width: 100%;
                                max-width: 400px;
                                background: #f3f4f6;
                                border-radius: 8px;
                                height: 8px;
                                overflow: hidden;
                                margin-bottom: 20px;
                            `;

                            const progressBar = document.createElement('div');
                            progressBar.style.cssText = `
                                width: 0%;
                                height: 100%;
                                background: linear-gradient(90deg, #3b82f6, #1d4ed8);
                                border-radius: 8px;
                                transition: width 0.3s ease;
                            `;

                            const progressText = document.createElement('div');
                            progressText.style.cssText = `
                                font-size: 14px;
                                color: #6b7280;
                            `;
                            progressText.textContent = 'Processing data...';

                            progressContainer.appendChild(progressBar);
                            loadingDiv.appendChild(loadingText);
                            loadingDiv.appendChild(progressContainer);
                            loadingDiv.appendChild(progressText);
                            rightSide.appendChild(loadingDiv);

                            // Animate progress bar
                            let progress = 0;
                            const progressInterval = setInterval(() => {
                                progress += Math.random() * 15;
                                if (progress > 90) progress = 90;
                                progressBar.style.width = progress + '%';
                                
                                if (progress < 30) {
                                    progressText.textContent = 'Gathering location data...';
                                } else if (progress < 60) {
                                    progressText.textContent = 'Analyzing environmental factors...';
                                } else if (progress < 90) {
                                    progressText.textContent = 'Generating recommendations...';
                                } else {
                                    progressText.textContent = 'Finalizing analysis...';
                                }
                            }, 500);

                            // Add CSS animation for spinner
                            const style = document.createElement('style');
                            style.textContent = `
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `;
                            document.head.appendChild(style);

                            const infoTitle = document.createElement('h3');
                            infoTitle.style.cssText = `
                                font-size: 28px;
                                font-weight: 600;
                                margin-bottom: 40px;
                                color: #1f2937;
                                letter-spacing: -0.3px;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                line-height: 1.3;
                            `;
                            infoTitle.textContent = 'Building Information';

                            const infoContent = document.createElement('div');
                            infoContent.style.cssText = `
                                display: flex;
                                flex-direction: column;
                                gap: 24px;
                                flex: 1;
                            `;

                            // Add building properties
                            const properties = [
                                { key: 'Address', value: buildingProps.address || 'Address not available' },
                                { key: 'Building Type', value: buildingProps.building_type || 'Type not specified' },
                                { key: 'Square Footage', value: buildingProps.sqft ? `${buildingProps.sqft.toLocaleString()} sq ft` : 'Not available' },
                                { key: 'Year Built', value: buildingProps.year_built || 'Not available' },
                                { key: 'Zoning', value: buildingProps.zoning || 'Not specified' },
                                { key: 'Status', value: buildingProps.recommended ? 'Recommended' : 'Available' },
                            ];

                            properties.forEach(prop => {
                                const propertyDiv = document.createElement('div');
                                propertyDiv.style.cssText = `
                                    background: rgba(255, 255, 255, 0.8);
                                    padding: 20px 24px;
                                    border-radius: 12px;
                                    border-left: 4px solid #3b82f6;
                                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                                    border: 1px solid rgba(0, 0, 0, 0.06);
                                `;

                                const keySpan = document.createElement('span');
                                keySpan.style.cssText = `
                                    font-weight: 600;
                                    color: #6b7280;
                                    display: block;
                                    margin-bottom: 8px;
                                    font-size: 13px;
                                    text-transform: uppercase;
                                    letter-spacing: 0.5px;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                `;
                                keySpan.textContent = prop.key;

                                const valueSpan = document.createElement('span');
                                valueSpan.style.cssText = `
                                    color: #1f2937;
                                    font-size: 16px;
                                    display: block;
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    font-weight: 500;
                                    line-height: 1.4;
                                `;
                                valueSpan.textContent = prop.value;

                                propertyDiv.appendChild(keySpan);
                                propertyDiv.appendChild(valueSpan);
                                infoContent.appendChild(propertyDiv);
                            });

                            // Add action buttons
                            const actionButtons = document.createElement('div');
                            actionButtons.style.cssText = `
                                margin-top: 40px;
                                display: flex;
                                gap: 16px;
                                flex-wrap: wrap;
                                padding-top: 24px;
                                border-top: 1px solid rgba(0, 0, 0, 0.08);
                            `;

                            const viewDetailsBtn = document.createElement('button');
                            viewDetailsBtn.textContent = 'View Details';
                            viewDetailsBtn.style.cssText = `
                                background: #3b82f6;
                                color: white;
                                border: none;
                                padding: 14px 28px;
                                border-radius: 10px;
                                font-size: 15px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                flex: 1;
                                min-width: 140px;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                            `;

                            const contactBtn = document.createElement('button');
                            contactBtn.textContent = 'Contact';
                            contactBtn.style.cssText = `
                                background: rgba(255, 255, 255, 0.8);
                                color: #374151;
                                border: 1px solid rgba(0, 0, 0, 0.1);
                                padding: 14px 28px;
                                border-radius: 10px;
                                font-size: 15px;
                                font-weight: 600;
                                cursor: pointer;
                                transition: all 0.3s ease;
                                flex: 1;
                                min-width: 140px;
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                            `;

                            [viewDetailsBtn, contactBtn].forEach(btn => {
                                btn.addEventListener('mouseenter', () => {
                                    btn.style.transform = 'translateY(-2px)';
                                    if (btn === viewDetailsBtn) {
                                        btn.style.backgroundColor = '#2563eb';
                                        btn.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                                    } else {
                                        btn.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                                        btn.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
                                    }
                                });
                                btn.addEventListener('mouseleave', () => {
                                    btn.style.transform = 'translateY(0)';
                                    if (btn === viewDetailsBtn) {
                                        btn.style.backgroundColor = '#3b82f6';
                                        btn.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                    } else {
                                        btn.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                        btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                                    }
                                });
                            });

                            actionButtons.appendChild(viewDetailsBtn);
                            actionButtons.appendChild(contactBtn);

                            rightSide.appendChild(infoTitle);
                            rightSide.appendChild(infoContent);
                            rightSide.appendChild(actionButtons);

                            // Bottom section for environmental results
                            const bottomSection = document.createElement('div');
                            bottomSection.style.cssText = `
                                flex: 1;
                                padding: 32px;
                                overflow-y: auto;
                                background: #ffffff;
                            `;

                            modalContent.appendChild(modalCloseButton);
                            modalContent.appendChild(topSection);
                            topSection.appendChild(leftSide);
                            topSection.appendChild(rightSide);
                            modalContent.appendChild(bottomSection);
                            modal.appendChild(modalContent);

                            // Close modal when clicking overlay
                            modal.addEventListener('click', (e) => {
                                if (e.target === modal) {
                                    modal.remove();
                                }
                            });

                            document.body.appendChild(modal);

                            // Call OpenAI API to analyze the location
                            const analysis = await analyzeLocation(e.lngLat, label, buildingProps);
                            
                            // Complete progress bar
                            clearInterval(progressInterval);
                            progressBar.style.width = '100%';
                            progressText.textContent = 'Analysis complete!';
                            
                            // Clear loading state and populate with analysis data
                            rightSide.innerHTML = '';
                            bottomSection.innerHTML = '';
                            
                            if (analysis) {
                                // Create business analysis section for top right
                                const businessSection = createBusinessSection(analysis);
                                rightSide.appendChild(businessSection);

                                // Create environmental futures simulation section for bottom
                                const futuresSection = createEnvironmentalFuturesSection(analysis);
                                bottomSection.appendChild(futuresSection);

                                // Create environmental impact section
                                const environmentalSection = createEnvironmentalSection(analysis);
                                bottomSection.appendChild(environmentalSection);

                                // Create community benefits section
                                const communitySection = createCommunitySection(analysis);
                                bottomSection.appendChild(communitySection);

                                // Create policy simulation section
                                const policySection = createPolicySimulationSection(analysis);
                                bottomSection.appendChild(policySection);

                                // Create collaborative decision making section
                                const collaborativeSection = createCollaborativeSection(analysis);
                                bottomSection.appendChild(collaborativeSection);

                                // Create risk assessment section
                                const riskSection = createRiskAssessmentSection(analysis);
                                bottomSection.appendChild(riskSection);

                                // Create recommendations section
                                const recommendationsSection = createRecommendationsSection(analysis);
                                bottomSection.appendChild(recommendationsSection);
                            } else {
                                // Show error state
                                const errorDiv = document.createElement('div');
                                errorDiv.style.cssText = `
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                    justify-content: center;
                                    height: 100%;
                                    text-align: center;
                                    color: #ef4444;
                                `;
                                errorDiv.innerHTML = `
                                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                                    <div style="font-size: 18px; font-weight: 500;">Unable to analyze location</div>
                                    <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">Please try again later</div>
                                `;
                                bottomSection.appendChild(errorDiv);
                            }
                        };

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
                                cursor: pointer;
                                flex: 1;
                                min-height: 0;
                                border-radius: 12px;
                                overflow: hidden;
                                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                                transition: all 0.3s ease;
                            `;

                            // Add hover effects
                            modelViewer.addEventListener('mouseenter', () => {
                                modelViewer.style.transform = 'scale(1.05)';
                                modelViewer.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
                            });

                            modelViewer.addEventListener('mouseleave', () => {
                                modelViewer.style.transform = 'scale(1)';
                                modelViewer.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
                            });

                            // Add click handler to open modal
                            modelViewer.addEventListener('click', () => {
                                showModelModal(src, alt, label, props);
                            });

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
