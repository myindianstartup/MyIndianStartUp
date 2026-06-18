import { Navigate } from 'react-router-dom';

// /signin redirects to /login — the real authentication page.
const SignIn = () => <Navigate to="/login" replace />;

export default SignIn;
