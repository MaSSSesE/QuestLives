import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    // Create the players table if it doesn't exist yet.
    await sql`
      CREATE TABLE IF NOT EXISTS players (
        roblox_user_id TEXT PRIMARY KEY,
        current_quest JSONB,
        points INTEGER NOT NULL DEFAULT 0,
        tickets INTEGER NOT NULL DEFAULT 0,
        quests_completed INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;

    // GET
    // Returns a player's saved data.
    if (req.method === "GET") {
      const robloxUserId = req.query?.userId;

      if (!robloxUserId) {
        return res.status(400).json({
          success: false,
          error: "A Roblox userId is required.",
        });
      }

      const players = await sql`
        SELECT
          roblox_user_id,
          current_quest,
          points,
          tickets,
          quests_completed,
          updated_at
        FROM players
        WHERE roblox_user_id = ${String(robloxUserId)}
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

    // POST
    // Creates or updates a player's current quest.
    if (req.method === "POST") {
      const {
        userId,
        quest,
      } = req.body || {};

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "A Roblox userId is required.",
        });
      }

      if (!quest) {
        return res.status(400).json({
          success: false,
          error: "A quest is required.",
        });
      }

      const player = await sql`
        INSERT INTO players (
          roblox_user_id,
          current_quest,
          updated_at
        )
        VALUES (
          ${String(userId)},
          ${JSON.stringify(quest)}::jsonb,
          NOW()
        )
        ON CONFLICT (roblox_user_id)
        DO UPDATE SET
          current_quest = EXCLUDED.current_quest,
          updated_at = NOW()
        RETURNING
          roblox_user_id,
          current_quest,
          points,
          tickets,
          quests_completed,
          updated_at
      `;

      return res.status(200).json({
        success: true,
        player: player[0],
      });
    }

    res.setHeader("Allow", ["GET", "POST"]);

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  } catch (error) {
    console.error("Quest API error:", error);

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}