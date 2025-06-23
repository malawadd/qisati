export const mockStats = {
  stories: '12.5K',
  authors: '3.2K',
  collectors: '45K',
  volume: '$2.1M'
};

export const mockStories = [
  {
    id: '1',
    title: 'The Digital Nomad Chronicles',
    author: { name: 'Sarah Chen', avatar: '' },
    cover: 'https://picsum.photos/320/180?random=1',
    price: '0.05 ETH',
    supply: { current: 150, total: 500 }
  },
  {
    id: '2',
    title: 'Midnight in Neo Tokyo',
    author: { name: 'Kenji Nakamura', avatar: '' },
    cover: 'https://picsum.photos/320/180?random=2',
    price: '0.08 ETH',
    supply: { current: 89, total: 200 }
  },
  {
    id: '3',
    title: 'The Last Library',
    author: { name: 'Maya Rodriguez', avatar: '' },
    cover: 'https://picsum.photos/320/180?random=3',
    price: '0.03 ETH',
    supply: { current: 245, total: 1000 }
  }
];

export const mockSeries = {
  id: 'digital-nomad',
  title: 'The Digital Nomad Chronicles',
  logline: 'A thrilling journey through remote work culture and digital freedom.',
  author: {
    name: 'Sarah Chen',
    bio: 'Tech journalist turned fiction writer, exploring the intersection of technology and human connection.',
    avatar: ''
  },
  cover: 'https://picsum.photos/240/360?random=1',
  synopsis: `# About This Series

This is a groundbreaking exploration of modern work culture through the lens of speculative fiction. Follow Maya as she navigates the complexities of digital nomadism in a world where physical location becomes increasingly irrelevant.

## What to Expect

- Deep character development
- Cutting-edge technology concepts  
- Real-world remote work insights
- Thrilling plot twists`,
  chapters: [
    {
      id: 1,
      title: 'The Great Escape',
      wordCount: 3500,
      status: 'live' as const,
      price: '0.02 ETH',
      supply: { current: 45, total: 100 }
    },
    {
      id: 2,
      title: 'Bali Bound',
      wordCount: 4200,
      status: 'live' as const,
      price: '0.02 ETH',
      supply: { current: 38, total: 100 }
    },
    {
      id: 3,
      title: 'The Coworking Conspiracy',
      wordCount: 3800,
      status: 'draft' as const,
      price: '0.02 ETH',
      supply: { current: 0, total: 100 }
    }
  ]
};

export const mockChapter = {
  id: '1',
  title: 'The Great Escape',
  content: `# The Great Escape

Maya stared at her laptop screen, the cursor blinking mockingly in the empty document. Three years of corporate life had drained her creativity, leaving her with nothing but spreadsheets and meeting notes.

The notification sound broke her concentration. Another Slack message from her manager about the quarterly reports. She closed the laptop with more force than necessary.

"That's it," she whispered to her empty apartment. "I'm done."

The decision came suddenly, but it felt like she'd been building toward it for months. She opened her laptop again, this time navigating to a different kind of document—her resignation letter.

## The Plan

Within hours, Maya had outlined her escape:

1. Quit her job (obviously)
2. Sell everything she couldn't carry
3. Buy a one-way ticket to Bali
4. Figure out the rest later

It wasn't the most detailed plan, but it was hers. For the first time in years, she felt truly alive.

The apartment that had felt like a prison now buzzed with possibility. Every item she looked at fell into one of two categories: essential or excess. The excess pile grew quickly.

Her phone buzzed. A text from her best friend Emma: "Coffee tomorrow?"

Maya smiled as she typed back: "Can't. I'm becoming a digital nomad."

The three dots appeared and disappeared several times before Emma's response came: "What?!"

Maya laughed out loud. This was going to be interesting.`,
  price: '0.02 ETH',
  supply: { current: 45, total: 100 },
  owned: false
};
