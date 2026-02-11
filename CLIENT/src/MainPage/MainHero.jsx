export default function MainHero({ username, heroImg, onCta }) {
  return (
    <div className="hero">
      <div className="hero-text">
        <h1>
          Üdv újra, {username}!<br />
          Merre tart ma az egészséged?
        </h1>
        <p>
          Kövesd nyomon az összes egészséggel kapcsolatos adatodat egyetlen helyen.
          Állíts be célokat, figyeld a fejlődésedet, és élj teljesebb életet
          a Metabalance segítségével.
        </p>
        <button className="hero-btn" onClick={onCta}>
          Kalória naplózás
        </button>
      </div>
      <div className="hero-img-wrap">
        <img src={heroImg} alt="hero" className="hero-img" />
      </div>
    </div>
  );
}
