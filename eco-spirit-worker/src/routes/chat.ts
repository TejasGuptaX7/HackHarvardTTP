// src/routes/chat.ts
import { Env, ChatRequest, ChatResponse, GeoJSONFeature } from '../types';
import { getGeoJSON, setRecommendations } from '../lib/r2';
import { saveMessage, getConversationHistory, saveRecommendations } from '../lib/db';

function buildSystemPrompt(buildings: GeoJSONFeature[]): string {
	return `You are an AI assistant helping businesses find sustainable vacant commercial spaces in Cambridge, MA. 

You have access to ${buildings.length} vacant buildings with sustainability metrics including:
- Green Score (0-100): Overall sustainability rating
- Emissions: CO2 impact (lower is better)
- Tree Coverage: Green space around building (0-1)
- Walkability: Pedestrian accessibility (0-1)
- Solar Exposure: Renewable energy potential (0-1)
- Transit Access: Public transportation proximity (0-1)
- Bikeability: Bike-friendly infrastructure (0-1)

When a user asks about finding a location for their business, analyze their needs and recommend 5-6 most suitable buildings. Consider:
1. Business type (retail, café, office, etc.)
2. Sustainability priorities
3. Location preferences
4. Building characteristics

Always follow this exact format:
1. Provide a **short conversational reply** (max 150 chars).
2. On a **new line**, include a JSON block named "recommendations" — always plural, even if only one.
3. Do **not** include any prose before or after the JSON block.

Example:
"Got it! Here are 5 great fits."
\`\`\`json
{
  "recommendations": [
    { "buildingId": 1, "score": 92, "reason": "Reason in around 30 words" }
  ]
}
\`\`\`

Be conversational and helpful. Answer follow-up questions about why you chose specific buildings or comparisons between options but be concise and answer in 3-4 sentences max and Be to the point, have each response be shorter than 200 chars.`;
}

function buildBuildingContext(buildings: GeoJSONFeature[]): string {
	return buildings
		.map((b) => {
			const p = b.properties;
			return `Building ${p.id}: ${p.Address} in ${p['Commercial District']} - ${p['Square Footage']} sqft, Former: ${
				p['Former Tenant']
			}, Green Score: ${p.greenScore || 'N/A'}, Walkability: ${((p.walkability || 0) * 100).toFixed(0)}%, Transit: ${(
				(p.transitAccess || 0) * 100
			).toFixed(0)}%, Solar: ${((p.solarExposure || 0) * 100).toFixed(0)}%`;
		})
		.join('\n');
}

function extractRecommendations(aiResponse: string): Array<{ buildingId: number; reason: string; score: number }> | null {
	// Look for JSON code block
	const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/);
	if (!jsonMatch) return null;

	try {
		const parsed = JSON.parse(jsonMatch[1]);
		if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
			return parsed.recommendations.map((r: any) => ({
				buildingId: r.buildingId,
				reason: r.reason || '',
				score: r.score || 0,
			}));
		}
	} catch (e) {
		console.error('Failed to parse recommendations:', e);
	}

	return null;
}

export async function handleChat(request: Request, env: Env): Promise<Response> {
	try {
		const body: ChatRequest = await request.json();
		const { sessionId, message } = body;

		if (!sessionId || !message) {
			return new Response(JSON.stringify({ error: 'sessionId and message are required' }), {
				status: 400,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		// Save user message
		await saveMessage(env.DB, sessionId, 'user', message);

		const history = await getConversationHistory(env.DB, sessionId, 10);

		const geoJSON = await getGeoJSON(env.R2_BUCKET);
		const buildingsWithScores = geoJSON.features.filter((f) => f.properties.greenScore);

		if (buildingsWithScores.length === 0) {
			const response =
				"I notice the buildings haven't been scored yet. Please run the /score endpoint first to calculate sustainability metrics.";
			await saveMessage(env.DB, sessionId, 'assistant', response);
			return new Response(JSON.stringify({ sessionId, response }), { headers: { 'Content-Type': 'application/json' } });
		}

		// Build AI prompt
		const systemPrompt = buildSystemPrompt(buildingsWithScores);
		const buildingContext = buildBuildingContext(buildingsWithScores);

		// Detect follow-up vs. recommendation
		const isFollowUp = !/\b(find|recommend|location|place|where|suggest|fit|best)\b/i.test(message);

		console.log(isFollowUp ? 'Follow-up mode' : 'Recommendation mode');

		const baseMessages = [
			{ role: 'system', content: systemPrompt },
			{ role: 'system', content: `Available buildings:\n${buildingContext}` },
			...history,
		];

		let finalMessages;

		if (isFollowUp) {
			// Short conversational mode
			finalMessages = [
				...baseMessages,
				{
					role: 'system',
					content:
						'Respond in under 200 characters. Be conversational and to the point. ' +
						'Do NOT include JSON, metrics, or any data block. Just short human-friendly text.',
				},
				{ role: 'user', content: message },
			];
		} else {
			// Full recommendation mode
			finalMessages = [...baseMessages, { role: 'user', content: message }];
		}

		// Call Workers AI
		const aiResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
			messages: finalMessages,
			max_tokens: isFollowUp ? 300 : 1000,
			temperature: isFollowUp ? 0.5 : 0.7,
		});

		let assistantMessage = aiResponse.response || 'I apologize, but I encountered an error processing your request.';

		// Extract recommendations from AI response
		const recommendations = extractRecommendations(assistantMessage);

		if (recommendations && recommendations.length > 0) {
  assistantMessage = assistantMessage
    .replace(/:(.|\n)*$/g, ":")
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

		// Save cleaned assistant message
		await saveMessage(env.DB, sessionId, 'assistant', assistantMessage);

		// If recommendations found, update R2 and DB
		const responseObj: ChatResponse = {
			sessionId,
			response: assistantMessage,
		};

		if (recommendations && recommendations.length > 0) {
			await saveRecommendations(env.DB, sessionId, recommendations);

			await setRecommendations(env.R2_BUCKET, recommendations);

			responseObj.recommendations = recommendations.map((rec) => {
				const building = buildingsWithScores.find((b) => b.properties.id === rec.buildingId);
				return {
					buildingId: rec.buildingId,
					score: rec.score,
					reason: rec.reason,
					address: building?.properties.Address || '',
					district: building?.properties['Commercial District'] || '',
				};
			});
		}

		return new Response(JSON.stringify(responseObj), {
			headers: { 'Content-Type': 'application/json' },
		});
	} catch (error: any) {
		console.error('Chat error:', error);
		return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
	}
}
