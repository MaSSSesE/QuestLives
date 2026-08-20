import crypto from "crypto";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "25mb",
    },
  },
};

const OLLAMA_URL =
  process.env.OLLAMA_URL || "http://127.0.0.1:11434";

const OLLAMA_MODEL =
  process.env.OLLAMA_MODEL || "qwen3-vl:2b";

const SUPABASE_URL =
  process.env.SUPABASE_URL || "";

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function getKeyDiagnostics() {
  const key = SUPABASE_SERVICE_ROLE_KEY;

  return {
    exists: !!key,
    prefix:
      key.length >= 12
        ? key.substring(0, 12)
        : key,
    length: key.length,
  };
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(
    `${SUPABASE_URL}${path}`,
    {
      ...options,

      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,

        Authorization:
          `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,

        "Content-Type": "application/json",

        ...(options.headers || {}),
      },
    }
  );

  const text = await response.text();

  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const error =
      new Error(
        `Supabase request failed with status ${response.status}.`
      );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
}

function parseOllamaJson(output) {
  if (!output) {
    throw new Error(
      "Ollama returned an empty response."
    );
  }

  if (
    typeof output === "object" &&
    output !== null
  ) {
    return output;
  }

  let text = String(output).trim();

  if (!text) {
    throw new Error(
      "Ollama returned an empty response."
    );
  }

  // Remove Markdown JSON fences if the model adds them.
  text = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First attempt: parse the complete response.
  try {
    return JSON.parse(text);
  } catch {
    // Continue with extraction below.
  }

  // Some local models can place extra text before or after
  // the JSON object. Extract the outermost JSON object.
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (
    firstBrace !== -1 &&
    lastBrace !== -1 &&
    lastBrace > firstBrace
  ) {
    const possibleJson =
      text.substring(
        firstBrace,
        lastBrace + 1
      );

    try {
      return JSON.parse(possibleJson);
    } catch {
      // Continue to final error.
    }
  }

  throw new Error(
    "Ollama response did not contain valid JSON."
  );
}

export default async function handler(req, res) {
  console.log(
    "=========================================="
  );

  console.log(
    "QLAI ENVIRONMENT DIAGNOSTIC"
  );

  console.log(
    "SUPABASE_URL:",
    SUPABASE_URL
  );

  console.log(
    "SUPABASE_SERVICE_ROLE_KEY exists:",
    !!SUPABASE_SERVICE_ROLE_KEY
  );

  console.log(
    "SUPABASE_SERVICE_ROLE_KEY prefix:",
    getKeyDiagnostics().prefix
  );

  console.log(
    "SUPABASE_SERVICE_ROLE_KEY length:",
    getKeyDiagnostics().length
  );

  console.log(
    "OLLAMA_URL:",
    OLLAMA_URL
  );

  console.log(
    "OLLAMA_MODEL:",
    OLLAMA_MODEL
  );

  console.log(
    "=========================================="
  );

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

  if (req.method === "OPTIONS") {
    return res
      .status(200)
      .end();
  }

  if (req.method !== "POST") {
    res.setHeader(
      "Allow",
      "POST, OPTIONS"
    );

    return res
      .status(405)
      .json({
        success: false,
        error:
          "Method not allowed.",
      });
  }

  try {
    if (!SUPABASE_URL) {
      return res
        .status(500)
        .json({
          success: false,
          error:
            "SUPABASE_URL is missing.",
        });
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return res
        .status(500)
        .json({
          success: false,
          error:
            "SUPABASE_SERVICE_ROLE_KEY is missing.",
        });
    }

    const body =
      req.body || {};

    console.log(
      "QLAI request body received:",
      !!req.body
    );

    const {
      image,
      mimeType,
      questName,
      questDescription,
      playerId,
    } = body;

    if (!image) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "An image is required.",
        });
    }

    if (!questName) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "A quest name is required.",
        });
    }

    const imageHash =
      crypto
        .createHash("sha256")
        .update(String(image))
        .digest("hex");

    console.log(
      "QLAI image hash:",
      imageHash
    );

    const duplicatePath =
      `/rest/v1/proof_submissions` +
      `?select=id,quest_name,submitted_at` +
      `&image_hash=eq.${encodeURIComponent(imageHash)}` +
      `&limit=1`;

    let existingProofs;

    try {
      existingProofs =
        await supabaseRequest(
          duplicatePath,
          {
            method: "GET",
          }
        );
    } catch (error) {
      console.error(
        "Supabase duplicate check error:",
        error
      );

      console.error(
        "Supabase error data:",
        error.data
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "Unable to verify proof history.",
        });
    }

    const existingProof =
      Array.isArray(existingProofs) &&
      existingProofs.length > 0
        ? existingProofs[0]
        : null;

    if (existingProof) {
      return res
        .status(409)
        .json({
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

    const cleanImage =
      String(image)
        .replace(
          /^data:image\/[^;]+;base64,/,
          ""
        )
        .trim();

    const systemPrompt = `
You are QLAI, the Quest Lives Artificial Intelligence.

Review player-submitted proof for real-world quests.

Approve only when the image provides convincing
visual evidence that the specific quest was completed.

Be fair but strict.

The final approval threshold is 85%.

Look for suspicious screenshots, photographs of
screens, manipulation, unrelated evidence, reused
evidence, or insufficient visual evidence.

Do not claim AI generation or manipulation with
certainty when the image cannot establish it.

Return ONLY valid JSON.

Use exactly:

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
    "reason": "Brief explanation."
  }
}

Important:
The confidence score must be a number from 0 to 100.
If confidence is below 85, approved should be false.
If confidence is below 85, requestBetterProof should be true.
`;

    const userPrompt = `
QUEST NAME:
${questName}

QUEST DESCRIPTION:
${questDescription || "No description provided."}

Analyze the submitted proof image and determine
whether it provides convincing evidence that this
specific quest was completed.

Also check for suspicious or misleading evidence.
`;

    console.log(
      "QLAI sending request to Ollama..."
    );

    const ollamaResponse =
      await fetch(
        `${OLLAMA_URL}/api/chat`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            model:
              OLLAMA_MODEL,

            stream: false,

            format: "json",

            messages: [
              {
                role: "system",
                content:
                  systemPrompt,
              },

              {
                role: "user",
                content:
                  userPrompt,

                images: [
                  cleanImage,
                ],
              },
            ],
          }),
        }
      );

    if (!ollamaResponse.ok) {
      const ollamaError =
        await ollamaResponse.text();

      console.error(
        "Ollama request failed:",
        ollamaResponse.status,
        ollamaError
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "QLAI could not contact Ollama.",
        });
    }

    const ollamaData =
      await ollamaResponse.json();

    const output =
      ollamaData?.message?.content ||
      "";

    console.log(
      "QLAI Ollama response received."
    );

    console.log(
      "QLAI raw Ollama content:",
      output
    );

    const inputTokens =
      Number(
        ollamaData?.prompt_eval_count
      ) || 0;

    const outputTokens =
      Number(
        ollamaData?.eval_count
      ) || 0;

    const totalTokens =
      inputTokens +
      outputTokens;

    console.log(
      "Input tokens:",
      inputTokens
    );

    console.log(
      "Output tokens:",
      outputTokens
    );

    console.log(
      "Total tokens:",
      totalTokens
    );

    let result;

    try {
      result =
        parseOllamaJson(output);

      console.log(
        "QLAI JSON parsing successful."
      );
    } catch (error) {
      console.error(
        "QLAI JSON parsing failed:",
        error
      );

      console.error(
        "QLAI raw response:",
        output
      );

      return res
        .status(500)
        .json({
          success: false,
          error:
            "QLAI returned an invalid response from Ollama.",
        });
    }

    const confidence =
      Math.max(
        0,
        Math.min(
          100,
          Number(
            result.confidence
          ) || 0
        )
      );

    const approved =
      confidence >= 85;

    const requestBetterProof =
      !approved;

    let reason =
      String(
        result.reason ||
          "QLAI completed its analysis."
      );

    if (!approved) {
      reason =
        `${reason} Please submit better proof that more clearly demonstrates completion of the quest.`;
    }

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

      reason:
        String(
          aiAntiCheat.reason ||
            "No significant visual cheating indicators were detected."
        ),
    };

    try {
      await supabaseRequest(
        "/rest/v1/proof_submissions",
        {
          method: "POST",

          headers: {
            Prefer:
              "return=minimal",
          },

          body: JSON.stringify({
            player_id:
              String(
                playerId ||
                  "unknown"
              ),

            quest_name:
              String(
                questName
              ),

            image_hash:
              imageHash,
          }),
        }
      );

      console.log(
        "QLAI proof hash saved to Supabase."
      );
    } catch (error) {
      console.error(
        "Supabase proof save error:",
        error
      );

      console.error(
        "Supabase insert error data:",
        error.data
      );

      if (
        error.status === 409 ||
        error.data?.code ===
          "23505"
      ) {
        return res
          .status(409)
          .json({
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

      return res
        .status(500)
        .json({
          success: false,
          error:
            "QLAI completed its Ollama analysis, but the proof could not be saved.",
        });
    }

    console.log(
      "QLAI analysis completed successfully."
    );

    return res
      .status(200)
      .json({
        success: true,
        approved,
        confidence,
        reason,
        requestBetterProof,
        duplicate: false,
        antiCheat,
        imageHash,

        usage: {
          inputTokens,
          outputTokens,
          totalTokens,
          estimatedCostUsd: 0,
        },
      });

  } catch (error) {
    console.error(
      "QLAI API error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          "QLAI Ollama analysis failed.",
      });
  }
}
