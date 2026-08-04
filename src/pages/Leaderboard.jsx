import PointsGUI from "../GUIS/Points.png";


function Leaderboard() {
  return (
    <section className="leaderboard">

      <h1>
        🏆 Leaderboard
      </h1>

      <p>
        Top Quest Lives Players
      </p>



      <p>

        🥇 #1 Player -

        <img
          src={PointsGUI}
          className="smallPointsIcon"
          alt="Points"
        />

        10,000 Points

      </p>




      <p>

        🥈 #2 Player -

        <img
          src={PointsGUI}
          className="smallPointsIcon"
          alt="Points"
        />

        7,500 Points

      </p>




      <p>

        🥉 #3 Player -

        <img
          src={PointsGUI}
          className="smallPointsIcon"
          alt="Points"
        />

        5,000 Points

      </p>




      <p>
        Keep completing quests to climb the leaderboard!
      </p>


    </section>
  );
}


export default Leaderboard;