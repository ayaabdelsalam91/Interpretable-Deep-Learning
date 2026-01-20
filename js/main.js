// Main JavaScript file - loads and displays all data from JSON files

// Load JSON data
async function loadJSON(file) {
    try {
        const response = await fetch(file);
        if (!response.ok) throw new Error(`Failed to load ${file}`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${file}:`, error);
        return null;
    }
}

// Render About Section
async function renderAbout() {
    const data = await loadJSON('data/about.json');
    if (!data) return;

    document.getElementById('about-description').textContent = data.description;

    const highlightsContainer = document.getElementById('highlights-container');
    highlightsContainer.innerHTML = data.highlights.map(highlight => `
        <div class="highlight-card">
            <div class="highlight-icon">${highlight.icon}</div>
            <h3>${highlight.title}</h3>
            <p>${highlight.text}</p>
        </div>
    `).join('');
}

// Render Organizers
async function renderOrganizers() {
    const organizers = await loadJSON('data/organizers.json');
    if (!organizers) return;

    const container = document.getElementById('organizers-container');
    container.innerHTML = organizers.map(org => {
        const links = Object.entries(org.links || {})
            .map(([key, url]) => `<a href="${url}" target="_blank" class="organizer-link">${key}</a>`)
            .join(' · ');

        return `
            <div class="organizer-card">
                <img src="${org.image}" alt="${org.name}" class="organizer-img" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22150%22 height=%22150%22%3E%3Crect width=%22150%22 height=%22150%22 fill=%22%23ddd%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2260%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3E${org.name.split(' ').map(n => n[0]).join('')}%3C/text%3E%3C/svg%3E'">
                <h3>${org.name}</h3>
                <p class="organizer-title">${org.title}</p>
                <p class="organizer-bio">${org.bio}</p>
                ${links ? `<div class="organizer-links">${links}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Render Sessions
async function renderSessions() {
    const sessions = await loadJSON('data/sessions.json');
    if (!sessions) return;

    const container = document.getElementById('sessions-container');
    
    // Separate upcoming and past sessions
    const upcoming = sessions.filter(s => s.status === 'upcoming');
    const past = sessions.filter(s => s.status === 'past');

    const renderSession = (session) => {
        const isPast = session.status === 'past';
        const actionButton = isPast 
            ? session.videoUrl 
                ? `<a href="${session.videoUrl}" target="_blank" class="session-button">Watch Recording</a>`
                : ''
            : session.meetingLink 
                ? `<a href="${session.meetingLink}" target="_blank" class="session-button">Join Meeting</a>`
                : '<span class="session-button disabled">Meeting Link TBA</span>';

        return `
            <div class="session-card ${isPast ? 'past-session' : 'upcoming-session'}">
                <div class="session-header ${isPast ? 'past' : 'upcoming'}">
                    ${isPast ? 'Past Session' : 'Upcoming Session'}
                </div>
                <div class="session-content">
                    <h3>${session.title}</h3>
                    <div class="session-meta">
                        <div class="session-speaker">👤 ${session.speaker}</div>
                        <div class="session-date">📅 ${formatDate(session.date)}</div>
                        <div class="session-time">🕐 ${session.time}</div>
                    </div>
                    <p class="session-abstract">${session.abstract}</p>
                    ${session.paper.url ? `<div class="session-paper">📄 <a href="${session.paper.url}" target="_blank">${session.paper.title}</a></div>` : ''}
                    ${actionButton}
                </div>
            </div>
        `;
    };

    container.innerHTML = [
        ...upcoming.map(renderSession),
        ...past.map(renderSession)
    ].join('');
}

// Render Resources
async function renderResources() {
    const data = await loadJSON('data/resources.json');
    if (!data) return;

    // Render community links
    const communityContainer = document.getElementById('community-container');
    communityContainer.innerHTML = data.community.map(resource => `
        <a href="${resource.url}" target="_blank" class="resource-card">
            <div class="resource-icon">${resource.icon}</div>
            <h3>${resource.name}</h3>
            <p>${resource.description}</p>
        </a>
    `).join('');

    // Render reading list
    const readingListContainer = document.getElementById('reading-list-container');
    const readingList = data.readingList;
    const readingUrl = readingList.isInternal ? readingList.url : readingList.url;
    
    readingListContainer.innerHTML = `
        <a href="${readingUrl}" ${readingList.isInternal ? '' : 'target="_blank"'} class="resource-card featured">
            <div class="resource-icon">${readingList.icon}</div>
            <h3>${readingList.name}</h3>
            <p>${readingList.description}</p>
        </a>
    `;
}

// Utility function to format dates
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    renderAbout();
    renderOrganizers();
    renderSessions();
    renderResources();
});