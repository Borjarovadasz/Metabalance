export default function DashboardHero() {
    return (
        <div className="container hero-box shadow-sm">

            <div className="row align-items-center">

                <div className="col-md-7 p-4">
                    <h2 className="fw-bold">Üdv újra, Péter!<br />Merre tart ma az egészséged?</h2>
                    <p className="text-secondary mt-2">
                        Kövesd nyomon az összes egészséggel kapcsolatos adatodat
                        egyetlen helyen. Állíts be célokat, figyeld a fejlődésedet,
                        és élj a lehető legtöbbet a Metabalance segítségével.
                    </p>

                    <button className="btn btn-danger px-4 rounded-pill fw-bold mt-3">
                        Kalória naplózás
                    </button>
                </div>

                <div className="col-md-5 text-end p-3">
                    <img src="/dashboard-hero.jpg" className="img-fluid rounded" />
                </div>

            </div>

        </div>
    );
}
