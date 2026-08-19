import OpenAI from "openai";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

//==================================================
// OPENAI
//==================================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

//==================================================
// SUPABASE
//==================================================

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

//==================================================
// API HANDLER
//==================================================

export default async function handler(req, res) {
  //==================================================
  // DIAGNOSTIC
  //==================================================
  // IMPORTANT:
  // These only report whether the environment variables
  // exist. They NEVER print the actual secret values.
  //==================================================

  console.log(
    "SUPABASE_URL exists:",
    !!process.env.SUPABASE_URL
  );

  console.log(
    "SUPABASE_SERVICE_ROLE_KEY exists:",
    !!process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  //==================================================
  // CORS
  //==================================================

  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  );

  res.setHeader(
    "Access-Control-Allow-Methods",
    "POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  //==================================================
  // PREFLIGHT
  //==================================================

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  //==================================================
  // ONLY ALLOW POST
  //==================================================

  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      ["POST", "OPTIONS"]
    );

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    //==================================================
    // GET DATA
    //==================================================

    const {
      image,
      mimeType,
      questName,
      questDescription,
      playerId,
    } = req.body || {};

    //==================================================
    // VALIDATE IMAGE
    //==================================================

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "An image is required.",
      });
    }

    //==================================================
    // VALIDATE QUEST
    //==================================================

    if (!questName) {
      return res.status(400).json({
        success: false,
        error: "A quest name is required.",
      });
    }

    //==================================================
    // CREATE IMAGE HASH
    //==================================================

    const imageHash = crypto
      .createHash("sha256")
      .update(image)
      .digest("hex");

    console.log(
      "QLAI image hash:",
      imageHash
    );

    //==================================================
    // CHECK FOR DUPLICATE PROOF
    //==================================================

    const {
      data: existingProof,
      error: duplicateCheckError,
    } = await supabase
      .from("proof_submissions")
      .select("id, quest_name, submitted_at")
      .eq("image_hash", imageHash)
      .maybeSingle();

    if (duplicateCheckError) {
      console.error(
        "Supabase duplicate check error:",
        duplicateCheckError
      );

      return res.status(500).json({
        success: false,
        error:
          "Unable to verify proof history.",
      });
    }

    //==================================================
    // DUPLICATE FOUND
    //==================================================

    if (existingProof) {
      console.warn(
        "Duplicate proof detected:",
        imageHash
      );

      return res.status(409).json({
        success: false,

        approved: false,

        confidence: 0,

        reason:
          "This exact proof image has already been submitted. Please submit a different photo as proof.",

        requestBetterProof: true,

        duplicate: true,

        antiCheat: {
          suspicious: true,
          screenshot: false,
          manipulation: false,
          unrelatedEvidence: false,
          reason:
            "The exact same proof image was previously submitted.",
        },
      });
    }

    //==================================================
    // QLAI ANALYSIS
    //==================================================

    const response =
      await openai.responses.create({
        model: "gpt-5-mini",

        input: [
          {
            role: "system",

            content: `
You are QLAI, the Quest Lives Artificial Intelligence.

Your job is to review player-submitted proof
for real-world quests.

You must determine whether the submitted image
provides convincing visual evidence that the player
completed the specific quest.

Be fair but strict.

==================================================
APPROVAL RULES
==================================================

Only approve proof when the image provides
reasonable visual evidence that the quest was completed.

The quest description is the source of truth for
what the player was supposed to accomplish.

Do NOT assume something happened if the image does
not reasonably support it.

Do NOT approve an image simply because it contains
something vaguely related to the quest.

A photo does not need to prove every tiny detail,
but it must provide meaningful evidence.

The final approval threshold is 85%.

If confidence is below 85%, the proof MUST be rejected.

If proof is rejected, the player should be asked
to submit better proof.

==================================================
ANTI-CHEATING CHECKS
==================================================

Examine the submitted image for potential
proof manipulation or suspicious evidence.

Look for signs such as:

- The image appears to be a screenshot rather than
  an original real-world photograph.
- The image appears to be a photograph of another
  screen.
- The image appears heavily edited or manipulated.
- The image appears unrelated to the claimed quest.
- The image appears to be reused or intentionally
  misleading.
- The evidence is suspiciously artificial or staged
  in a way that prevents reasonable verification.
- The image does not provide enough visual evidence
  to determine whether the quest was completed.

IMPORTANT:

Do NOT claim with certainty that an image is
AI-generated or manipulated when visual evidence
cannot establish that.

Instead, identify suspicious indicators and explain
why they may require additional verification.

==================================================
CONFIDENCE
==================================================

Return a confidence score from 0 to 100.

Confidence represents how strongly the image supports
actual completion of the quest.

==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "approved": true,
  "confidence": 92,
  "reason": "Brief explanation of the evidence.",
  "requestBetterProof": false,
  "antiCheat": {
    "suspicious": false,
    "screenshot": false,
    "manipulation": false,
    "unrelatedEvidence": false,
    "reason": "Brief explanation of the anti-cheating assessment."
  }
}

Rules:

- "approved" should reflect whether the proof appears
  sufficient, but the server will enforce the 85%
  threshold independently.
- "requestBetterProof" must be true whenever the
  confidence is below 85.
- "antiCheat.suspicious" should be true when there
  are meaningful warning signs.
- Do not invent evidence that cannot be seen.
- Keep all reasons brief.
`,
          },

          {
            role: "user",

            content: [
              {
                type: "input_text",

                text: `
QUEST NAME:
${questName}

QUEST DESCRIPTION:
${questDescription || "No description provided."}

Analyze the player's submitted proof image.

Determine whether the image provides convincing
evidence that this specific quest was completed.

Also perform the anti-cheating checks described
in the system instructions.
`,
              },

              {
                type: "input_image",

                image_url:
                  `data:${mimeType || "image/jpeg"};base64,${image}`,
              },
            ],
          },
        ],
      });

    //==================================================
    // READ AI RESPONSE
    //==================================================

    const output =
      response.output_text;

    let result;

    try {
      result = JSON.parse(output);
    } catch {
      console.error(
        "QLAI returned invalid JSON:",
        output
      );

      return res.status(500).json({
        success: false,
        error:
          "QLAI returned an invalid response.",
      });
    }

    //==================================================
    // VALIDATE CONFIDENCE
    //==================================================

    const confidence =
      Math.max(
        0,
        Math.min(
          100,
          Number(result.confidence) || 0
        )
      );

    //==================================================
    // SERVER-SIDE APPROVAL
    //==================================================

    const approved =
      confidence >= 85;

    //==================================================
    // REQUEST BETTER PROOF
    //==================================================

    const requestBetterProof =
      !approved;

    //==================================================
    // REASON
    //==================================================

    let reason = String(
      result.reason ||
        "QLAI completed its analysis."
    );

    if (!approved) {
      reason =
        `${reason} Please submit better proof that more clearly demonstrates completion of the quest.`;
    }

    //==================================================
    // ANTI-CHEAT RESULT
    //==================================================

    const aiAntiCheat =
      result.antiCheat || {};

    const antiCheat = {
      suspicious:
        aiAntiCheat.suspicious === true,

      screenshot:
        aiAntiCheat.screenshot === true,

      manipulation:
        aiAntiCheat.manipulation === true,

      unrelatedEvidence:
        aiAntiCheat.unrelatedEvidence === true,

      reason: String(
        aiAntiCheat.reason ||
          "No significant visual cheating indicators were detected."
      ),
    };

    //==================================================
    // SAVE PROOF HASH
    //==================================================
    // Every new proof is stored, including rejected
    // proofs. This prevents the exact same image from
    // being submitted again later.

    const {
      error: insertError,
    } = await supabase
      .from("proof_submissions")
      .insert({
        player_id:
          String(playerId || "unknown"),

        quest_name:
          String(questName),

        image_hash:
          imageHash,
      });

    //==================================================
    // HANDLE DATABASE INSERT ERROR
    //==================================================

    if (insertError) {
      console.error(
        "Supabase proof save error:",
        insertError
      );

      // A duplicate could theoretically occur if two
      // identical submissions arrive at nearly the
      // exact same time.

      if (
        insertError.code === "23505"
      ) {
        return res.status(409).json({
          success: false,

          approved: false,

          confidence: 0,

          reason:
            "This proof has already been submitted. Please submit a different photo.",

          requestBetterProof: true,

          duplicate: true,

          antiCheat: {
            suspicious: true,
            screenshot: false,
            manipulation: false,
            unrelatedEvidence: false,
            reason:
              "This proof was already recorded in Quest Lives.",
          },
        });
      }

      return res.status(500).json({
        success: false,
        error:
          "QLAI completed its analysis, but the proof could not be saved.",
      });
    }

    //==================================================
    // SUCCESS
    //==================================================

    return res.status(200).json({
      success: true,

      approved,

      confidence,

      reason,

      requestBetterProof,

      duplicate: false,

      antiCheat,

      imageHash,
    });

  } catch (error) {

    //==================================================
    // ERROR
    //==================================================

    console.error(
      "QLAI API error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "QLAI analysis failed.",
    });
  }
}