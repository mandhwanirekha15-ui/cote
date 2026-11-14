# Cloudflare Worker AI Proxy for Côte Rôtie

This free Cloudflare Worker acts as a secure reverse proxy for the **Google Gemini 3 API**.

### Why is this needed?
When your Côte Rôtie website is hosted publicly on **GitHub Pages**, your frontend JavaScript code is visible to anyone who visits the site. Placing your Google Gemini API key directly into client-side JavaScript would allow anyone to steal your key and quota.

By using this Cloudflare Worker:
1. **Your API key is stored as an encrypted secret in Cloudflare.**
2. Your public website makes requests **only** to your Worker endpoint (`https://<your-worker>.workers.dev/api/chat`).
3. The Worker calls Google's Gemini 3 API with the secret key and the restaurant's complete knowledge base, then sends back the response.
4. **100% Free**: Cloudflare Workers offers 100,000 free requests per day, far exceeding normal restaurant traffic.

---

## 🚀 Quick Setup (Method A: 100% Web Dashboard — 2 Minutes)

You don't need to install any software or command line tools!

### Step 1: Create a Free Cloudflare Account
1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) and create a free account (no credit card required).

### Step 2: Create a New Worker
1. In the left navigation menu, click **Workers & Pages**.
2. Click the blue **Create application** (or **Create Worker**) button.
3. Name your worker (for example: `coterotie-ai-proxy`).
4. Click **Deploy**.

### Step 3: Paste the Worker Code
1. On your worker's overview page, click **Edit code** (in the top right corner).
2. Delete everything inside the editor (`worker.js`).
3. Open the file `cloudflare-worker/worker.js` from this project, copy the entire contents, and paste it into the Cloudflare code editor.
4. Click the blue **Deploy** button in the top right corner.

### Step 4: Add Your Gemini API Key Secret
1. Click the back arrow `<-` to return to your Worker's overview page.
2. Go to the **Settings** tab.
3. In the left menu of Settings, select **Variables and Secrets** (or **Variables**).
4. Under **Secrets**, click **Add** (or **Add Secret**).
5. Set the Variable name to:
   ```
   GEMINI_API_KEY
   ```
6. Paste your Google Gemini API key into the value field.
7. Click **Deploy** / **Save**.

### Step 5: Copy Your Worker URL
1. At the top of your Worker's overview page, you will see your Worker URL, for example:
   ```
   https://coterotie-ai-proxy.<your-subdomain>.workers.dev
   ```
2. Test it by opening that URL in your browser. You should see:
   ```json
   {"status":"online","service":"Côte Rôtie AI Concierge Proxy","model":"gemini-3-flash-preview","hasKeyConfigured":true}
   ```
3. Copy this URL.

### Step 6: Connect it to Your Website
Open `chat.js` or the website settings and set:
```javascript
const WORKER_PROXY_URL = 'https://coterotie-ai-proxy.<your-subdomain>.workers.dev';
```
*(You can also click the ⚙️ icon inside the website's chat window to set or change your Worker URL anytime!)*

---

## 💻 Alternative Setup (Method B: Command Line with Wrangler)

If you have Node.js installed and prefer the command line:

```bash
cd cloudflare-worker

# 1. Login to Cloudflare
npx wrangler login

# 2. Upload your secret API key
npx wrangler secret put GEMINI_API_KEY
# (When prompted, paste your key from private/api_key.txt)

# 3. Deploy the worker
npx wrangler deploy
```

The output will display your live worker URL!

---

## 🔒 Security Guarantee
- **Never commit** `private/` or your API key to any public repository.
- Verify `.gitignore` contains `private/`.
- Your public website code calls **only** your Cloudflare Worker URL.
