# Qisati: Read. Collect. Own.

Qisati is a revolutionary platform designed to empower storytellers and engage readers in entirely new ways. We bridge the world of creative writing with cutting-edge blockchain technology, allowing authors to monetize their work directly and readers to truly own the stories they love.

## ✨ Main Functionality

Qisati offers a comprehensive ecosystem for digital storytelling:

*   **Discover & Read**: Explore a diverse collection of stories, from captivating fanfictions to original literary works.
*   **Collect & Own**: Acquire limited editions of chapters and series as digital assets, giving you true ownership and a direct stake in your favorite authors' success.
*   **Create & Publish**: Authors can easily write, edit, and publish their stories, controlling their content and earning directly from their audience.
*   **Immersive Audio Dramas**: Transform written narratives into engaging audio experiences with AI-powered voice generation.
*   **Creator Coins**: Launch your own digital currency for your series, fostering a direct connection with your community and unlocking new monetization avenues.

## 🎧 Audio Drama from Fanfictions: Bringing Stories to Life

Imagine your favorite fanfiction not just as text, but as an immersive audio drama, complete with distinct character voices. Qisati makes this a reality. We leverage advanced AI text-to-speech technology to convert your written dialogue into high-quality audio segments. Authors can assign unique voices to their characters, adding a new dimension to their storytelling and providing an unparalleled listening experience for their readers.

This feature transforms passive reading into active listening, making stories more accessible and engaging. It's a powerful tool for authors to expand their reach and for readers to experience narratives in a richer, more dynamic format.

**Implementation Highlights:**
*   **Frontend for Audio Generation**: `src/components/editor/AudioGenerationPanel.tsx`
*   **Backend Audio Processing**: `convex/generateAudio.ts`

## 🪙 Zora & Creator Coins: Empowering the New Creator Economy

At the heart of Qisati's monetization model is the integration with the Zora Network, a Layer 2 blockchain optimized for the creator economy. Zora empowers creators by enabling them to mint, own, and trade their content seamlessly, removing traditional middlemen and fostering direct engagement with their audience. [1, 2, 3, 7]

With Qisati, authors can launch their own **Creator Coins** for their series. These are digital assets that represent a direct stake in the author's work and community. [4] When readers buy these coins, they directly support the author, and the value of the coin can grow with the popularity and engagement around the series. This creates a new, transparent, and community-driven economic model where both creators and their supporters can benefit. [5, 6, 8, 9]

**Key Benefits of Creator Coins:**
*   **Direct Monetization**: Authors earn directly from their community without intermediaries. [6, 7]
*   **Community Building**: Fans can signal support and share in the upside of a creator's growth. [4]
*   **True Ownership**: Digital assets are owned on-chain, providing transparency and control. [7]
*   **New Business Models**: Enables innovative ways for creators to fund their work and engage with their audience. [1]

**Implementation Highlights:**
*   **Launching Creator Coins**: `src/components/editor/LaunchCoinButton.tsx`
*   **Backend Minting Logic**: `convex/mintChapter.ts`
*   **Displaying Coin Information**: `src/components/coin/CoinTradingDetails.tsx`, `src/components/coin/TradingScreen.tsx`

## 🛠️ Technology Stack

Qisati is built with a modern and robust technology stack:

*   **Frontend**: React, Tailwind CSS
*   **Backend & Database**: Convex (serverless backend, real-time database, and actions) 
*   **Coin creation*: Zora Network 
*   **Text Editor**: Tiptap 
*   **Authentication**: Tomo Network 
*   **IPFS Storage**: Pinata 

## 🚀 Getting Started

To run Qisati locally:

1.  **Clone the repository.**
2.  **Install dependencies:** `npm install`
3.  **Set up Convex:** Follow the instructions to connect to your Convex deployment.
4.  **Run the development servers:** `npm run dev`

This will start both the frontend and backend development servers, allowing you to explore Qisati's features.

## 🚀 What’s Next?

Here are some planned enhancements and ideas for future development:  

### 1. Enhance Zora Integration and NFT Features (depends on if Zora wants this)
- [ ] **Full NFT Lifecycle Management:** Let users view, manage, and transfer their collected chapter/series NFTs within the platform, with deeper Zora API integration for metadata and ownership.  
- [ ] **Secondary Marketplace Integration:** Link to and display listings on secondary marketplaces (e.g., Zora’s own) for trading collected digital assets.  
- [ ] **On-chain Data Synchronization:** Improve real-time syncing of on-chain data (supply, price, ownership) for Creator Coins.  
- [ ] **Royalty Distribution:** Add automated royalty distribution logic for co-authors or other beneficiaries based on smart contracts.  

### 2. Refine Audio Drama Features
- [ ] **More Voice Customization:** Offer finer control over AI-generated voices (pitch, speed, emotion).  
- [ ] **Background Music & Effects:** Enable adding ambient music and sound effects for immersive audio experiences.  
- [ ] **Audio Editing Tools:** Provide simple tools to trim, merge, or reorder audio segments.  
- [ ] **Accessibility Features:** Add playback speed controls, volume normalization, and transcripts.  

### 3. Improve Content Creation & Management
- [ ] **Advanced Editor Features:** Add version history, collaborative editing, and richer text layout options.  
- [ ] **Series & Chapter Organization:** Better tools to organize series, reorder chapters, and manage drafts.  
- [ ] **Content Analytics:** Show insights on reader engagement, chapter popularity, and audio plays.  

### 4. Enhance User Experience & Community Features
- [ ] **Personalized Discovery:** Build a recommendation engine based on reader preferences.  
- [ ] **Commenting & Interaction:** Full-featured comments with replies, likes, and notifications.  
- [ ] **Following System:** More robust following with activity feeds and author updates.  
- [ ] **Responsive Design:** Ensure an optimal experience across desktop, tablet, and mobile devices.  
