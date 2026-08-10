import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

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
    "GET, POST, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // TEST HEADER
  res.setHeader(
    "X-Quest-Lives-CORS-Test",
    "working"
  );

  //==================================================
  // CORS PREFLIGHT
  //==================================================

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    //==================================================
    // CREATE PLAYERS TABLE
    //==================================================

    await sql`
      CREATE TABLE IF NOT EXISTS players (
        roblox_user_id TEXT PRIMARY KEY,
        current_quest JSONB,
        points INTEGER NOT NULL DEFAULT 0,
        tickets INTEGER NOT NULL DEFAULT 0,
        quests_completed INTEGER NOT NULL DEFAULT 0,
        quest_approved BOOLEAN NOT NULL DEFAULT FALSE,
        quest_claimed BOOLEAN NOT NULL DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    //==================================================
    // ADD NEW COLUMNS TO EXISTING TABLE
    //==================================================

    await sql`
      ALTER TABLE players
      ADD COLUMN IF NOT EXISTS quest_approved BOOLEAN
      NOT NULL DEFAULT FALSE
    `;

    await sql`
      ALTER TABLE players
      ADD COLUMN IF NOT EXISTS quest_claimed BOOLEAN
      NOT NULL DEFAULT FALSE
    `;

    //==================================================
    // GET
    //==================================================

    if (req.method === "GET") {
      const robloxUserId =
        req.query?.userId;

      if (!robloxUserId) {
        return res.status(400).json({
          success: false,
          error:
            "A Roblox userId is required.",
        });
      }

      const players = await sql`
        SELECT
          roblox_user_id,
          current_quest,
          points,
          tickets,
          quests_completed,
          quest_approved,
          quest_claimed,
          updated_at
        FROM players
        WHERE roblox_user_id =
          ${String(robloxUserId)}
      `;

      if (players.length === 0) {
        return res.status(404).json({
          success: false,
          error: "Player not found.",
        });
      }

      return res.status(200).json({
        success: true,
        player: players[0],
      });
    }

    //==================================================
    // POST
    //==================================================

    if (req.method === "POST") {
      const {
        userId,
        quest,
        action,
      } = req.body || {};

      //================================================
      // APPROVE QUEST
      //================================================

      if (action === "approve") {
        if (!userId) {
          return res.status(400).json({
            success: false,
            error:
              "A Roblox userId is required.",
          });
        }

        const player = await sql`
          UPDATE players
          SET
            quest_approved = TRUE,
            quest_claimed = FALSE,
            updated_at = NOW()
          WHERE roblox_user_id =
            ${String(userId)}
          RETURNING
            roblox_user_id,
            current_quest,
            points,
            tickets,
            quests_completed,
            quest_approved,
            quest_claimed,
            updated_at
        `;

        if (player.length === 0) {
          return res.status(404).json({
            success: false,
            error: "Player not found.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Quest approved.",
          player: player[0],
        });
      }

      //================================================
      // CLAIM QUEST
      //================================================

      if (action === "claim") {
        if (!userId) {
          return res.status(400).json({
            success: false,
            error:
              "A Roblox userId is required.",
          });
        }

        const player = await sql`
          UPDATE players
          SET
            quest_claimed = TRUE,
            quest_approved = FALSE,
            updated_at = NOW()
          WHERE roblox_user_id =
            ${String(userId)}
            AND quest_approved = TRUE
            AND quest_claimed = FALSE
          RETURNING
            roblox_user_id,
            current_quest,
            points,
            tickets,
            quests_completed,
            quest_approved,
            quest_claimed,
            updated_at
        `;

        if (player.length === 0) {
          return res.status(400).json({
            success: false,
            error:
              "No approved unclaimed quest exists.",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Quest claimed.",
          player: player[0],
        });
      }

      //================================================
      // NORMAL QUEST SAVE
      //================================================

      if (!userId) {
        return res.status(400).json({
          success: false,
          error:
            "A Roblox userId is required.",
        });
      }

      if (!quest) {
        return res.status(400).json({
          success: false,
          error:
            "A quest is required.",
        });
      }

      const player = await sql`
        INSERT INTO players (
          roblox_user_id,
          current_quest,
          quest_approved,
          quest_claimed,
          updated_at
        )
        VALUES (
          ${String(userId)},
          ${JSON.stringify(quest)}::jsonb,
          FALSE,
          FALSE,
          NOW()
        )
        ON CONFLICT (roblox_user_id)
        DO UPDATE SET
          current_quest =
            EXCLUDED.current_quest,
          quest_approved =
            FALSE,
          quest_claimed =
            FALSE,
          updated_at = NOW()
        RETURNING
          roblox_user_id,
          current_quest,
          points,
          tickets,
          quests_completed,
          quest_approved,
          quest_claimed,
          updated_at
      `;

      return res.status(200).json({
        success: true,
        player: player[0],
      });
    }

    //==================================================
    // METHOD NOT ALLOWED
    //==================================================

    res.setHeader(
      "Allow",
      ["GET", "POST", "OPTIONS"]
    );

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });

  } catch (error) {
    console.error(
      "Quest API error:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        "Internal server error.",
    });
  }
}
