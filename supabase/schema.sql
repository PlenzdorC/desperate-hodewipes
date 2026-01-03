-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Admin users table
CREATE TABLE admin_users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Members table
CREATE TABLE members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    class TEXT NOT NULL,
    specialization TEXT NOT NULL,
    role TEXT NOT NULL,
    item_level INTEGER,
    raiderio_score INTEGER,
    status TEXT DEFAULT 'active',
    is_officer BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications table
CREATE TABLE applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    character_name TEXT NOT NULL,
    character_class TEXT NOT NULL,
    specialization TEXT NOT NULL,
    item_level INTEGER NOT NULL,
    raiderio_score INTEGER,
    experience TEXT NOT NULL,
    motivation TEXT NOT NULL,
    availability TEXT NOT NULL,
    discord_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by TEXT
);

-- Raids table
CREATE TABLE raids (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bosses table
CREATE TABLE bosses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    raid_id UUID REFERENCES raids(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position INTEGER NOT NULL,
    status TEXT DEFAULT 'not_attempted',
    kill_date DATE,
    progress_percentage INTEGER DEFAULT 0,
    difficulty TEXT NOT NULL
);

-- Events table
CREATE TABLE events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT NOT NULL,
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    status TEXT DEFAULT 'scheduled',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery table
CREATE TABLE gallery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Guild settings table
CREATE TABLE guild_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    action TEXT NOT NULL,
    description TEXT NOT NULL,
    "user" TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
INSERT INTO admin_users (username, password) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert sample raid data
INSERT INTO raids (name, difficulty) VALUES 
('Amirdrassil, der Traum der Hoffnung', 'mythic');

-- Get the raid ID for boss insertion
INSERT INTO bosses (raid_id, name, position, status, kill_date, difficulty, progress_percentage) 
SELECT r.id, 'Gnarlroot', 1, 'killed', '2023-11-15', 'mythic', 100 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

INSERT INTO bosses (raid_id, name, position, status, kill_date, difficulty, progress_percentage) 
SELECT r.id, 'Igira der Grausame', 2, 'killed', '2023-11-22', 'mythic', 100 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

INSERT INTO bosses (raid_id, name, position, status, kill_date, difficulty, progress_percentage) 
SELECT r.id, 'Volcoross', 3, 'killed', '2023-11-29', 'mythic', 100 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

INSERT INTO bosses (raid_id, name, position, status, difficulty, progress_percentage) 
SELECT r.id, 'Rat der Träume', 4, 'progress', 'mythic', 15 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

INSERT INTO bosses (raid_id, name, position, status, difficulty, progress_percentage) 
SELECT r.id, 'Nymue', 5, 'not_attempted', 'mythic', 0 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

INSERT INTO bosses (raid_id, name, position, status, difficulty, progress_percentage) 
SELECT r.id, 'Smolderon', 6, 'not_attempted', 'mythic', 0 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

INSERT INTO bosses (raid_id, name, position, status, difficulty, progress_percentage) 
SELECT r.id, 'Tindral Sageswift', 7, 'not_attempted', 'mythic', 0 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

INSERT INTO bosses (raid_id, name, position, status, difficulty, progress_percentage) 
SELECT r.id, 'Fyrakk der Blazing', 8, 'not_attempted', 'mythic', 0 FROM raids r WHERE r.name = 'Amirdrassil, der Traum der Hoffnung';

-- Insert sample members
INSERT INTO members (name, class, specialization, role, item_level, raiderio_score, status, is_officer) VALUES 
('Beispielname', 'warrior', 'Schutz', 'tank', 445, 2800, 'active', true),
('Heilername', 'priest', 'Heilig', 'heal', 443, 2600, 'active', true),
('Jägername', 'hunter', 'Überleben', 'dps', 441, 2400, 'active', false),
('Druidenname', 'druid', 'Wiederherstellung', 'heal', 440, 2200, 'active', false);

-- Insert guild settings
INSERT INTO guild_settings (setting_key, setting_value) VALUES 
('guild_name', 'Desperate Hordewipes'),
('server_name', 'Dein Server Name'),
('guild_description', 'Eine Gilde, die beweist, dass man auch beim Wipen Spaß haben kann!'),
('raid_times', 'Mittwoch & Sonntag, 20:00-23:00 Uhr'),
('discord_invite', '#'),
('recruitment_status', 'open');

-- Insert sample events
INSERT INTO events (title, description, event_type, event_date, event_time, max_attendees, current_attendees, status) VALUES 
('Mythic Raid', 'Progression Raid', 'raid', '2024-01-15', '20:00:00', 20, 18, 'scheduled'),
('M+ Abend', 'Mythic+ Dungeon Night', 'mythicplus', '2024-01-17', '19:30:00', null, 0, 'scheduled'),
('Guild Meeting', 'Monthly Guild Meeting', 'social', '2024-01-20', '20:00:00', 50, 0, 'scheduled');

-- Enable Row Level Security (RLS)
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE raids ENABLE ROW LEVEL SECURITY;
ALTER TABLE bosses ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE guild_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for members" ON members FOR SELECT USING (true);
CREATE POLICY "Public read access for raids" ON raids FOR SELECT USING (true);
CREATE POLICY "Public read access for bosses" ON bosses FOR SELECT USING (true);
CREATE POLICY "Public read access for events" ON events FOR SELECT USING (true);
CREATE POLICY "Public read access for gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read access for guild_settings" ON guild_settings FOR SELECT USING (true);

-- Create policies for applications (public insert, admin read/update)
CREATE POLICY "Public insert for applications" ON applications FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin access for applications" ON applications FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for admin-only tables
CREATE POLICY "Admin only access for admin_users" ON admin_users FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin only access for activity_log" ON activity_log FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for admin write access
CREATE POLICY "Admin write access for members" ON members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update access for members" ON members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete access for members" ON members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin write access for events" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update access for events" ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete access for events" ON events FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin write access for gallery" ON gallery FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update access for gallery" ON gallery FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete access for gallery" ON gallery FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin update access for bosses" ON bosses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin update access for guild_settings" ON guild_settings FOR UPDATE USING (auth.role() = 'authenticated');
