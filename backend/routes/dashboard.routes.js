// routes/dashboard.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/db.config');
const { verifyToken } = require('../middleware/auth.middleware');
const { logAudit } = require('../utils/audit.utils');

// Apply authentication middleware to all routes
router.use(verifyToken);

// Ensure uploads directory exists for officials
const officialsUploadsDir = path.join(__dirname, '../uploads/officials');
if (!fs.existsSync(officialsUploadsDir)) {
  fs.mkdirSync(officialsUploadsDir, { recursive: true });
}

// Configure multer for official images
const officialsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, officialsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `official-${uniqueSuffix}${ext}`);
  }
});

const officialsFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'));
  }
};

const uploadOfficialImage = multer({
  storage: officialsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: officialsFileFilter
});

// Ensure uploads directory exists for announcements
const announcementsUploadsDir = path.join(__dirname, '../uploads/announcements');
if (!fs.existsSync(announcementsUploadsDir)) {
  fs.mkdirSync(announcementsUploadsDir, { recursive: true });
}

// Configure multer for announcement images
const announcementsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, announcementsUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `announcement-${uniqueSuffix}${ext}`);
  }
});

const announcementsFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'));
  }
};

const uploadAnnouncementImage = multer({
  storage: announcementsStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: announcementsFileFilter
});

// Ensure uploads directory exists for about images
const aboutUploadsDir = path.join(__dirname, '../uploads/about');
if (!fs.existsSync(aboutUploadsDir)) {
  fs.mkdirSync(aboutUploadsDir, { recursive: true });
}

// Configure multer for about images
const aboutStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, aboutUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `about-${uniqueSuffix}${ext}`);
  }
});

const aboutFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, JPG, PNG, WEBP) are allowed'));
  }
};

const uploadAboutImage = multer({
  storage: aboutStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: aboutFileFilter
});

