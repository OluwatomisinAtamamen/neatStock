import { Link } from "react-router-dom";

export default function ErrorPage() {
    return (
      <section className='error-page'>
        <h1>404</h1>
        <h2>Page not found</h2>

        <Link to='/'>Go back to the home page</Link>
      </section>
    );
}