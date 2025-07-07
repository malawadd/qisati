"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { ActionCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";

type GenerateAudioResult = {
  success: boolean;
  generatedCount: number;
  totalSegments: number;
  remainingGenerations: number;
};

export const generateChapterAudio = action({
  args: {
    sessionId: v.id("walletSessions"),
    chapterId: v.id("chapters"),
    dialogueSegments: v.array(v.object({
      text: v.string(),
      characterId: v.id("characterVoices"),
      startIndex: v.number(),
      endIndex: v.number()
    }))
  },
  handler: async (
    ctx: ActionCtx,
    args: { 
      sessionId: Id<"walletSessions">; 
      chapterId: Id<"chapters">; 
      dialogueSegments: Array<{
        text: string; 
        characterId: Id<"characterVoices">; 
        startIndex: number; 
        endIndex: number
      }> 
    }
  ): Promise<GenerateAudioResult> => {
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
    const currentCount: number = chapter.audioGenerationCount ?? 0;
    if (currentCount >= 10) {
      throw new Error("Audio generation limit reached (10 per chapter)");
    }

    // Get user's character voices
    const characterVoices = await ctx.runQuery(api.queries.getCharacterVoicesByUser, { sessionId: args.sessionId });
    const voiceMap = new Map(characterVoices.map((cv: Doc<"characterVoices">) => [cv._id, cv.openaiVoiceId]));

    const audioSegments: Doc<"chapters">["audioSegments"] = [];
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
        console.log(`Generating audio for segment: ${segment.text}`);
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
        console.log(`Audio generated for segment: ${segment.text}---------`);
        const audioBuffer = await response.arrayBuffer();

        // Upload to IPFS via Pinata
        console.log(`Uploading audio for segment: ${segment.text}`);
        const uploadResult = await ctx.runAction(api.uploadImage.uploadImageToIPFS, {
          file: audioBuffer,
          fileName: `audio-${args.chapterId}-${generatedCount}.mp3`,
          mimeType: "audio/mpeg"
        });

        console.log(`Audio uploaded: ${uploadResult.url}`);

        audioSegments.push({
          text: segment.text,
          audioUrl: uploadResult.url,
          characterId: segment.characterId,
          startIndex: segment.startIndex,
          endIndex: segment.endIndex
        });

        generatedCount++;
      } catch (error: unknown) {
        console.error(`Failed to generate audio for segment: ${error instanceof Error ? error.message : String(error)}`);
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