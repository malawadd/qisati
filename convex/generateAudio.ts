"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const generateChapterAudio = action({
  args: {
    sessionId: v.id("walletSessions"),
    chapterId: v.id("chapters"),
    dialogueSegments: v.array(v.object({
      text: v.string(),
      characterId: v.string(),
      startIndex: v.number(),
      endIndex: v.number()
    }))
  },
  handler: async (ctx, args) => {
    // Verify session
    const session = await ctx.runQuery(api.queries.walletSessionById, { sessionId: args.sessionId });
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("Must be logged in to generate audio");
    }

    const appUser = await ctx.runQuery(api.queries.appUserByWalletAddress, { walletAddress: session.walletAddress });
    if (!appUser) {
      throw new Error("User not found");
    }

    // Get chapter and verify ownership
    const chapter = await ctx.runQuery(api.queries.chapterById, { id: args.chapterId });
    if (!chapter) {
      throw new Error("Chapter not found");
    }

    const series = await ctx.runQuery(api.queries.seriesById, { id: chapter.series });
    if (!series || series.author !== appUser._id) {
      throw new Error("Not authorized to generate audio for this chapter");
    }

    // Check generation limit
    const currentCount = chapter.audioGenerationCount || 0;
    if (currentCount >= 10) {
      throw new Error("Audio generation limit reached (10 per chapter)");
    }

    // Get user's character voices
    const characterVoices = await ctx.runQuery(api.queries.getCharacterVoicesByUser, { sessionId: args.sessionId });
    const voiceMap = new Map(characterVoices.map(cv => [cv._id, cv.openaiVoiceId]));

    const audioSegments = [];
    let generatedCount = 0;

    for (const segment of args.dialogueSegments) {
      if (generatedCount >= 10 || currentCount + generatedCount >= 10) {
        console.log("Reached generation limit, stopping");
        break;
      }

      const voiceId = voiceMap.get(segment.characterId);
      if (!voiceId) {
        console.log(`Voice not found for character ${segment.characterId}, skipping`);
        continue;
      }

      try {
        // Call OpenAI TTS API
        const response = await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "tts-1",
            input: segment.text,
            voice: voiceId,
            response_format: "mp3"
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API error: ${response.statusText}`);
        }

        const audioBuffer = await response.arrayBuffer();
        const audioUint8Array = new Uint8Array(audioBuffer);

        // Upload to IPFS via Pinata
        const uploadResult = await ctx.runAction(api.uploadImage.uploadImageToIPFS, {
          file: audioBuffer,
          fileName: `audio-${args.chapterId}-${generatedCount}.mp3`,
          mimeType: "audio/mpeg"
        });

        audioSegments.push({
          text: segment.text,
          audioUrl: uploadResult.url,
          characterId: segment.characterId,
          startIndex: segment.startIndex,
          endIndex: segment.endIndex
        });

        generatedCount++;
      } catch (error) {
        console.error(`Failed to generate audio for segment: ${error}`);
        // Continue with other segments
      }
    }

    // Update chapter with audio segments and increment generation count
    await ctx.runMutation(api.mutations.updateChapterAudioSegments, {
      chapterId: args.chapterId,
      audioSegments,
      audioGenerationCount: currentCount + generatedCount
    });

    return {
      success: true,
      generatedCount,
      totalSegments: audioSegments.length,
      remainingGenerations: 10 - (currentCount + generatedCount)
    };
  }
});