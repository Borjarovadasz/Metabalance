import { Link } from "react-router-dom";


export default function LoginFooter() {
    return (
        <div className="text-center mt-4 pb-3">
            <p className="small">
                Ha még nincs fiókod,{" "}
                <Link to="/register" className="text-danger fw-bold">
                    hozd létre most!
                </Link>
            </p>
            
        </div>
        
        
    );
}
