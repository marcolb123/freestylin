import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import "./App.css";
import { API_URL } from "./config";
// Import icons from Lucide React
import { 
    Sparkles, 
    Lightbulb, 
    Youtube, 
    Trash2, 
    Music,
    PartyPopper,
    Radio,
    Headphones,
    Dumbbell,
    Target,
    RotateCw,
    Timer,
    Waves as WavesIcon,
    Brain,
    Zap,
    Combine,
    TrendingUp,
    ArrowDown,
    ArrowRight,
    ArrowUp,
    RollerCoaster,
    Bot,
    Droplet,
    Footprints,
    Repeat,
    Activity,
    Route as RouteIcon,  // ← Rename this to avoid conflict with React Router's Route
    Circle,
    Heart,
    Link as LinkIcon
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// 🔐 AUTH CONTEXT
// ═══════════════════════════════════════════════════════════
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

// ═══════════════════════════════════════════════════════════
// 📚 DATA SECTION: Prompts now stored in MongoDB database
// ═══════════════════════════════════════════════════════════
// All prompts are now fetched from the database via API.
// To add new prompts to the database, run: npm run seed

// 🎵 MUSIC GENRES: SoundCloud mixes by genre
const MUSIC_GENRES = [
    {
        name: "House",
        soundCloudUrl: "https://soundcloud.com/djsupad/housupa-afro-tribal-house-mix",
        color: "#FF6B6B"
    },
    {
        name: "Krump",
        soundCloudUrl: "https://soundcloud.com/merciiful1/krump-mix",
        color: "#4ECDC4"
    },
    {
        name: "Hip-Hop",
        soundCloudUrl: "https://soundcloud.com/kaisalart/old-school-vibes-vol-2-hip-hop-mix",
        color: "#FFE66D"
    },
    {
        name: "Popping",
        soundCloudUrl: "https://soundcloud.com/dj-dbon1-314759770/get-the-tapes-vol-22-hip-hop",
        color: "#95E1D3"
    },
];

// Icon mapping object
const iconMap = {
    Target,
    RotateCw,
    Timer,
    Music,
    Dumbbell,
    WavesIcon,
    Activity,
    Brain,
    Zap,
    Combine,
    ArrowUp,
    ArrowRight,
    ArrowDown,
    RollerCoaster,
    Bot,
    Droplet,
    Footprints,
    Repeat,
    RouteIcon,  // ← Update here too
    TrendingUp,
    Circle
};

// ═══════════════════════════════════════════════════════════
// 📱 MAIN APP WITH ROUTING
// ═══════════════════════════════════════════════════════════
export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/submit" element={<SubmitPromptPage />} />
                <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            </Routes>
        </AuthProvider>
    );
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user?.isAdmin ? children : <Navigate to="/login" />;
}

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
}

function MainPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="app-container">
            <div className="app-header">
                <h1 className="app-title">
                    <Music className="title-icon" size={48}/> Freestylin <Music className="title-icon" size={48} />
                </h1>
                <p className="app-subtitle">An app to help build dancer's freestyle</p>
                
                <div className="nav-buttons">
                    {user ? (
                        <>
                            <span>Welcome, {user.username}!</span>
                            <button onClick={() => navigate('/favorites')} className="btn btn-nav">
                                <Heart size={16} /> My Favorites
                            </button>
                            <button onClick={() => navigate('/submit')} className="btn btn-nav">Submit Prompt</button>
                            {user.isAdmin && <button onClick={() => navigate('/admin')} className="btn btn-nav">Admin</button>}
                            <button onClick={logout} className="btn btn-nav">Logout</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => navigate('/login')} className="btn btn-nav">Login</button>
                            <button onClick={() => navigate('/register')} className="btn btn-nav">Register</button>
                        </>
                    )}
                </div>
            </div>
            
            <div className="app-content">
                <PromptCard />
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 🔑 LOGIN PAGE
// ═══════════════════════════════════════════════════════════
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Login failed');
        }
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Login</h2>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="btn btn-spin">Login</button>
                <Link to="/register">Don't have an account? Register</Link>
            </form>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 📝 REGISTER PAGE