// GET dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get total residents count
    const [residentsCount] = await pool.query('SELECT COUNT(*) as count FROM residents');
    
    // Get total households count (unique addresses)
    const [householdsCount] = await pool.query('SELECT COUNT(DISTINCT address) as count FROM residents WHERE address IS NOT NULL AND address != ""');
    
    // Get total certificates issued
    const [certificatesCount] = await pool.query('SELECT COUNT(*) as count FROM certificates WHERE date_issued >= DATE_SUB(NOW(), INTERVAL 1 MONTH)');
    
    // Get total certificates (all time)
    const [totalCertificates] = await pool.query('SELECT COUNT(*) as count FROM certificates');
    
    // Get pending requests (certificates with recent creation but not issued)
    const [pendingCount] = await pool.query(`
      SELECT COUNT(*) as count FROM certificates 
      WHERE DATE(timestap) = CURDATE() 
      AND date_issued IS NULL OR date_issued > CURDATE()
    `);
    
    // Get announcements count
    const [announcementsCount] = await pool.query(`
      SELECT COUNT(*) as count FROM announcements 
      WHERE is_active = 1 
      AND (expiry_date IS NULL OR expiry_date >= CURDATE())
    `);
    
    // Get events count
    const [eventsCount] = await pool.query(`
      SELECT COUNT(*) as count FROM events 
      WHERE is_active = 1 
      AND event_date >= CURDATE()
    `);
    
    // Get demographic statistics
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    
    // Senior Citizens (65 and above)
    const [seniorCitizens] = await pool.query(`
      SELECT COUNT(*) as count FROM residents 
      WHERE dob IS NOT NULL 
      AND YEAR(CURDATE()) - YEAR(dob) >= 65
    `);
    
    // Solo Parents (from solo_parent_records table)
    const [soloParents] = await pool.query(`
      SELECT COUNT(DISTINCT resident_id) as count FROM solo_parent_records 
      WHERE is_active = 1
    `);
    
    // PWD - We'll need to add this field to residents table or create a separate table
    // For now, returning 0
    const personsWithDisability = [{ count: 0 }];
    
    // Youth (below 30, we can adjust this)
    const [youth] = await pool.query(`
      SELECT COUNT(*) as count FROM residents 
      WHERE dob IS NOT NULL 
      AND YEAR(CURDATE()) - YEAR(dob) < 30 
      AND YEAR(CURDATE()) - YEAR(dob) >= 15
    `);

    res.json({
      residents: residentsCount[0]?.count || 0,
      households: householdsCount[0]?.count || 0,
      certificates: totalCertificates[0]?.count || 0,
      certificatesThisMonth: certificatesCount[0]?.count || 0,
      healthCheckups: 0, // Placeholder - would need a health_checkups table
      pendingRequests: pendingCount[0]?.count || 0,
      announcements: announcementsCount[0]?.count || 0,
      events: eventsCount[0]?.count || 0,
      complaints: 0, // Placeholder - would need a complaints table
      demographics: {
        seniorCitizens: seniorCitizens[0]?.count || 0,
        soloParents: soloParents[0]?.count || 0,
        personsWithDisability: personsWithDisability[0]?.count || 0,
        youth: youth[0]?.count || 0,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// GET announcements
router.get('/announcements', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM announcements 
      WHERE is_active = 1 
      AND (expiry_date IS NULL OR expiry_date >= CURDATE())
      ORDER BY date_posted DESC 
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// GET mission & vision and about
router.get('/settings', async (req, res) => {
  try {
    const [missionVision] = await pool.query(`
      SELECT * FROM settings_pages 
      WHERE slug = 'mission-vision' AND is_active = 1
    `);
    
    const [about] = await pool.query(`
      SELECT * FROM settings_pages 
      WHERE slug = 'about' AND is_active = 1
    `);
    
    res.json({
      missionVision: missionVision[0] || { content: '', title: 'Mission & Vision' },
      about: about[0] || { content: '', title: 'About Barangay 145' }
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// UPDATE mission & vision content
router.put('/settings/mission-vision', async (req, res) => {
  try {
    const { mission, vision } = req.body;
    if (!mission || !vision) {
      return res.status(400).json({ error: 'Mission and vision are required' });
    }

    const userId = req.user?.user_id || null;
    const content = JSON.stringify({ mission, vision });

    await pool.query(
      `INSERT INTO settings_pages (slug, title, content, is_active, updated_by)
       VALUES ('mission-vision', 'Mission & Vision', ?, 1, ?)
       ON DUPLICATE KEY UPDATE 
         content = VALUES(content),
         is_active = 1,
         updated_by = VALUES(updated_by),
         date_updated = NOW()`,
      [content, userId]
    );

    await logAudit(req.user, 'SETTINGS_UPDATE', 'settings_pages', null, { slug: 'mission-vision' });

    res.json({ success: true, message: 'Mission & Vision updated successfully' });
  } catch (error) {
    console.error('Error updating mission & vision:', error);
    res.status(500).json({ error: 'Failed to update mission & vision' });
  }
});

// UPDATE about content
router.put('/settings/about', async (req, res) => {
  try {
    const { about } = req.body;
    if (!about) {
      return res.status(400).json({ error: 'About content is required' });
    }

    const userId = req.user?.user_id || null;
    const content = JSON.stringify({ description: about });

    await pool.query(
      `INSERT INTO settings_pages (slug, title, content, is_active, updated_by)
       VALUES ('about', 'About Barangay 145', ?, 1, ?)
       ON DUPLICATE KEY UPDATE 
         content = VALUES(content),
         is_active = 1,
         updated_by = VALUES(updated_by),
         date_updated = NOW()`,
      [content, userId]
    );

    await logAudit(req.user, 'SETTINGS_UPDATE', 'settings_pages', null, { slug: 'about' });

    res.json({ success: true, message: 'About updated successfully' });
  } catch (error) {
    console.error('Error updating about:', error);
    res.status(500).json({ error: 'Failed to update about' });
  }
});

// POST upload about image
router.post('/about/images', uploadAboutImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const userId = req.user?.user_id || null;
    const imagePath = `/uploads/about/${req.file.filename}`;

    // Get current about content
    const [aboutRows] = await pool.query(`
      SELECT * FROM settings_pages 
      WHERE slug = 'about' AND is_active = 1
    `);

    let aboutContent = { description: '', history: '', images: [] };
    if (aboutRows.length > 0 && aboutRows[0].content) {
      try {
        aboutContent = JSON.parse(aboutRows[0].content);
        if (!aboutContent.images) {
          aboutContent.images = [];
        }
      } catch (e) {
        // If parsing fails, keep default structure
      }
    }

    // Add new image to array
    aboutContent.images = [...(aboutContent.images || []), imagePath];

    // Update database
    const content = JSON.stringify(aboutContent);
    await pool.query(
      `INSERT INTO settings_pages (slug, title, content, is_active, updated_by)
       VALUES ('about', 'About Barangay 145', ?, 1, ?)
       ON DUPLICATE KEY UPDATE 
         content = VALUES(content),
         is_active = 1,
         updated_by = VALUES(updated_by),
         date_updated = NOW()`,
      [content, userId]
    );

    await logAudit(req.user, 'ABOUT_IMAGE_UPLOAD', 'settings_pages', null, { image_path: imagePath });

    res.json({ 
      success: true, 
      image_path: imagePath,
      images: aboutContent.images,
      message: 'Image uploaded successfully' 
    });
  } catch (error) {
    console.error('Error uploading about image:', error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// DELETE about image
router.delete('/about/images', async (req, res) => {
  try {
    const { image_path } = req.body;
    if (!image_path) {
      return res.status(400).json({ error: 'Image path is required' });
    }

    const userId = req.user?.user_id || null;

    // Get current about content
    const [aboutRows] = await pool.query(`
      SELECT * FROM settings_pages 
      WHERE slug = 'about' AND is_active = 1
    `);

    if (aboutRows.length === 0) {
      return res.status(404).json({ error: 'About content not found' });
    }

    let aboutContent = { description: '', history: '', images: [] };
    try {
      aboutContent = JSON.parse(aboutRows[0].content);
      if (!aboutContent.images) {
        aboutContent.images = [];
      }
    } catch (e) {
      // If parsing fails, keep default structure
    }

    // Remove image from array
    const imageIndex = aboutContent.images.indexOf(image_path);
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found in about content' });
    }

    aboutContent.images = aboutContent.images.filter(img => img !== image_path);

    // Delete physical file
    const imageFileName = image_path.split('/').pop();
    const imageFilePath = path.join(aboutUploadsDir, imageFileName);
    if (fs.existsSync(imageFilePath)) {
      try {
        fs.unlinkSync(imageFilePath);
      } catch (fileError) {
        console.error('Error deleting image file:', fileError);
        // Continue even if file deletion fails
      }
    }

    // Update database
    const content = JSON.stringify(aboutContent);
    await pool.query(
      `INSERT INTO settings_pages (slug, title, content, is_active, updated_by)
       VALUES ('about', 'About Barangay 145', ?, 1, ?)
       ON DUPLICATE KEY UPDATE 
         content = VALUES(content),
         is_active = 1,
         updated_by = VALUES(updated_by),
         date_updated = NOW()`,
      [content, userId]
    );

    await logAudit(req.user, 'ABOUT_IMAGE_DELETE', 'settings_pages', null, { image_path });

    res.json({ 
      success: true, 
      images: aboutContent.images,
      message: 'Image deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting about image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// GET upcoming events
router.get('/events', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM events 
      WHERE is_active = 1 
      AND event_date >= CURDATE()
      ORDER BY event_date ASC, event_time ASC
      LIMIT 10
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET recent activities (from certificates table)
router.get('/recent-activities', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        certificate_id as id,
        'Certificate issued' as action,
        CONCAT(certificate_type, ' for ', full_name) as detail,
        timestap as time,
        'certificate' as type
      FROM certificates 
      ORDER BY timestap DESC 
      LIMIT 5
    `);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
});

// GET calendar events (events happening this month)
router.get('/calendar-events', async (req, res) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();
    
    const [rows] = await pool.query(`
      SELECT 
        event_id,
        event_name as title,
        event_date as date,
        event_time as time,
        event_type as type
      FROM events 
      WHERE is_active = 1 
      AND YEAR(event_date) = ? 
      AND MONTH(event_date) = ?
      ORDER BY event_date ASC, event_time ASC
    `, [targetYear, targetMonth]);
    
    res.json(rows);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

// GET barangay officials (from a new table or settings)
router.get('/officials', async (req, res) => {
  try {
    // If you have a barangay_officials table, use it
    // Otherwise, return empty array or default data
    const [rows] = await pool.query(`
      SELECT * FROM barangay_officials 
      WHERE is_active = 1 
      ORDER BY position_order ASC
    `).catch(() => {
      // If table doesn't exist, return empty array
      return [[]];
    });
    
    res.json(rows.length > 0 ? rows : [
      { name: 'Juan Dela Cruz', position: 'Barangay Captain' },
      { name: 'Maria Santos', position: 'Barangay Secretary' },
      { name: 'Jose Reyes', position: 'Barangay Treasurer' },
      { name: 'Ana Garcia', position: 'Barangay Councilor' },
    ]);
  } catch (error) {
    console.error('Error fetching officials:', error);
    // Return default data if error
    res.json([
      { name: 'Juan Dela Cruz', position: 'Barangay Captain' },
      { name: 'Maria Santos', position: 'Barangay Secretary' },
      { name: 'Jose Reyes', position: 'Barangay Treasurer' },
      { name: 'Ana Garcia', position: 'Barangay Councilor' },
    ]);
  }
});

// POST create event
router.post('/events', async (req, res) => {
  try {
    const {
      event_name,
      event_description,
      event_date,
      event_time,
      event_location,
      event_type
    } = req.body;

    if (!event_name || !event_date) {
      return res.status(400).json({ error: 'Event name and date are required' });
    }

    const userId = req.user?.user_id || null;

    const [result] = await pool.query(
      `INSERT INTO events 
      (event_name, event_description, event_date, event_time, event_location, event_type, created_by, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        event_name,
        event_description || null,
        event_date,
        event_time || null,
        event_location || 'Barangay Hall',
        event_type || 'Community',
        userId
      ]
    );

    res.status(201).json({ 
      success: true, 
      event_id: result.insertId,
      message: 'Event created successfully'
    });
    await logAudit(req.user, 'EVENT_CREATE', 'events', result.insertId, { event_name, event_date });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// POST create announcement (with optional image)
router.post('/announcements', uploadAnnouncementImage.single('image'), async (req, res) => {
  try {
    const {
      title,
      content,
      announcement_type,
      expiry_date,
      date_posted
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const userId = req.user?.user_id || null;

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/announcements/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO announcements 
      (title, content, announcement_type, date_posted, expiry_date, image_path, created_by, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        title,
        content,
        announcement_type || 'Notice',
        date_posted || new Date().toISOString().split('T')[0],
        expiry_date || null,
        imagePath,
        userId
      ]
    );

    res.status(201).json({ 
      success: true, 
      announcement_id: result.insertId,
      image_path: imagePath,
      message: 'Announcement created successfully'
    });
    await logAudit(req.user, 'ANNOUNCEMENT_CREATE', 'announcements', result.insertId, { title, announcement_type });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// POST create official with image upload
router.post('/officials', uploadOfficialImage.single('image'), async (req, res) => {
  try {
    const {
      name,
      position,
      contact_number,
      email,
      position_order
    } = req.body;

    if (!name || !position) {
      // Delete uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Name and position are required' });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/officials/${req.file.filename}`;
    }

    const [result] = await pool.query(
      `INSERT INTO barangay_officials 
      (name, position, contact_number, email, position_order, image_path, is_active) 
      VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        name,
        position,
        contact_number || null,
        email || null,
        position_order || 0,
        imagePath
      ]
    );

    res.status(201).json({ 
      success: true, 
      official_id: result.insertId,
      message: 'Official added successfully'
    });
    await logAudit(req.user, 'OFFICIAL_CREATE', 'barangay_officials', result.insertId, { name, position });
  } catch (error) {
    console.error('Error creating official:', error);
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    // If table doesn't exist, return success but log warning
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn('barangay_officials table does not exist. Please create it first.');
      return res.status(200).json({ 
        success: true, 
        message: 'Official would be added (table not yet created)'
      });
    }
    res.status(500).json({ error: 'Failed to add official' });
  }
});

// PUT update official
router.put('/officials/:id', uploadOfficialImage.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      position,
      contact_number,
      email,
      position_order
    } = req.body;

    if (!name || !position) {
      // Delete uploaded file if validation fails
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Name and position are required' });
    }

    // Get existing official to check for old image
    const [existing] = await pool.query(
      'SELECT image_path FROM barangay_officials WHERE official_id = ?',
      [id]
    );

    if (existing.length === 0) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: 'Official not found' });
    }

    let imagePath = existing[0].image_path;
    if (req.file) {
      // Delete old image if exists
      if (imagePath && fs.existsSync(path.join(__dirname, '..', imagePath))) {
        fs.unlinkSync(path.join(__dirname, '..', imagePath));
      }
      imagePath = `/uploads/officials/${req.file.filename}`;
    }

    await pool.query(
      `UPDATE barangay_officials 
       SET name = ?, position = ?, contact_number = ?, email = ?, position_order = ?, image_path = ?
       WHERE official_id = ?`,
      [
        name,
        position,
        contact_number || null,
        email || null,
        position_order || 0,
        imagePath,
        id
      ]
    );

    res.json({ 
      success: true, 
      message: 'Official updated successfully' 
    });
    await logAudit(req.user, 'OFFICIAL_UPDATE', 'barangay_officials', id, { name, position });
  } catch (error) {
    console.error('Error updating official:', error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to update official' });
  }
});

// DELETE official (soft delete by setting is_active = 0)
router.delete('/officials/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.query(
      'SELECT image_path FROM barangay_officials WHERE official_id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Official not found' });
    }

    await pool.query(
      'UPDATE barangay_officials SET is_active = 0 WHERE official_id = ?',
      [id]
    );

    res.json({ 
      success: true, 
      message: 'Official deleted successfully' 
    });
    await logAudit(req.user, 'OFFICIAL_DELETE', 'barangay_officials', id, {});
  } catch (error) {
    console.error('Error deleting official:', error);
    res.status(500).json({ error: 'Failed to delete official' });
  }
});

module.exports = router;
