import { useState, useCallback } from 'react';
import { visionModel } from '../firebase/config';

const buildStylistPrompt = ({ wardrobe, occasion, lockedItems }) => {
    const wardrobeDescription = wardrobe.map(item =>
        `- ${item.name}: ${item.category}, ${item.color}${item.material ? ', ' + item.material : ''}${item.occasion ? ' (good for ' + item.occasion + ')' : ''}`
    ).join('\n');

    const lockedItemsDescription = lockedItems.length > 0
        ? `\n\nMUST INCLUDE these items in all suggestions:\n${lockedItems.map(item => `- ${item.name} (${item.category}, ${item.color})`).join('\n')}`
        : '';

    return `You are a professional fashion stylist. Create 3 complete outfit suggestions from the user's wardrobe.

USER'S WARDROBE:
${wardrobeDescription}

REQUIREMENTS:
- Occasion: ${occasion || 'Any occasion'}${lockedItemsDescription}
- Each outfit should have complementary colors and styles
- Include items from different categories (Top, Bottom, Shoes, etc.)
- Only use items that are listed in the wardrobe above
- Each outfit should be practical and cohesive

Respond with a JSON array containing exactly 3 outfit suggestions. Each suggestion must have:
- "name": A creative name for the outfit (2-4 words)
- "description": Why this outfit works well together (1-2 sentences)
- "itemNames": Array of item names from the wardrobe to include
- "stylingTips": A brief styling tip (1 sentence)

Example format:
[
  {
    "name": "Casual Friday",
    "description": "A relaxed yet polished look perfect for the office.",
    "itemNames": ["Blue Shirt", "Black Pants", "White Sneakers"],
    "stylingTips": "Roll up the sleeves for a more casual vibe."
  }
]

Respond ONLY with the JSON array, no other text.`;
};

export function useAIStylist(items) {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateSuggestions = useCallback(async ({ occasion, lockedItems = [] }) => {
        if (!items || items.length < 3) {
            setError('You need at least 3 items in your wardrobe to get suggestions.');
            return;
        }

        // Only use available items
        const availableItems = items.filter(item => item.isAvailable !== false);

        if (availableItems.length < 3) {
            setError('You need at least 3 available items to get suggestions.');
            return;
        }

        setLoading(true);
        setError(null);
        setSuggestions([]);

        try {
            const wardrobeContext = availableItems.map(item => ({
                id: item.id,
                name: item.name,
                category: item.category,
                color: item.color,
                material: item.material,
                occasion: item.occasion,
            }));

            const prompt = buildStylistPrompt({
                wardrobe: wardrobeContext,
                occasion,
                lockedItems: lockedItems.map(item => ({
                    name: item.name,
                    category: item.category,
                    color: item.color,
                })),
            });

            const result = await visionModel.generateContent(prompt);
            const responseText = await result.response.text();

            // Parse the JSON response
            let parsed;
            try {
                // Clean the response - remove markdown code blocks if present
                let cleaned = responseText.trim()
                    .replace(/^```(?:json)?/i, '')
                    .replace(/```$/, '')
                    .trim();
                parsed = JSON.parse(cleaned);
            } catch (parseError) {
                console.error('Parse error:', parseError, 'Response:', responseText);
                throw new Error('Failed to parse AI response');
            }

            // Map item names to actual item objects
            const processedSuggestions = parsed.map((suggestion, index) => {
                const outfitItems = suggestion.itemNames
                    .map(itemName => {
                        // Find item by name (case-insensitive partial match)
                        return availableItems.find(item =>
                            item.name.toLowerCase().includes(itemName.toLowerCase()) ||
                            itemName.toLowerCase().includes(item.name.toLowerCase())
                        );
                    })
                    .filter(Boolean);

                return {
                    id: `suggestion-${index}-${Date.now()}`,
                    name: suggestion.name,
                    description: suggestion.description,
                    items: outfitItems,
                    stylingTips: suggestion.stylingTips,
                };
            }).filter(s => s.items.length >= 2); // Only keep suggestions with at least 2 matched items

            if (processedSuggestions.length === 0) {
                throw new Error('Could not generate matching suggestions. Try different filters.');
            }

            setSuggestions(processedSuggestions);
        } catch (err) {
            console.error('AI Stylist error:', err);
            setError(err.message || 'Failed to generate suggestions. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [items]);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
        setError(null);
    }, []);

    return {
        suggestions,
        loading,
        error,
        generateSuggestions,
        clearSuggestions,
    };
}

export default useAIStylist;
