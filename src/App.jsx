import React, { useState, useEffect } from 'react';
import './App.css';
import { Turnstile } from '@marsidev/react-turnstile';
import { Editor } from '@tinymce/tinymce-react';

// Centralized Staff Data Array
const staffData = [
  { id: 'gavin', name: 'Gavin Liu', pronouns: 'He/Him', grade: 'Junior', role: 'Co-Editor in Chief', shortBio: 'Dedicated to fostering a welcoming community for young writers.', fullBio: 'Full biography coming soon...', photo: '/gavinliu.png' },
  { id: 'tawanda', name: 'Tawanda Sibanda', pronouns: 'He/Him', grade: 'Senior', role: 'Co-Editor in Chief & Internal Operations Secretary', shortBio: 'Passionate about organizing and streamlining literary operations.', fullBio: 'Full biography coming soon...' },
  { id: 'tallulah', name: 'Tallulah Dolan', pronouns: 'She/Her', grade: 'Junior', role: 'Fiction Editor & External Operations Secretary', shortBio: 'An avid reader and writer of contemporary fiction.', fullBio: 'Full biography coming soon...' },
  { id: 'grey', name: 'Grey Raymonds', pronouns: 'He/Him', grade: 'Senior', role: 'Poetry Editor', shortBio: 'Specializes in free verse and deeply emotional works.', fullBio: 'Full biography coming soon...' },
  { id: 'brielle', name: 'Brielle Tandy', pronouns: 'She/Her', grade: 'Senior', role: 'Poetry Editor', shortBio: 'Loves finding rhythm and structure in every stanza.', fullBio: 'Full biography coming soon...' },
  { id: 'sherry', name: 'Sherry Wang', pronouns: 'She/Her', grade: 'Junior', role: 'Poetry Editor & Social Media Director', shortBio: 'Connecting poets across digital landscapes and social feeds.', fullBio: 'Full biography coming soon...' },
  { id: 'mia-l', name: 'Mia Lucke', pronouns: 'She/Her', grade: 'Senior', role: 'Poetry Editor & Art Editor', shortBio: 'Bridging the gap between visual arts and the written word.', fullBio: 'Full biography coming soon...' },
  { id: 'aster', name: 'Aster Greer', pronouns: 'They/Them', grade: 'Senior', role: 'Nonfiction Editor', shortBio: 'Dedicated to highlighting powerful, true stories and essays.', fullBio: 'Full biography coming soon...' },
  { id: 'jayne', name: 'Jayne Kim', pronouns: 'She/Her', grade: 'Senior', role: 'Nonfiction Editor & International Representative (South Korea)', shortBio: 'Bringing global perspectives to creative nonfiction.', fullBio: 'Full biography coming soon...' },
  { id: 'stella', name: 'Stella Goldstein', pronouns: 'She/Her', grade: 'Junior', role: 'Nonfiction Editor & International Representative (Japan)', shortBio: 'Curating essays that bridge diverse cultures and experiences.', fullBio: 'Full biography coming soon...' },
  { id: 'juliana', name: 'Juliana Grindel', pronouns: 'She/Her', grade: 'Senior', role: 'Fiction Editor', shortBio: 'Always on the hunt for a compelling narrative arc.', fullBio: 'Full biography coming soon...' },
  { id: 'mia-s', name: 'Mia Song', pronouns: 'She/Her', grade: 'Senior', role: 'Fiction Editor & Website Manager', shortBio: 'Weaving stories both in prose and in web code.', fullBio: 'Full biography coming soon...' },
  { id: 'che', name: 'Che Holts', pronouns: 'He/Him', grade: 'Junior', role: 'Photography Editor', shortBio: 'Capturing moments that speak louder than words.', fullBio: 'Full biography coming soon...' },
  { id: 'rubbi', name: 'Rubbi Chen', pronouns: 'She/Her', grade: 'Senior', role: 'International Representative (China)', shortBio: 'Fostering literary connections across international borders.', fullBio: 'Full biography coming soon...' },
];

