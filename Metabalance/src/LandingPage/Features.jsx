export default function Features() {
    return (
        <>
            <h3 className="text-center fw-bold features-title mb-4">Fő funkcióink</h3>

            <section className="container mb-5">
                <div className="row gx-4 justify-content-center">

                    <div className="col-md-4">
                        <div className="feature-card text-center p-4">
                            <img src="src/styles/Pictures/background-apple.png" width="40" />
                            <h6 className="fw-bold mt-3">Személyre szabott étrend</h6>
                            <p className="text-secondary small mt-2">
                                Kezdi úgy élni étrended céljaidhoz és<br />
                                preferenciáidhoz igazítva, könnyedén<br />
                                követhető receptekkel.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="feature-card text-center p-4">
                            <img src="src/styles/Pictures/background-heart.png" width="40" />
                            <h6 className="fw-bold mt-3">Egészségügyi adatok<br />nyomon követése</h6>
                            <p className="text-secondary small mt-2">
                                Figyeld a változásokat, fejlődést, aktivitást<br />
                                és egyéb fontos mutatókat egy helyen.
                            </p>
                        </div>
                    </div>

                    <div className="col-md-4">
                        <div className="feature-card text-center p-4">
                            <img src="src/styles/Pictures/background-weight.png" width="40" />
                            <h6 className="fw-bold mt-3">Edzéstervek & aktivitás</h6>
                            <p className="text-secondary small mt-2">
                                Hozd ki a legtöbbet edzéseidből a<br />
                                személyre szabott tervekkel és részletes<br />
                                elemzésekkel.
                            </p>
                        </div>
                    </div>

                </div>
            </section>
        </>
    );
}