// ═══════════════════════════════════════════════════════════
function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await res.json();
            if (res.ok) {
                login(data.token, data.user);
                navigate('/');
            } else {
                alert(data.error);
            }
        } catch (error) {
            alert('Registration failed');
        }
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Register</h2>
                <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="submit" className="btn btn-spin">Register</button>
                <Link to="/login">Already have an account? Login</Link>
            </form>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ➕ SUBMIT PROMPT PAGE
// ═══════════════════════════════════════════════════════════
function SubmitPromptPage() {
    const [formData, setFormData] = useState({ 
        label: '', 
        description: '', 
        tips: [''], 
        drills: [{ icon: 'Target', text: '' }] , 
        links: [{ title: '', url: '', type: 'youtube' }] 
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    // Available icons for drills
    const availableIcons = [
        'Target', 'RotateCw', 'Timer', 'Music', 'Dumbbell', 'WavesIcon', 'Activity',
        'Brain', 'Zap', 'Combine', 'ArrowUp', 'ArrowRight', 'ArrowDown', 'RollerCoaster',
        'Bot', 'Droplet', 'Footprints', 'Repeat', 'RouteIcon', 'TrendingUp', 'Circle'
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        // Validation
        if (!formData.label.trim() || !formData.description.trim()) {
            setMessage({ type: 'error', text: 'Label and description are required.' });
            return;
        }

        // Filter out empty tips
        const cleanedTips = formData.tips.filter(tip => tip.trim() !== '');
        
        // Filter out incomplete drills
        const cleanedDrills = formData.drills.filter(drill => drill.text.trim() !== '');
        
        // Filter out incomplete links
        const cleanedLinks = formData.links.filter(link => link.title.trim() !== '' && link.url.trim() !== '');

        const submissionData = {
            ...formData,
            tips: cleanedTips,
            drills: cleanedDrills,
            links: cleanedLinks
        };

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`${API_URL}/api/prompts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(submissionData)
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Prompt submitted for review! Redirecting...' });
                setTimeout(() => navigate('/'), 2000);
            } else {
                setMessage({ type: 'error', text: data.error || 'Submission failed' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error. Please try again.' });
        }
    };

    // Tip handlers
    const addTip = () => setFormData({...formData, tips: [...formData.tips, '']});
    const removeTip = (index) => {
        const newTips = formData.tips.filter((_, i) => i !== index);
        setFormData({...formData, tips: newTips.length ? newTips : ['']});
    };
    const updateTip = (index, value) => {
        const newTips = [...formData.tips];
        newTips[index] = value;
        setFormData({...formData, tips: newTips});
    };

    // Drill handlers
    const addDrill = () => setFormData({...formData, drills: [...formData.drills, { icon: 'Target', text: '' }]});
    const removeDrill = (index) => {
        const newDrills = formData.drills.filter((_, i) => i !== index);
        setFormData({...formData, drills: newDrills.length ? newDrills : [{ icon: 'Target', text: '' }]});
    };
    const updateDrill = (index, field, value) => {
        const newDrills = [...formData.drills];
        newDrills[index][field] = value;
        setFormData({...formData, drills: newDrills});
    };

    // Link handlers
    const addLink = () => setFormData({...formData, links: [...formData.links, { title: '', url: '', type: 'youtube' }]});
    const removeLink = (index) => {
        const newLinks = formData.links.filter((_, i) => i !== index);
        setFormData({...formData, links: newLinks.length ? newLinks : [{ title: '', url: '', type: 'youtube' }]});
    };
    const updateLink = (index, field, value) => {
        const newLinks = [...formData.links];
        newLinks[index][field] = value;
        setFormData({...formData, links: newLinks});
    };

    return (
        <div className="auth-page">
            <form onSubmit={handleSubmit} className="submit-form" style={{ maxWidth: '800px', padding: '2rem' }}>
                <h2>Submit New Prompt</h2>
                
                {message.text && (
                    <div style={{ 
                        padding: '1rem', 
                        marginBottom: '1rem', 
                        borderRadius: '8px',
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24'
                    }}>
                        {message.text}
                    </div>
                )}

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Label *</label>
                    <input 
                        type="text" 
                        placeholder="e.g., Bounce, Waves, Isolations" 
                        value={formData.label} 
                        onChange={e => setFormData({...formData, label: e.target.value})} 
                        required 
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Description *</label>
                    <textarea 
                        placeholder="Brief description of the dance concept" 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        required 
                        rows={3}
                        style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                    />
                </div>

                {/* Tips Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Tips</label>
                    {formData.tips.map((tip, index) => (
                        <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input 
                                type="text" 
                                placeholder={`Tip ${index + 1}`}
                                value={tip}
                                onChange={e => updateTip(index, e.target.value)}
                                style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
                            />
                            {formData.tips.length > 1 && (
                                <button type="button" onClick={() => removeTip(index)} className="btn btn-toggle" style={{ padding: '0.5rem 1rem' }}>
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addTip} className="btn btn-toggle" style={{ marginTop: '0.5rem' }}>
                        + Add Tip
                    </button>
                </div>

                {/* Drills Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Drills</label>
                    {formData.drills.map((drill, index) => (
                        <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <select 
                                    value={drill.icon}
                                    onChange={e => updateDrill(index, 'icon', e.target.value)}
                                    style={{ padding: '0.5rem', fontSize: '1rem' }}
                                >
                                    {availableIcons.map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                    ))}
                                </select>
                                {formData.drills.length > 1 && (
                                    <button type="button" onClick={() => removeDrill(index)} className="btn btn-toggle" style={{ padding: '0.5rem 1rem' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            <textarea 
                                placeholder={`Drill ${index + 1} description`}
                                value={drill.text}
                                onChange={e => updateDrill(index, 'text', e.target.value)}
                                rows={3}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addDrill} className="btn btn-toggle">
                        + Add Drill
                    </button>
                </div>

                {/* Links Section */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Resource Links</label>
                    {formData.links.map((link, index) => (
                        <div key={index} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                <input 
                                    type="text" 
                                    placeholder="Link title (e.g., Tutorial video)"
                                    value={link.title}
                                    onChange={e => updateLink(index, 'title', e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem', fontSize: '1rem' }}
                                />
                                {formData.links.length > 1 && (
                                    <button type="button" onClick={() => removeLink(index)} className="btn btn-toggle" style={{ padding: '0.5rem 1rem' }}>
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                            
                            {/* Resource Type Selector */}
                            <div style={{ marginBottom: '0.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '600' }}>Resource Type</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            name={`linkType${index}`}
                                            value="youtube"
                                            checked={link.type === 'youtube'}
                                            onChange={e => updateLink(index, 'type', e.target.value)}
                                        />
                                        <Youtube size={16} /> YouTube Video
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input 
                                            type="radio" 
                                            name={`linkType${index}`}
                                            value="website"
                                            checked={link.type === 'website'}
                                            onChange={e => updateLink(index, 'type', e.target.value)}
                                        />
                                        <LinkIcon size={16} /> Website Link
                                    </label>
                                </div>
                            </div>
                            
                            <input 
                                type="url" 
                                placeholder={link.type === 'youtube' ? 'https://youtube.com/watch?v=...' : 'https://example.com/...'}
                                value={link.url}
                                onChange={e => updateLink(index, 'url', e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addLink} className="btn btn-toggle">
                        + Add Link
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button type="submit" className="btn btn-spin">Submit for Review</button>
                    <button type="button" onClick={() => navigate('/')} className="btn btn-toggle">Cancel</button>
                </div>
            </form>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 👑 ADMIN DASHBOARD
// ═══════════════════════════════════════════════════════════
function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [allPrompts, setAllPrompts] = useState([]);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected', 'all'
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStats();
        fetchPrompts();
        fetchAllPrompts();
    }, []);

    const fetchStats = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/admin/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
    };

    const fetchPrompts = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/prompts?status=pending`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setPrompts(data);
    };

    const fetchAllPrompts = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/admin/prompts/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setAllPrompts(data);
        }
    };

    const approvePrompt = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`http://localhost:3001/api/prompts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'approved' })
            });
            alert('Prompt approved successfully!');
            fetchPrompts();
            fetchAllPrompts();
            fetchStats();
            setShowDetails(false);
        } catch (error) {
            alert('Failed to approve prompt');
        }
    };

    const rejectPrompt = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/prompts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'rejected' })
            });
            alert('Prompt rejected');
            fetchPrompts();
            fetchAllPrompts();
            fetchStats();
            setShowDetails(false);
        } catch (error) {
            alert('Failed to reject prompt');
        }
    };

    const deletePrompt = async (id) => {
        const token = localStorage.getItem('token');
        try {
            await fetch(`${API_URL}/api/prompts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Prompt deleted');
            fetchPrompts();
            fetchAllPrompts();
            fetchStats();
            setShowDeleteConfirm(null);
        } catch (error) {
            alert('Failed to delete prompt');
        }
    };

    const viewDetails = (prompt) => {
        setSelectedPrompt(prompt);
        setShowDetails(true);
    };

    const getFilteredPrompts = () => {
        if (filter === 'pending') return prompts;
        if (filter === 'all') return allPrompts;
        return allPrompts.filter(p => p.status === filter);
    };

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            <button onClick={() => navigate('/')} className="btn btn-toggle">Back to Home</button>
            
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Prompts</h3>
                        <p>{stats.totalPrompts}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Users</h3>
                        <p>{stats.totalUsers}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Views</h3>
                        <p>{stats.totalViews}</p>
                    </div>
                    <div className="stat-card">
                        <h3>Total Likes</h3>
                        <p>{stats.totalLikes}</p>
                    </div>
                </div>
            )}

            <h2>Prompt Management</h2>
            <div style={{ marginBottom: '1rem' }}>
                <button onClick={() => setFilter('pending')} className={`btn ${filter === 'pending' ? 'btn-spin' : 'btn-toggle'}`}>
                    Pending ({prompts.length})
                </button>
                <button onClick={() => setFilter('approved')} className={`btn ${filter === 'approved' ? 'btn-spin' : 'btn-toggle'}`} style={{ marginLeft: '0.5rem' }}>
                    Approved
                </button>
                <button onClick={() => setFilter('rejected')} className={`btn ${filter === 'rejected' ? 'btn-spin' : 'btn-toggle'}`} style={{ marginLeft: '0.5rem' }}>
                    Rejected
                </button>
                <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-spin' : 'btn-toggle'}`} style={{ marginLeft: '0.5rem' }}>
                    All ({allPrompts.length})
                </button>
            </div>

            <div className="prompts-list">
                {getFilteredPrompts().length === 0 ? (
                    <p>No prompts in this category</p>
                ) : (
                    getFilteredPrompts().map(prompt => (
                        <div key={prompt._id} className="prompt-item" style={{ position: 'relative' }}>
                            <span style={{ 
                                position: 'absolute', 
                                top: '10px', 
                                right: '10px', 
                                padding: '4px 8px', 
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                backgroundColor: prompt.status === 'approved' ? '#d4edda' : prompt.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                                color: prompt.status === 'approved' ? '#155724' : prompt.status === 'rejected' ? '#721c24' : '#856404'
                            }}>
                                {prompt.status}
                            </span>
                            <h3>{prompt.label}</h3>
                            <p>{prompt.description}</p>
                            <p style={{ fontSize: '0.9rem', color: '#666' }}>
                                Tips: {prompt.tips?.length || 0} | Drills: {prompt.drills?.length || 0} | Links: {prompt.links?.length || 0}
                            </p>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                                <button onClick={() => viewDetails(prompt)} className="btn btn-toggle">View Details</button>
                                {prompt.status === 'pending' && (
                                    <>
                                        <button onClick={() => approvePrompt(prompt._id)} className="btn btn-spin">Approve</button>
                                        <button onClick={() => rejectPrompt(prompt._id)} className="btn btn-ai">Reject</button>
                                    </>
                                )}
                                {showDeleteConfirm === prompt._id ? (
                                    <>
                                        <button onClick={() => deletePrompt(prompt._id)} className="btn btn-ai">Confirm Delete</button>
                                        <button onClick={() => setShowDeleteConfirm(null)} className="btn btn-toggle">Cancel</button>
                                    </>
                                ) : (
                                    <button onClick={() => setShowDeleteConfirm(prompt._id)} className="btn btn-toggle">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Prompt Details Modal */}
            {showDetails && selectedPrompt && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000,
                    padding: '1rem'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '2rem',
                        borderRadius: '20px',
                        maxWidth: '600px',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        width: '90%',
                        color: 'white',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                    }}>
                        <h2 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '2rem' }}>{selectedPrompt.label}</h2>
                        
                        <div style={{ 
                            background: 'rgba(255, 255, 255, 0.1)', 
                            padding: '0.75rem', 
                            borderRadius: '8px',
                            marginBottom: '1rem'
                        }}>
                            <p style={{ margin: 0 }}><strong>Status:</strong> {selectedPrompt.status}</p>
                        </div>
                        
                        <p style={{ marginBottom: '1.5rem', lineHeight: '1.6' }}>
                            <strong>Description:</strong> {selectedPrompt.description}
                        </p>
                        
                        {selectedPrompt.tips?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '1.3rem',
                                    marginBottom: '0.75rem'
                                }}>
                                    <Lightbulb size={20} /> Tips:
                                </h3>
                                <ul style={{ 
                                    margin: 0, 
                                    paddingLeft: '1.5rem',
                                    lineHeight: '1.8'
                                }}>
                                    {selectedPrompt.tips.map((tip, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {selectedPrompt.drills?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '1.3rem',
                                    marginBottom: '0.75rem'
                                }}>
                                    <Dumbbell size={20} /> Drills:
                                </h3>
                                <ul style={{ 
                                    margin: 0, 
                                    paddingLeft: '1.5rem',
                                    lineHeight: '1.8'
                                }}>
                                    {selectedPrompt.drills.map((drill, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>
                                            <strong>{drill.icon}:</strong> {drill.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        {selectedPrompt.links?.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '8px',
                                    fontSize: '1.3rem',
                                    marginBottom: '0.75rem'
                                }}>
                                    <LinkIcon size={20} /> Resource Links:
                                </h3>
                                <ul style={{ 
                                    margin: 0, 
                                    paddingLeft: '1.5rem',
                                    lineHeight: '1.8'
                                }}>
                                    {selectedPrompt.links.map((link, i) => (
                                        <li key={i} style={{ marginBottom: '0.5rem' }}>
                                            <a 
                                                href={link.url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{ 
                                                    color: 'white', 
                                                    textDecoration: 'underline',
                                                    transition: 'opacity 0.3s'
                                                }}
                                                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                                onMouseLeave={(e) => e.target.style.opacity = '1'}
                                            >
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '10px', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                            {selectedPrompt.status === 'pending' && (
                                <>
                                    <button onClick={() => approvePrompt(selectedPrompt._id)} className="btn btn-spin">Approve</button>
                                    <button onClick={() => rejectPrompt(selectedPrompt._id)} className="btn btn-ai">Reject</button>
                                </>
                            )}
                            <button onClick={() => setShowDetails(false)} className="btn btn-toggle">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 🎥 YOUTUBE EMBED COMPONENT
// ═══════════════════════════════════════════════════════════
function YouTubeEmbed({ videoId, url, title }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Extract videoId from URL if not provided
    const extractedVideoId = videoId || extractYouTubeId(url);

    function extractYouTubeId(url) {
        if (!url) return null;
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
            /youtube\.com\/shorts\/([^&\n?#]+)/
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        return null;
    }

    if (!extractedVideoId) {
        return <div style={{ color: '#721c24', padding: '1rem', backgroundColor: '#f8d7da', borderRadius: '8px' }}>
            Invalid YouTube URL
        </div>;
    }

    return (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', marginBottom: '1rem' }}>
            {loading && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    Loading video...
                </div>
            )}
            <iframe
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                src={`https://www.youtube.com/embed/${extractedVideoId}`}
                title={title || 'YouTube video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
            />
            {error && <div style={{ color: '#721c24', padding: '0.5rem', backgroundColor: '#f8d7da', borderRadius: '8px', marginTop: '0.5rem' }}>
                Failed to load video
            </div>}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ❤️ FAVORITE BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════
function FavoriteButton({ prompt, isFavorited: initialFavorited, onToggle }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isFavorited, setIsFavorited] = useState(initialFavorited || false);
    const [loading, setLoading] = useState(false);

    const handleFavoriteToggle = async (e) => {
        e.stopPropagation(); // Prevent event bubbling

        if (!user) {
            if (confirm('You need to be logged in to favorite prompts. Go to login page?')) {
                navigate('/login');
            }
            return;
        }

        // Optimistic update
        const newFavorited = !isFavorited;
        setIsFavorited(newFavorited);
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const method = newFavorited ? 'POST' : 'DELETE';
            const url = `${API_URL}/api/users/${user.id}/favorites/${prompt._id}`;

            const res = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to update favorite');

            if (onToggle) onToggle(prompt._id, newFavorited);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            // Revert on error
            setIsFavorited(!newFavorited);
            alert('Failed to update favorite. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Don't show favorite button if not logged in

    return (
        <button
            onClick={handleFavoriteToggle}
            disabled={loading}
            style={{
                background: 'none',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'scale(1.1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
            <Heart
                size={24}
                fill={isFavorited ? '#ff6b6b' : 'none'}
                stroke={isFavorited ? '#ff6b6b' : 'currentColor'}
                style={{ transition: 'all 0.3s' }}
            />
        </button>
    );
}

// ═══════════════════════════════════════════════════════════
// ❤️ FAVORITES PAGE
// ═══════════════════════════════════════════════════════════
function FavoritesPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/users/${user.id}/favorites`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch favorites');

            const data = await res.json();
            setFavorites(data);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Failed to load favorites. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = (promptId) => {
        setFavorites(prev => prev.filter(p => p._id !== promptId));
    };

    return (
        <div className="app-container">
            <div className="app-header">
                <h1 className="app-title">
                    <Heart className="title-icon" size={48} fill="#ff6b6b" stroke="#ff6b6b" /> My Favorites
                </h1>
                <button onClick={() => navigate('/')} className="btn btn-nav">← Back to Home</button>
            </div>

            <div className="app-content" style={{ padding: '2rem' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p>Loading your favorites...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: '#721c24', backgroundColor: '#f8d7da', padding: '1rem', borderRadius: '8px' }}>
                            {error}
                        </p>
                        <button onClick={fetchFavorites} className="btn btn-spin" style={{ marginTop: '1rem' }}>
                            Retry
                        </button>
                    </div>
                ) : favorites.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <Heart size={64} stroke="#ccc" style={{ marginBottom: '1rem' }} />
                        <h2>No favorites yet</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            Start adding prompts to your favorites by clicking the heart icon on any prompt!
                        </p>
                        <button onClick={() => navigate('/')} className="btn btn-spin">
                            Browse Prompts
                        </button>
                    </div>
                ) : (
                    <div>
                        <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                            You have {favorites.length} favorite prompt{favorites.length !== 1 ? 's' : ''}
                        </p>
                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            {favorites.map(prompt => (
                                <div key={prompt._id} className="prompt-card" style={{ position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                        <FavoriteButton 
                                            prompt={prompt} 
                                            isFavorited={true}
                                            onToggle={handleRemoveFavorite}
                                        />
                                    </div>
                                    <div className="card-header">
                                        <h2 className="prompt-title">{prompt.label}</h2>
                                        <p className="prompt-subtitle">
                                            <Music className="inline-icon" size={16} /> {prompt.description}
                                        </p>
                                    </div>
                                    {prompt.tips && prompt.tips.length > 0 && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <h3>💡 Tips:</h3>
                                            <ul>
                                                {prompt.tips.map((tip, i) => (
                                                    <li key={i}>{tip}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function PromptCard() {
    // ─────────────────────────────────────────────────────────
    // 🔄 STATE VARIABLES: Track what's happening in the app
    // ─────────────────────────────────────────────────────────
    const { user } = useContext(AuthContext);
    const [index, setIndex] = useState(0);
    const [showTips, setShowTips] = useState(false);
    const [showResources, setShowResources] = useState(false);
    const [showDrills, setShowDrills] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const current = prompts[index];

    useEffect(() => {
        fetchPrompts();
    }, [user]);

    const fetchPrompts = async () => {
        try {
            setLoading(true);
            setError(null);
            const url = user 
                ? `${API_URL}/api/prompts?userId=${user.id}`
                : `${API_URL}/api/prompts`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error('Failed to fetch prompts from server');
            }
            const data = await res.json();
            if (data.length === 0) {
                setError('No prompts available. Please run "npm run seed" to add initial prompts.');
            } else {
                setPrompts(data);
            }
        } catch (error) {
            console.error('Failed to fetch prompts:', error);
            setError('Unable to load prompts. Please ensure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    // ─────────────────────────────────────────────────────────
    // 🎲 SPIN PROMPT: Get a random prompt
    // ─────────────────────────────────────────────────────────
    function spinPrompt() {
        if (prompts.length === 0) return;
        setShowTips(false);
        setShowResources(false);
        setShowDrills(false);
        const next = Math.floor(Math.random() * prompts.length);
        setIndex(next);
    }

    if (loading) {
        return (
            <div className="prompt-card">
                <div className="card-header">
                    <h2 className="prompt-title">Loading prompts...</h2>
                    <p className="prompt-subtitle">Please wait while we fetch the dance prompts.</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="prompt-card">
                <div className="card-header">
                    <h2 className="prompt-title">⚠️ Error</h2>
                    <p className="prompt-subtitle">{error}</p>
                </div>
                <div className="button-group">
                    <button className="btn btn-spin" onClick={fetchPrompts}>
                        <RotateCw size={18} /> Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!current || prompts.length === 0) {
        return (
            <div className="prompt-card">
                <div className="card-header">
                    <h2 className="prompt-title">No prompts available</h2>
                    <p className="prompt-subtitle">Run "npm run seed" to add initial prompts to the database.</p>
                </div>
                <div className="button-group">
                    <button className="btn btn-spin" onClick={fetchPrompts}>
                        <RotateCw size={18} /> Refresh
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────
    // 🎨 RENDER: What shows on screen
    // ─────────────────────────────────────────────────────────
    return (
        <div className="prompt-card">
            {/* ─────── HEADER ─────── */}
            <div className="card-header" style={{ position: 'relative' }}>
                <h2 className="prompt-title">{current.label}</h2>
                <p className="prompt-subtitle">
                    <Music className="inline-icon" size={16} /> {current.description}
                </p>
                {user && (
                    <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                        <FavoriteButton 
                            prompt={current} 
                            isFavorited={current.isFavorited || false}
                            onToggle={fetchPrompts}
                        />
                    </div>
                )}
            </div>

            {/* ─────── BUTTONS ─────── */}
            <div className="button-group">
                <button className="btn btn-spin" onClick={spinPrompt}>
                    <Sparkles size={18} /> Spin Prompt
                </button>
                <button
                    className={`btn btn-toggle ${showTips ? "active" : ""}`}
                    onClick={() => setShowTips((s) => !s)}
                >
                    <Lightbulb size={18} /> Tips
                </button>
                <button
                    className={`btn btn-toggle ${showResources ? "active" : ""}`}
                    onClick={() => setShowResources((s) => !s)}
                >
                    <Youtube size={18} /> Resources
                </button>
                <button
                    className={`btn btn-toggle ${showDrills ? "active" : ""}`}
                    onClick={() => setShowDrills((s) => !s)}
                >
                    <Dumbbell size={18} /> Practice Drills
                </button>
            </div>

            {/* ─────── TIPS LIST ─────── */}
            {showTips && (
                <div className="content-box tips-box">
                    <h4>
                        <Lightbulb size={20} /> Practice Tips
                    </h4>
                    <ul>
                        {current.tips.map((t, i) => (
                            <li key={i}>{t}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ─────── RESOURCES (YouTube & Links) ─────── */}
            {showResources && (
                <div className="content-box resources-box">
                    {/* YouTube Videos Section */}
                    {current.links.filter(l => l.type === 'youtube' || !l.type).length > 0 && (
                        <>
                            <h4>
                                <Youtube size={20} /> Video Resources
                            </h4>
                            {current.links
                                .filter(l => l.type === 'youtube' || !l.type)
                                .map((link, i) => (
                                    <div key={`video-${i}`} style={{ marginBottom: '1.5rem' }}>
                                        <h5 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>{link.title}</h5>
                                        <YouTubeEmbed url={link.url} title={link.title} />
                                    </div>
                                ))}
                        </>
                    )}
                    
                    {/* Website Links Section */}
                    {current.links.filter(l => l.type === 'website').length > 0 && (
                        <>
                            <h4 style={{ marginTop: current.links.filter(l => l.type === 'youtube' || !l.type).length > 0 ? '1.5rem' : '0' }}>
                                <LinkIcon size={20} /> Website Resources
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {current.links
                                    .filter(l => l.type === 'website')
                                    .map((link, i) => (
                                        <a
                                            key={`link-${i}`}
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="video-link"
                                            style={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.5rem',
                                                padding: '0.75rem',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                borderRadius: '8px',
                                                textDecoration: 'none',
                                                transition: 'background-color 0.2s'
                                            }}
                                        >
                                            <LinkIcon size={16} />
                                            <span>{link.title}</span>
                                        </a>
                                    ))}
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* ─────── DRILLS BOX ─────── */}
            {showDrills && (
                <div className="content-box drills-box">
                    <h4>
                        <Dumbbell size={20} /> Practice Drills
                    </h4>
                    <ul className="drills-list">
                        {current.drills.map((drill, i) => {
                            const IconComponent = iconMap[drill.icon];
                            return (
                                <li key={i} className="drill-item">
                                    {IconComponent && <IconComponent size={18} className="drill-icon" />}
                                    <span>{drill.text}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* ─────── MUSIC GENRE SELECTOR ─────── */}
            <div className="content-box music-selector">
                <h4 className="music-selector-title">
                    <Headphones size={20} /> Choose Your Music
                </h4>
                <div className="genre-chips">
                    {MUSIC_GENRES.map((genre) => (
                        <button
                            key={genre.name}
                            className={`genre-chip ${selectedGenre?.name === genre.name ? "active" : ""}`}
                            onClick={() => selectGenre(genre)}
                            style={{ 
                                backgroundColor: selectedGenre?.name === genre.name 
                                    ? genre.color 
                                    : 'rgba(255, 255, 255, 0.1)',
                                borderColor: genre.color
                            }}
                        >
                            <Radio size={16} /> {genre.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─────── SOUNDCLOUD PLAYER ─────── */}
            {selectedGenre && (
                <div className="content-box music-box">
                    <h4>
                        <Radio size={20} /> {selectedGenre.name} Mix
                    </h4>
                    <div className="soundcloud-container">
                        <iframe
                            width="100%"
                            height="166"
                            scrolling="no"
                            frameBorder="no"
                            allow="autoplay"
                            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(selectedGenre.soundCloudUrl)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