const TINYMCE_INIT = {
  height: 400,
  menubar: false,
  plugins: [
    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
    'searchreplace', 'visualblocks', 'code', 'fullscreen',
    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
  ],
  toolbar: 'undo redo | formatselect | ' +
    'bold italic backcolor | alignleft aligncenter ' +
    'alignright alignjustify | bullist numlist outdent indent | ' +
    'removeformat | help',
  content_style: 'body { font-family:Lora,Georgia,serif; font-size:16px }',
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Subscription Form State
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subCountry, setSubCountry] = useState('');
  const [subCaptchaToken, setSubCaptchaToken] = useState('');
  const [subActionType, setSubActionType] = useState('subscribe');

  // Admin Login State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  
  // Editor States
  const [newIssueTitle, setNewIssueTitle] = useState('');
  const [newIssueHtml, setNewIssueHtml] = useState('');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [editingIssueId, setEditingIssueId] = useState('new'); // <-- Add this new line

  // Admin edit existing issue
  const [adminMode, setAdminMode] = useState('publish');
  const [editingIssueId, setEditingIssueId] = useState('');
  const [editIssueTitle, setEditIssueTitle] = useState('');
  const [editIssueHtml, setEditIssueHtml] = useState('');

  // --- New State for Dynamic Content ---
  const [currentIssue, setCurrentIssue] = useState(null);
  const [pastIssues, setPastIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null); // <-- Add this new line!
  const [announcement, setAnnouncement] = useState('');
  const [isContentLoading, setIsContentLoading] = useState(true);

  async function refreshSiteContent() {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      if (data.success) {
        setCurrentIssue(data.currentIssue);
        setPastIssues(data.pastIssues || []);
        if (data.announcement) setAnnouncement(data.announcement.message);
      }
      return data;
    } catch (err) {
      console.error('Failed to fetch site content:', err);
      return null;
    }
  }

  // Fetch content on page load
  useEffect(() => {
    async function loadContent() {
      await refreshSiteContent();
      setIsContentLoading(false);
    }
    loadContent();
  }, []);

  const allIssuesForAdmin = [
    ...(currentIssue ? [{ ...currentIssue, isCurrent: true }] : []),
    ...(pastIssues || []).map((issue) => ({ ...issue, isCurrent: false })),
  ];

  function handleSelectIssueToEdit(issueId) {
    const issue = allIssuesForAdmin.find((i) => i.id === issueId);
    if (!issue) return;
    setEditingIssueId(issue.id);
    setEditIssueTitle(issue.title);
    setEditIssueHtml(issue.content_html);
  }

  const handleStaffClick = (staff) => {
    setSelectedStaff(staff);
    setActiveTab('staff-detail');
  };

  return (
    <div className="app">
      {/* Header & Logo */}
      <header className="site-header">
        <div className="container">
          <a href="#" className="logo-container" onClick={() => setActiveTab('home')}>
            <img src="/inkandstain_icon.png" alt="The Hilltop Horizon Review Logo" className="logo-icon" />
            <h1 className="site-title">The Hilltop Horizon Review</h1>
            <p className="site-subtitle">an international youth literary magazine</p>
          </a>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="nav-bar">
        <ul className="nav-list">
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveTab('home')}>Home</button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveTab('about-litmag')}>About ▾</button>
            <ul className="dropdown">
              <li><button className="dropdown-link" onClick={() => setActiveTab('about-litmag')}>About the Lit Mag</button></li>
              <li><button className="dropdown-link" onClick={() => setActiveTab('about-mission')}>Our Mission</button></li>
              <li><button className="dropdown-link" onClick={() => setActiveTab('about-staff')}>Staff / Team</button></li>
            </ul>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveTab('issues-current')}>Issues ▾</button>
            <ul className="dropdown">
              <li><button className="dropdown-link" onClick={() => setActiveTab('issues-current')}>Current Issue</button></li>
              <li><button className="dropdown-link" onClick={() => setActiveTab('issues-archive')}>Past Issues Archive</button></li>
            </ul>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveTab('submit-guidelines')}>Submit ▾</button>
            <ul className="dropdown">
              <li><button className="dropdown-link" onClick={() => setActiveTab('submit-guidelines')}>Guidelines</button></li>
              <li><button className="dropdown-link" onClick={() => setActiveTab('submit-links')}>Submissions Links</button></li>
            </ul>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveTab('faq')}>FAQ</button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveTab('contact')}>Contact Us</button>
          </li>
          <li className="nav-item">
            <button className="nav-link" onClick={() => setActiveTab('join')}>Join Us</button>
          </li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <main className="main-content container">

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div>

            {/* Dynamic Announcement Banner */}
            {announcement && (
              <div style={{
                backgroundColor: 'var(--accent-bg)',
                borderLeft: '4px solid var(--text-main)',
                padding: '15px 20px',
                marginBottom: '30px',
                fontStyle: 'italic',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span className="loud-speaker">📢</span> 
                <span><strong>Latest Update:</strong> {announcement}</span>
              </div>
            )}

            <div className="hero-banner">
              <p className="hero-description">
                We are an international youth literary magazine, run by high schoolers, for high schoolers.
              </p>
            </div>

            <div className="content-box" style={{ textAlign: 'center' }}>
              <h2 className="section-title">From the Editors' Desk</h2>
              <p style={{ maxWidth: '700px', margin: '0 auto', marginBottom: '20px' }}>
                Welcome to the digital home of Ink & Stain. In a world increasingly driven by fleeting digital trends, we wanted to carve out a quiet, intentional space for young voices. Whether you write in the margins of your notebooks, type late into the night, or sketch on scrap paper, this journal is a testament to the raw and the profoundly human. 
              </p>
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                — Gavin & Tawanda, Co-Editors-in-Chief
              </p>
            </div>

            {/* Announcements Box */}
            <div className="content-box" style={{ maxWidth: '700px', margin: '0 auto 40px auto' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', marginBottom: '15px', textAlign: 'center' }}>Announcements</h3>
              <ul style={{ paddingLeft: '20px', fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <li>
                  <strong>Issue I Submissions:</strong> We are officially open for poetry, prose, and visual art. Read our guidelines to submit.
                </li>
                <li>
                  <strong>Editors Wanted:</strong> We are expanding our masthead! If you have a sharp eye for literature, check our "Join Us" page to apply.
                </li>
              </ul>
            </div>
            
            <h2 className="section-title">Featured Work</h2>
            <div className="featured-poem">
              <h3 className="poem-title">Sample Piece</h3>
              <p className="poem-body">
                {`Spurts of violent blue
Shining of teasing steel too
Red upon white cloth`}
              </p>
            </div>
          </div>
        )}

        {/* ABOUT SUBTABS */}
        {activeTab === 'about-litmag' && (
          <div className="content-box">
            <h2 className="section-title">About Ink & Stain</h2>
            <p>We are an international youth literary magazine, run by high schoolers, for high schoolers.</p>
          </div>
        )}

        {activeTab === 'about-mission' && (
          <div className="content-box">
            <h2 className="section-title">Our Mission</h2>
            <p>We seek to provide a welcoming and interactive community for young writers to join, as it can be difficult to find such a community locally.</p>
          </div>
        )}

        {/* STAFF DIRECTORY GRID */}
        {activeTab === 'about-staff' && (
          <div>
            <h2 className="section-title">Editorial Board</h2>
            <p style={{ textAlign: 'center', marginBottom: '10px', color: 'var(--text-muted)' }}>
              Our masthead consists of 14 dedicated high school editors worldwide. Click any profile to learn more.
            </p>
            
            <div className="staff-grid">
              {staffData.map((staff) => (
                <div key={staff.id} className="staff-card" onClick={() => handleStaffClick(staff)}>
                  {staff.photo ? (
                    <img src={staff.photo} alt={staff.name} className="staff-photo-placeholder" style={{ objectFit: 'cover', border: 'none' }} />
                  ) : (
                    <div className="staff-photo-placeholder"></div>
                  )}
                  <h3 className="staff-name">{staff.name}</h3>
                  <p className="staff-meta">{staff.pronouns} • {staff.grade}</p>
                  <p className="staff-role">{staff.role}</p>
                  <p className="staff-short-bio">"{staff.shortBio}"</p>
                  <span className="staff-read-more">View Profile →</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INDIVIDUAL STAFF PROFILE VIEW */}
        {activeTab === 'staff-detail' && selectedStaff && (
          <div className="content-box">
            <button className="btn-back" onClick={() => setActiveTab('about-staff')}>
              ← Back to Staff Directory
            </button>
            
            <div className="staff-detail-header">
              {selectedStaff.photo ? (
                <img src={selectedStaff.photo} alt={selectedStaff.name} className="staff-photo-large" style={{ objectFit: 'cover', border: 'none' }} />
              ) : (
                <div className="staff-photo-large"></div>
              )}
              <div>
                <h2>{selectedStaff.name}</h2>
                <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '15px' }}>
                  {selectedStaff.pronouns} • {selectedStaff.grade}
                </p>
                <h4>{selectedStaff.role}</h4>
              </div>
            </div>

            <div className="staff-bio-full">
              <p>{selectedStaff.fullBio}</p>
            </div>
          </div>
        )}

        {/* ISSUES TAB */}
        {(activeTab === 'issues' || activeTab === 'issues-current') && (
          <div className="content-box fade-in">
            <h2 className="section-title">Current Issue</h2>
            
            {isContentLoading && <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)' }}>Loading latest issue...</p>}

            {!isContentLoading && currentIssue && (
              <div style={{ marginBottom: '50px' }}>
                <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', borderBottom: '1px solid var(--accent-border)', paddingBottom: '10px' }}>
                  {currentIssue.title}
                </h3>
                <div className="issue-content" dangerouslySetInnerHTML={{ __html: currentIssue.content_html }} style={{ lineHeight: '1.8' }} />
              </div>
            )}

            {!isContentLoading && !currentIssue && (
              <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)' }}>No active issue is currently published. Check back soon!</p>
            )}
          </div>
        )}

        {/* 2. PAST ISSUES ARCHIVE (Clickable List) */}
        {activeTab === 'issues-archive' && (
          <div className="content-box fade-in">
            <h2 className="section-title">Past Issues Archive</h2>
            
            {isContentLoading && <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)' }}>Loading archive...</p>}
            
            {!isContentLoading && pastIssues.length === 0 && (
              <p style={{ textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)' }}>No past issues available yet.</p>
            )}

            {!isContentLoading && pastIssues.length > 0 && (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {pastIssues.map((issue) => (
                  <li 
                    key={issue.id} 
                    onClick={() => {
                      setSelectedIssue(issue);
                      setActiveTab('issue-detail');
                    }}
                    style={{ 
                      marginBottom: '15px', 
                      padding: '15px', 
                      backgroundColor: 'var(--accent-bg)', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      border: '1px solid transparent',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.border = '1px solid var(--text-main)'}
                    onMouseLeave={(e) => e.currentTarget.style.border = '1px solid transparent'}
                  >
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{issue.title}</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'block', marginTop: '5px' }}>
                      Published {new Date(issue.published_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* 3. PAST ISSUE READER (Viewing a specific clicked issue) */}
        {activeTab === 'issue-detail' && selectedIssue && (
          <div className="content-box fade-in">
            <button 
              className="btn-back" 
              onClick={() => setActiveTab('issues-archive')}
              style={{ marginBottom: '20px', background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', fontStyle: 'italic' }}
            >
              ← Back to Archive
            </button>
            
            <h3 style={{ fontSize: '1.8rem', marginBottom: '20px', borderBottom: '1px solid var(--accent-border)', paddingBottom: '10px' }}>
              {selectedIssue.title}
            </h3>
            
            <div 
              className="issue-content"
              dangerouslySetInnerHTML={{ __html: selectedIssue.content_html }} 
              style={{ lineHeight: '1.8' }}
            />
          </div>
        )}

        {/* SUBMIT SUBTABS */}
        {(activeTab === 'submit-guidelines' || activeTab === 'submit-links') && (
          <div className="content-box">
            <h2 className="section-title">Submission Guidelines</h2>
            <p style={{ marginBottom: '20px' }}>
              Thank you for taking the time to submit to our literary magazine! Please review the information below before making your submission. Good luck!
            </p>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '20px', marginBottom: '10px' }}>Age Requirements</h3>
            <p>Please note we only accept submissions from high school aged students (ages 14–19).</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '20px', marginBottom: '10px' }}>What Can Be Submitted?</h3>
            <p>We accept works of fiction, nonfiction, poetry, artwork, and photography. However, we do <strong>NOT</strong> accept any works that have been published elsewhere. We are looking for original, unpublished works.</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '20px', marginBottom: '10px' }}>Artificial Intelligence & Plagiarism Policy</h3>
            <p>We do not allow the use of artificial intelligence (AI) in any capacity. AI may not be used for developing ideas, giving suggestions, or producing content to any extent.</p>
            <h3 style={{ fontFamily: 'var(--font-heading)', marginTop: '20px', marginBottom: '10px' }}>Prohibited Content</h3>
            <p>We do not permit hate speech, bigotry, extreme violence, or sexually explicit content.</p>
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <a href="#" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Access Submission Form →
              </a>
            </div>
          </div>
        )}

        {/* FAQ TAB */}
        {activeTab === 'faq' && (
          <div className="content-box">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginTop: '15px' }}>Does it cost money to submit?</h4>
            <p style={{ marginBottom: '15px' }}>No, submissions are completely free.</p>
            <h4 style={{ fontFamily: 'var(--font-heading)', marginTop: '15px' }}>Can I submit multiple pieces?</h4>
            <p>Please check the monthly prompt guidelines for genre-specific submission limits.</p>
          </div>
        )}

        {/* CONTACT TAB */}
        {activeTab === 'contact' && (
          <div className="content-box" style={{ maxWidth: '650px', margin: '0 auto' }}>
            <h2 className="section-title">Contact Us</h2>
            
            {/* Official Email & Social Media Placeholders */}
            <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '30px', borderBottom: '1px solid var(--accent-border)' }}>
              <p style={{ marginBottom: '12px', fontSize: '1.05rem' }}>
                <strong>Official Email:</strong> <a href="mailto:contact@inkandstainlit.com" style={{ color: 'var(--text-main)' }}>contact@inkandstainlit.com</a>
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '15px' }}>Connect with us on social media:</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.95rem' }}>
                <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Instagram</a>
                <span>•</span>
                <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>X (Twitter)</a>
                <span>•</span>
                <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>Facebook</a>
                <span>•</span>
                <a href="#" style={{ color: 'var(--text-main)', textDecoration: 'none' }}>TikTok</a>
              </div>
            </div>

            <p style={{ textAlign: 'center', marginBottom: '25px', color: 'var(--text-muted)' }}>
              Subscribe to receive notifications when a new issue drops:
            </p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!subCaptchaToken) {
                alert('Please complete the captcha verification.');
                return;
              }

              // Determine the correct endpoint based on which button was clicked
              const endpoint = subActionType === 'subscribe' ? '/api/subscribe' : '/api/unsubscribe';

              try {
                const response = await fetch(endpoint, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  // Unsubscribe only strictly needs the email and token, but sending the whole payload is fine
                  body: JSON.stringify({ name: subName, email: subEmail, country: subCountry, token: subCaptchaToken }),
                });

                const data = await response.json();
                if (data.success) {
                  alert(subActionType === 'subscribe' ? 'Subscribed successfully!' : 'Unsubscribed successfully.');
                  setSubName('');
                  setSubEmail('');
                  setSubCountry('');
                } else {
                  alert('Error: ' + data.error);
                }
              } catch (err) {
                alert(`An error occurred while trying to ${subActionType}.`);
              }
            }}>
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={subName} 
                  onChange={(e) => setSubName(e.target.value)} 
                  required={subActionType === 'subscribe'} // Only required for subscribing
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={subEmail} 
                  onChange={(e) => setSubEmail(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Country</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={subCountry} 
                  onChange={(e) => setSubCountry(e.target.value)} 
                  required={subActionType === 'subscribe'} // Only required for subscribing
                />
              </div>
              <div style={{ margin: '20px 0', display: 'flex', justifyContent: 'center' }}>
                <Turnstile 
                  siteKey="0x4AAAAAAEEsA5qQZtd99Uc8" 
                  onSuccess={(token) => setSubCaptchaToken(token)} 
                />
              </div>
              
              {/* Button Group */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '15px' }}>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  onClick={() => setSubActionType('subscribe')}
                >
                  Subscribe
                </button>
                <button 
                  type="submit" 
                  className="btn-secondary" 
                  onClick={() => setSubActionType('unsubscribe')}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid var(--text-main)', 
                    color: 'var(--text-main)',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  Unsubscribe
                </button>
              </div>
            </form>

          </div>
        )}

        {/* JOIN US TAB */}
        {activeTab === 'join' && (
          <div className="content-box" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title">Join Our Team</h2>
            <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--text-muted)' }}>
              Ink & Stain is entirely run by high schoolers. We look for passionate, dedicated individuals who want to help shape our global literary community. Open to students ages 14–19.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px' }}>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Poetry Editor</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Reviews and selects poetry submissions, evaluates lyrical quality, and curates monthly poetic features.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Fiction Editor</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Reads short stories and flash fiction submissions, evaluating narrative arc, character development, and prose style.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Nonfiction Editor</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Evaluates personal essays, memoirs, and creative nonfiction pieces for emotional resonance and clarity.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Art Editor</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Curates digital and traditional visual artwork to accompany literary pieces and feature independent youth artists.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Photography Editor</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Selects striking photographic works for publication across issues and online showcases.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Internal Operations Secretary</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Manages internal team schedules, meeting notes, communication channels, and administrative workflows.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>External Operations Secretary</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Coordinates outreach with partner literary magazines, schools, and external literary organizations.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Website Manager</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Maintains web infrastructure, uploads new issues, tests user interfaces, and ensures smooth site performance.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Social Media Director</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Runs social channels, designs promotional graphics, and engages with the online young writer community.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>International Representatives</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Builds regional networks, promotes submissions, and coordinates translation or regional features abroad.</p>
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Director of Policy and Standards</h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Ensures adherence to magazine guidelines, ethical standards, plagiarism checks, and AI-free policies.</p>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ marginBottom: '15px', fontStyle: 'italic' }}>Ready to apply?</p>
              <a href="#" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                Open Application Form (Google Form) →
              </a>
            </div>
          </div>
        )}

        {/* ADMIN TAB */}
        {activeTab === 'admin' && (
          <div className="content-box" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 className="section-title">Editor / Admin Dashboard</h2>
            
            {!isAdminLoggedIn ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                const res = await fetch('/api/admin/login', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ password: adminPassword })
                });
                if (res.ok) setIsAdminLoggedIn(true);
                else {
                  // Extract the real error message from the backend
                  try {
                    const errorData = await res.json();
                    alert(`Access Denied: ${errorData.error}`);
                  } catch (err) {
                    alert(`Server Error: Check your browser's network tab or Cloudflare logs.`);
                  }
                }
              }}>
                <div className="form-group">
                  <label>Admin Password</label>
                  <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="form-control" required />
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Login</button>
              </form>
            ) : (
              <div>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setAdminMode('publish')}
                    style={{
                      backgroundColor: adminMode === 'publish' ? 'var(--text-main)' : 'transparent',
                      color: adminMode === 'publish' ? 'var(--bg-main)' : 'var(--text-main)',
                      border: '1px solid var(--text-main)',
                    }}
                  >
                    Publish New Issue
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => setAdminMode('edit')}
                    style={{
                      backgroundColor: adminMode === 'edit' ? 'var(--text-main)' : 'transparent',
                      color: adminMode === 'edit' ? 'var(--bg-main)' : 'var(--text-main)',
                      border: '1px solid var(--text-main)',
                    }}
                  >
                    Edit Existing Issue
                  </button>
                </div>

                {adminMode === 'publish' ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                
                // BRANCH A: Create New Issue
                if (editingIssueId === 'new') {
                  if (!confirm('Are you sure? This will archive the current issue, update the home page, and email ALL subscribers.')) return;
  
                  const res = await fetch('/api/admin/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      title: newIssueTitle, 
                      contentHtml: newIssueHtml, 
                      announcementMessage: newAnnouncement 
                    })
                  });
  
                  if (res.ok) {
                    alert('Issue published and emails sent successfully!');
                    setNewIssueTitle('');
                    setNewIssueHtml('');
                    setNewAnnouncement('');
                  } else {
                    alert('Failed to publish.');
                  }

                if (res.ok) {
                  alert('Issue published and emails sent successfully!');
                  setNewIssueTitle('');
                  setNewIssueHtml('');
                  setNewAnnouncement('');
                  await refreshSiteContent();
                // BRANCH B: Edit Existing Issue
                } else {
                  if (!confirm('Are you sure you want to save changes to this existing issue? (No emails will be sent)')) return;
                  
                  const res = await fetch('/api/admin/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                      id: editingIssueId,
                      title: newIssueTitle, 
                      contentHtml: newIssueHtml
                    })
                  });
  
                  if (res.ok) {
                    alert('Issue updated successfully! Refresh the page to see changes.');
                  } else {
                    alert('Failed to update issue.');
                  }
                }
              }}>

                {/* --- Mode Selector Dropdown --- */}
                <div className="form-group" style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px dashed var(--accent-border)' }}>
                  <label style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Editor Action</label>
                  <select 
                    className="form-control"
                    value={editingIssueId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setEditingIssueId(selectedId);
                      
                      if (selectedId === 'new') {
                        setNewIssueTitle('');
                        setNewIssueHtml('');
                        setNewAnnouncement('');
                      } else {
                        // Gather all loaded issues to search through
                        const allIssues = currentIssue ? [currentIssue, ...pastIssues] : pastIssues;
                        const targetIssue = allIssues.find(i => i.id === selectedId);
                        if (targetIssue) {
                          setNewIssueTitle(targetIssue.title);
                          setNewIssueHtml(targetIssue.content_html);
                          setNewAnnouncement(''); // Announcements are only for new issues
                        }
                      }
                    }}
                  >
                    <option value="new">🌟 Publish a Brand New Issue</option>
                    {currentIssue && <option value={currentIssue.id}>✏️ Edit Current: {currentIssue.title}</option>}
                    {pastIssues && pastIssues.map(issue => (
                      <option key={issue.id} value={issue.id}>✏️ Edit Archive: {issue.title}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{editingIssueId === 'new' ? 'New Issue Title (e.g., Issue II: Shadows)' : 'Edit Issue Title'}</label>
                  <input type="text" value={newIssueTitle} onChange={(e) => setNewIssueTitle(e.target.value)} className="form-control" required />
                </div>
                
                {/* Only show the announcement field if we are making a NEW issue */}
                {editingIssueId === 'new' && (
                  <div className="form-group">
                    <label>Home Page Announcement Message</label>
                    <input type="text" value={newAnnouncement} onChange={(e) => setNewAnnouncement(e.target.value)} className="form-control" required={editingIssueId === 'new'} 
                           placeholder="e.g., Issue II is officially out! Read it under the Issues tab." />
                  </div>
                )}

                <div className="form-group">
                  <label>Issue Content (WYSIWYG Editor)</label>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Format your text, add headers, links, or images visually below:
                  </p>
                  
                  <Editor
                    apiKey='vi6do892krmboei0izctd0jz9q98379bnrr3h3g7fcejsi5h'
                    value={newIssueHtml}
                    onEditorChange={(content) => setNewIssueHtml(content)}
                    init={TINYMCE_INIT}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '15px', backgroundColor: editingIssueId === 'new' ? '#d9534f' : '#0275d8', borderColor: editingIssueId === 'new' ? '#d9534f' : '#0275d8' }}>
                  {editingIssueId === 'new' ? 'Publish Issue & Broadcast Email' : 'Save Changes (Silent)'}
                </button>
              </form>
                ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!editingIssueId) {
                  alert('Please select an issue to edit.');
                  return;
                }

                const res = await fetch('/api/admin/update-issue', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    issueId: editingIssueId,
                    title: editIssueTitle,
                    contentHtml: editIssueHtml,
                  }),
                });

                const data = await res.json();
                if (res.ok) {
                  alert('Issue updated successfully.');
                  const refreshed = await refreshSiteContent();
                  if (refreshed?.success && selectedIssue?.id === editingIssueId) {
                    const updated = [
                      ...(refreshed.currentIssue ? [refreshed.currentIssue] : []),
                      ...(refreshed.pastIssues || []),
                    ].find((i) => i.id === editingIssueId);
                    if (updated) setSelectedIssue(updated);
                  }
                } else {
                  alert(`Failed to save: ${data.error || 'Unknown error'}`);
                }
              }}>
                <div className="form-group">
                  <label>Select Issue to Edit</label>
                  {allIssuesForAdmin.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>No published issues yet.</p>
                  ) : (
                    <select
                      className="form-control"
                      value={editingIssueId}
                      onChange={(e) => handleSelectIssueToEdit(e.target.value)}
                      required
                    >
                      <option value="">— Choose an issue —</option>
                      {allIssuesForAdmin.map((issue) => (
                        <option key={issue.id} value={issue.id}>
                          {issue.title}
                          {issue.isCurrent ? ' (Current)' : ''}
                          {!issue.isCurrent && issue.published_at
                            ? ` — ${new Date(issue.published_at).toLocaleDateString()}`
                            : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {editingIssueId && (
                  <>
                    <div className="form-group">
                      <label>Issue Title</label>
                      <input
                        type="text"
                        value={editIssueTitle}
                        onChange={(e) => setEditIssueTitle(e.target.value)}
                        className="form-control"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Issue Content (WYSIWYG Editor)</label>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                        Fix typos or formatting below. Saving will not email subscribers.
                      </p>

                      <Editor
                        key={editingIssueId}
                        apiKey='vi6do892krmboei0izctd0jz9q98379bnrr3h3g7fcejsi5h'
                        value={editIssueHtml}
                        onEditorChange={(content) => setEditIssueHtml(content)}
                        init={TINYMCE_INIT}
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '15px' }}>
                      Save Changes
                    </button>
                  </>
                )}
              </form>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      {/* Footer */}
      <footer className="site-footer">
        <div className="container" onDoubleClick={() => setActiveTab('admin')}>
          <p>&copy; {new Date().getFullYear()} Ink & Stain Literary Magazine. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
