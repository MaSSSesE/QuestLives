import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
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
    } = req.body || {};

    if (!image) {
      return res.status(400).json({
        success: false,
        error: "An image is required.",
      });
    }

    if (!questName) {
      return res.status(400).json({
        success: false,
        error: "A quest name is required.",
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
completed the quest.

Be fair but strict.

IMPORTANT RULES:

- Only approve if the image clearly supports completion
  of the quest.
- Reject unclear, unrelated, misleading, or insufficient
  evidence.
- Do not assume something happened if it is not reasonably
  supported by the image.
- A photo does not need to prove every detail perfectly,
  but it should reasonably demonstrate completion.
- Return a confidence score from 0 to 100.

Return ONLY valid JSON in exactly this format:

{
  "approved": true,
  "confidence": 92,
  "reason": "Brief explanation of why the proof was approved or rejected."
}
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
      result =
        JSON.parse(output);
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
    // VALIDATE RESULT
    //==================================================

    const approved =
      result.approved === true;

    const confidence =
      Math.max(
        0,
        Math.min(
          100,
          Number(result.confidence) || 0
        )
      );

    const reason =
      String(
        result.reason ||
        "QLAI completed its analysis."
      );

    //==================================================
    // SUCCESS
    //==================================================

    return res.status(200).json({
      success: true,

      approved,

      confidence,

      reason,
    });

  } catch (error) {

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