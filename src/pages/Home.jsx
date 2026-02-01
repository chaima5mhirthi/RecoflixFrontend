// Placeholder pages for authenticated features
import Navbar from '../components/Navbar';

export default function Home() {
    return (
        <div style={{ minHeight: '100vh', padding: '100px 50px' }}>
            <Navbar />
            <h1>Home (Authenticated Users Only)</h1>
            <p>This page will show personalized recommendations.</p>
        </div>
    );
}
