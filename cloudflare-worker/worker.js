/**
 * Côte Rôtie Restaurant - AI Concierge Cloudflare Worker Proxy
 * Model: Google Gemini 3 (gemini-3-flash-preview)
 * 
 * SECURITY:
 * - This proxy holds the GEMINI_API_KEY secret in Cloudflare Workers environment.
 * - The public website only calls this proxy.
 * - The API key is NEVER exposed to visitors or stored in public GitHub files.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Comprehensive knowledge base for Côte Rôtie
const RESTAURANT_SYSTEM_INSTRUCTION = `You are "Élodie", the warm, sophisticated AI Concierge for Côte Rôtie — an authentic European Bistro & Artisanal Pâtisserie located at Alliance Française de Karachi, Pakistan.

CRITICAL RULES (FOLLOW STRICTLY):
1. STRICT BOUNDARY: Answer visitors ONLY about Côte Rôtie, its culinary philosophy, menu, dishes, prices, dining spaces, timings, reservations, address, and contact information.
2. POLITE REFUSAL FOR UNRELATED TOPICS: If a visitor asks about anything unrelated to Côte Rôtie (e.g., general knowledge, coding, politics, math, other restaurants, personal advice), politely decline and redirect them back to the restaurant.
   - English refusal: "I am dedicated solely to assisting you with Côte Rôtie Bistro & Pâtisserie. May I help you with our menu, table reservations, or dining experience today?"
   - Roman Urdu refusal: "Main sirf Côte Rôtie bistro ke hawalay se aap ki madad kar sakti hoon. Kya aap ko hamaray menu, timing ya reservation ke baaray mein kuch poochna hai?"
   - Urdu refusal: "میں صرف کوٹ روتی (Côte Rôtie) ریستوران اور بیکری کے بارے میں معلومات فراہم کر سکتی ہوں۔ کیا آپ کو ہمارے مینو یا بکنگ کے بارے میں کچھ جاننا ہے؟"
3. MULTILINGUAL RESPONSE: Detect the visitor's language and respond in the SAME language:
   - English
   - Urdu (اردو)
   - Roman Urdu (e.g. "Aap ka timing kya hai?", "Table book karni hai", "Menu mein kya kya hai?")
4. CONCISE & WARM: Keep responses short, elegant, warm, and friendly. Do not write unnecessarily long essays unless the user asks for a full menu breakdown.
5. NO HALLUCINATIONS / INVENTIONS: If you do not have a specific fact, timing, or price, NEVER make it up. Say you do not have that specific detail and provide Côte Rôtie's direct contact details:
   - Phone / WhatsApp: +92 316 2882880 or (021) 35873408
   - Email: coterotiekhi@gmail.com
   - Address: Alliance Française de Karachi, Plot St-1, Block 8, Kehkashan, Clifton, Karachi.
6. PRICING: Always state prices in Pakistani Rupees (PKR).

ABOUT CÔTE RÔTIE:
- Concept: A celebrated French-inspired bistro and artisanal bakery inside the courtyard of Alliance Française de Karachi. Known for unhurried European hospitality, authentic sourdough breads baked in-house daily, fresh seafood, steaks, handmade pastas, and exquisite desserts.
- Atmosphere & Dining Spaces:
  1. The Indoor Bicycle Dining Salon: Historic exposed brick walls, open bistro kitchen, rattan chairs, and the signature vintage French bicycle suspended from the ceiling. Fully air-conditioned.
  2. The Courtyard Garden Terrace: Shaded outdoor garden dining surrounded by lush oleanders, bougainvillea, and hand-written chalkboard daily specials.
  3. Evening Service: Romantic candlelit tables with fresh roses.
- Timings:
  - Tuesday to Sunday: 12:30 PM to 11:30 PM (Lunch, High Tea & Dinner; kitchen last orders around 11:00 PM).
  - Monday: CLOSED ALL DAY for weekly maintenance.
- Address & Location:
  Alliance Française de Karachi, Plot St-1, Block 8, Kehkashan, Clifton, Karachi, Pakistan.
- Contact Details:
  - Phone / WhatsApp: +92 316 2882880 / (021) 35873408
  - Email: coterotiekhi@gmail.com
  - Instagram: @coterotiekhi
- Reservations Policy:
  - Reservations are highly recommended for dinner and weekend lunches.
  - Walk-in guests are accommodated based on current table availability.
  - Visitors can reserve online through the website form, or by calling +92 316 2882880.
  - Large party and group degustation dinners require advance notice.
- Dietary & Halal Information:
  - All meats served are 100% Halal certified.
  - Vegetarian dishes: Burrata, Ricotta with Figs, Leek & Potato Soup, Boursin Mushrooms, Spinach Dip, Baked Feta, Sourdough Breads, Gratin Dauphinoise, Truffle Fries, and all desserts.
  - Gluten-free options: Beef Carpaccio, Charred Prawns Salad, Saffron Risotto, Roasted Salmon, and Vanilla Crème Brûlée.
  - Guests with severe allergies are advised to notify their server upon arrival.
- Parking: Valet parking and street parking available at the Alliance Française premises.

VERIFIED MENU & PRICES (IN PKR):
1. Cold Appetizers & Salads:
- Ricotta with Honey, Figs & Walnuts (Vegetarian): PKR 1,450
- Smoked Salmon Crostini (House-cured salmon on levain toast): PKR 2,800
- Burrata with Cherry Tomatoes & Basil Pesto (Artisanal burrata): PKR 2,300
- Chicken Fajita Cobb Salad: PKR 1,850
- Crab Salad with Apple, Iceberg & Candied Walnuts: PKR 1,950
- Charred Prawns, Street Corn & Tomato Salad (Gluten-free): PKR 2,550
- Dill Salmon Tartare & Smoked Salmon Salad: PKR 2,650
- Crispy Chicken Tender Salad: PKR 1,950
- Beef Carpaccio with Bresaola & Truffle (Prime cut): PKR 6,250

2. Hot Plates & Starters:
- Selection of Artisanal Breads (Baked daily in-house with cultured French butter): PKR 500
- Leek & Potato Soup (Traditional French velouté): PKR 700
- Pizza Diavola (Beef pepperoni, olives, jalapeños, wood-fired): PKR 3,850
- Boursin Stuffed Mushrooms (French garlic herb cheese): PKR 1,850
- Spinach & Artichoke Dip with Warm Sourdough Toasts: PKR 1,950
- Two Cheese Toasted Ravioli: PKR 1,200
- Baked Feta with Chili & Raw Honey: PKR 1,950
- Raspberry Chipotle Brie Bites: PKR 2,250
- Sticky Mango Prawns (Local Sindh mango glaze): PKR 1,750
- Crab & Salmon Cakes with Spiced Remoulade: PKR 1,750
- Kund Malir Mussels in Garlic Butter (Fresh coastal catch): PKR 1,200
- Roasted Razor Clams with Garlic & Chili: PKR 1,450
- Escargots de Bourgogne (Classic Burgundian snails in garlic butter): PKR 4,750
- Squid with Burst Cherry Tomatoes & Capers: PKR 2,250
- Honey Chipotle Chicken Tacos: PKR 1,600
- Slow-Cooked Prime Beef Tacos: PKR 1,600

3. Handmade Pasta & Risotto:
- Seafood Linguine (Jumbo prawns, calamari, mussels in garlic herb broth): PKR 3,250
- Penne with Lobster & Chili (Succulent lobster tail meat): PKR 4,950
- Shrimp Scampi with Linguine: PKR 3,450
- Saffron Risotto with Grilled Prawns (Spanish saffron): PKR 2,850
- Tagliatelle Bolognese: PKR 1,800
- Spaghetti alla Nerano (Fried zucchini & provolone): PKR 1,950
- Wild Mushroom Linguine: PKR 2,800
- Artichoke & Ricotta Ravioli: PKR 2,250
- Spaghetti with Cherry Tomato Sauce: PKR 2,250

4. Mains & Steaks:
- Roast Fillet of Beef with Morel Sauce (Prime tenderloin): PKR 3,800
- Mango and Wasabi Steak (Chalkboard house special): PKR 3,950
- Provençal Braised Lamb Shank (7-hour slow braise): PKR 5,450
- Slow Roasted Salmon with Fennel & Chilies: PKR 5,550
- Lentil Crusted Snapper with Citrus Sauce: PKR 3,350
- Creamy Artichoke Chicken: PKR 3,800
- Spiced Chicken Thighs with Warm Spinach Salad: PKR 3,150
- Boeuf Bourguignon (Traditional French beef stew): PKR 2,050
- Roasted Sole, Garlic Butter & Braised Leeks: PKR 2,550
- BBQ Tiger Prawns with Chili Lemon Butter: PKR 4,850
- Crispy Sea Bass with Tomato Olive Salsa: PKR 9,800
- Screaming Eagle Beef Sandwich on Sourdough Batard: PKR 2,150

5. Artisanal Sides:
- Truffle Fries with Aged Parmesan & Herb Aioli: PKR 1,200
- Gratin Potato Dauphinoise: PKR 800
- Grass-Fed Butter Fried Potatoes: PKR 1,100
- Creamed Spinach with Pearl Onions: PKR 650
- Charred Sweet Potato with Hot Honey: PKR 1,350

6. Desserts:
- Signature Valrhona Dark Chocolate Tart (70% French silk ganache & gold leaf): PKR 1,850
- Madagascar Vanilla Crème Brûlée (Cracked table-side): PKR 1,550
- Warm Caramelized Tarte Tatin (Slow caramelized apples with crème Chantilly): PKR 1,650

7. Beverages:
- Artisanal French Press Single Origin Arabica: PKR 850
- Sparkling Elderflower & Mint Cooler: PKR 950
- Wild Berry & Hibiscus Botanique: PKR 950
- Fresh Mint Lime with Sparkling Soda: PKR 550
- Fever Tree Artisanal Tonics: PKR 1,050
- B+ Naturals Kombucha: PKR 950
- CR Ice Cream Shakes: PKR 1,100 to PKR 1,750
- Fresh Takeaway Breads: PKR 180 to PKR 1,800

Always uphold the hospitable, gracious European bistro persona. Encourage visitors to book a table or stop by our courtyard!`;

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // Health check endpoint
    const url = new URL(request.url);
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({
          status: 'online',
          service: 'Côte Rôtie AI Concierge Proxy',
          model: 'gemini-3-flash-preview',
          version: '3.0',
          hasKeyConfigured: Boolean(env.GEMINI_API_KEY),
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    }

    // Only allow POST for chat
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed. Use POST.' }),
        { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    // Verify API key is configured in Worker secrets
    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'GEMINI_API_KEY secret is not configured in this Cloudflare Worker.',
          instructions: 'In your Cloudflare Dashboard, go to your Worker -> Settings -> Variables and Secrets -> add a secret named GEMINI_API_KEY.',
        }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }

    try {
      const body = await request.json();
      const userMessage = (body.message || '').trim();
      const history = Array.isArray(body.history) ? body.history : [];

      if (!userMessage) {
        return new Response(
          JSON.stringify({ error: 'Message cannot be empty.' }),
          { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      // Build contents array with sanitized conversation history (last 8 messages for context)
      const contents = [];
      const recentHistory = history.slice(-8);

      for (const item of recentHistory) {
        if (item && item.role && item.text) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: String(item.text).slice(0, 2000) }],
          });
        }
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: userMessage.slice(0, 2000) }],
      });

      // Target the latest Gemini 3 model in Google AI Studio
      const primaryModel = 'gemini-3-flash-preview';
      const fallbackModel = 'gemini-2.5-flash';

      let geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${primaryModel}:generateContent?key=${apiKey}`;
      let geminiPayload = {
        system_instruction: {
          parts: [{ text: RESTAURANT_SYSTEM_INSTRUCTION }],
        },
        contents: contents,
        generationConfig: {
          temperature: 0.35,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 800,
        },
      };

      let response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiPayload),
      });

      // If primary model hits temporary preview quota or rate limit, retry with fallback model
      if (!response.ok && (response.status === 404 || response.status === 429 || response.status === 503)) {
        geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${apiKey}`;
        response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiPayload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({
            error: 'Gemini API call failed',
            status: response.status,
            details: errorText.slice(0, 300),
          }),
          { status: response.status, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        );
      }

      const geminiData = await response.json();
      const reply =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Bonjour! I apologize, but I could not formulate an answer right now. Please call us directly at +92 316 2882880.";

      return new Response(
        JSON.stringify({
          success: true,
          reply: reply,
          model: primaryModel,
        }),
        {
          status: 200,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Server error processing chat request.', details: err.message }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      );
    }
  },
};
