import { Link } from "react-router-dom";
import MainPageImg from "../styles/Pictures/MainPageImg.jpeg";


export default function Hero() {
    return (
        <section className="container py-5">
            <div className="row justify-content-between align-items-center">

                <div className="col-lg-6">
                    <h1 className="inter-fonted">Érd el céljaidat a<br />Metabalance-szal!</h1>

                    <p className="text-secondary mt-3 hero-desc">
                        Kövesd nyomon étkezéseidet, edzéseidet és testsúlyodat<br />
                        egyszerűen. Egészséges életmód, fenntartható<br />
                        eredmények.
                    </p>

                <Link to="/register" className="text-danger fw-bold">
                      <button className="btn rounded-pill px-4 mt-2" style={{ backgroundColor: "rgb(240,128,128)" }}>
                        Kezdj bele
                    </button>
                </Link>
                  
                </div>

                <div className="col-lg-5 text-end">
                    <img src={MainPageImg}
                         className="img-fluid rounded hero-img" />
                </div>

            </div>
        </section>
    );
}
