export interface InstructionTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
}

export const instructionTemplates: InstructionTemplate[] = [
  {
    id: 'bedtime-story',
    name: 'Bedtime Story',
    description: 'Gentle, magical narrator for children\'s stories',
    template: `Affect: A gentle, curious narrator with a British accent, guiding a magical, child-friendly adventure through a fairy tale world.

Tone: Magical, warm, and inviting, creating a sense of wonder and excitement for young listeners.

Pacing: Steady and measured, with slight pauses to emphasize magical moments and maintain the storytelling flow.

Emotion: Wonder, curiosity, and a sense of adventure, with a lighthearted and positive vibe throughout.

Pronunciation: Clear and precise, with an emphasis on storytelling, ensuring the words are easy to follow and enchanting to listen to.`
  },
  {
    id: 'sincere',
    name: 'Sincere',
    description: 'Calm, empathetic, and trustworthy voice',
    template: `Voice Affect: Calm, composed, and reassuring. Competent and in control, instilling trust.

Tone: Sincere, empathetic, with genuine concern for the customer and understanding of the situation.

Pacing: Slower during the apology to allow for clarity and processing. Faster when offering solutions to signal action and resolution.

Emotions: Calm reassurance, empathy, and gratitude.

Pronunciation: Clear, precise: Ensures clarity, especially with key details. Focus on key words like "refund" and "patience."

Pauses: Before and after the apology to give space for processing the apology.`
  },
  {
    id: 'sympathetic',
    name: 'Sympathetic',
    description: 'Warm, understanding, and supportive voice',
    template: `Voice: Warm, empathetic, and professional, reassuring the customer that their issue is understood and will be resolved.

Punctuation: Well-structured with natural pauses, allowing for clarity and a steady, calming flow.

Delivery: Calm and patient, with a supportive and understanding tone that reassures the listener.

Phrasing: Clear and concise, using customer-friendly language that avoids jargon while maintaining professionalism.

Tone: Empathetic and solution-focused, emphasizing both understanding and proactive assistance.`
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clear, authoritative, and composed business voice',
    template: `Voice: Clear, authoritative, and composed, projecting confidence and professionalism.

Tone: Neutral and informative, maintaining a balance between formality and approachability.

Punctuation: Structured with commas and pauses for clarity, ensuring information is digestible and well-paced.

Delivery: Steady and measured, with slight emphasis on key figures and deadlines to highlight critical points.`
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    description: 'Suspenseful, mysterious, and intense voice',
    template: `Voice Affect: Low, hushed, and suspenseful; convey tension and intrigue.

Tone: Deeply serious and mysterious, maintaining an undercurrent of unease throughout.

Pacing: Slow, deliberate, pausing slightly after suspenseful moments to heighten drama.

Emotion: Restrained yet intense—voice should subtly tremble or tighten at key suspenseful points.

Emphasis: Highlight sensory descriptions ("footsteps echoed," "heart hammering," "shadows melting into darkness") to amplify atmosphere.

Pronunciation: Slightly elongated vowels and softened consonants for an eerie, haunting effect.

Pauses: Insert meaningful pauses after phrases like "only shadows melting into darkness," and especially before the final line, to enhance suspense dramatically.`
  },
  {
    id: 'fitness-instructor',
    name: 'Fitness Instructor',
    description: 'High-energy, motivational, and encouraging voice',
    template: `Voice: High-energy, upbeat, and encouraging, projecting enthusiasm and motivation.

Punctuation: Short, punchy sentences with strategic pauses to maintain excitement and clarity.

Delivery: Fast-paced and dynamic, with rising intonation to build momentum and keep engagement high.

Phrasing: Action-oriented and direct, using motivational cues to push participants forward.

Tone: Positive, energetic, and empowering, creating an atmosphere of encouragement and achievement.`
  },
  {
    id: 'wise-mentor',
    name: 'Wise Mentor',
    description: 'Thoughtful, experienced, and guiding voice',
    template: `Voice: Deep, thoughtful, and measured, conveying wisdom and experience gained through years of learning.

Tone: Patient, understanding, and encouraging, with a gentle authority that inspires confidence.

Pacing: Deliberate and unhurried, allowing time for important concepts to resonate and be absorbed.

Emotion: Compassionate wisdom, quiet confidence, and genuine care for the listener's growth.

Pronunciation: Clear and articulate, with emphasis on key insights and meaningful pauses for reflection.

Delivery: Speaks as one who has walked the path before, offering guidance with humility and genuine desire to help.`
  },
  {
    id: 'mysterious-narrator',
    name: 'Mysterious Narrator',
    description: 'Enigmatic, intriguing, and captivating storyteller',
    template: `Voice Affect: Smooth, enigmatic, and slightly otherworldly, drawing listeners into hidden secrets and untold mysteries.

Tone: Intriguing and captivating, with an air of knowing more than what is being revealed.

Pacing: Varied tempo—slower for building suspense, quicker for revelations, with strategic pauses to heighten curiosity.

Emotion: Controlled intrigue, subtle excitement, and an underlying sense of ancient knowledge.

Pronunciation: Precise articulation with a slight emphasis on mysterious words and concepts.

Emphasis: Highlight clues, secrets, and revelations while maintaining an air of mystery throughout.`
  },
  {
    id: 'cheerful-companion',
    name: 'Cheerful Companion',
    description: 'Bright, friendly, and optimistic voice',
    template: `Voice: Bright, warm, and genuinely friendly, like a close companion sharing exciting news.

Tone: Optimistic, enthusiastic, and supportive, radiating positivity and genuine care.

Pacing: Lively and engaging, with natural rhythm that feels conversational and approachable.

Emotion: Joy, excitement, and sincere friendship, creating an atmosphere of shared happiness.

Pronunciation: Clear and expressive, with natural inflections that convey genuine emotion.

Delivery: Speaks with the warmth of a trusted friend, celebrating successes and offering encouragement.`
  },

  
];

export const getTemplateById = (id: string): InstructionTemplate | undefined => {
  return instructionTemplates.find(template => template.id === id);
};

export const getTemplateNames = (): Array<{ id: string; name: string; description: string }> => {
  return instructionTemplates.map(template => ({
    id: template.id,
    name: template.name,
    description: template.description
  }));
};