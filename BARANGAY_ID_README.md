# Barangay ID Card Module Documentation

## Overview
The Barangay ID Card module allows users to view and print resident identification cards with auto-refresh functionality. When a resident is selected from the list, their information is displayed in an ID card format that can be printed or downloaded.

## Features

### 1. **Resident Selection**
- View all residents in a grid format
- Click on any resident to view their ID card
- Real-time search capability

### 2. **ID Card Display**
- Professional ID card layout based on Barangay 145 template
- Displays:
  - Resident ID (5-digit format)
  - Full Name
  - Address
  - Date of Birth
  - Age (auto-calculated)
  - Civil Status
  - Contact Number
  - Date Issued
  - Photo placeholder
  - Emergency contact section
  - Signature area

### 3. **Auto-Refresh Functionality**
- Automatically refreshes resident data every 3 seconds when enabled
- Toggle on/off with a button in the ID card dialog
- Useful for live updates if information changes

### 4. **Print Functionality**
- Click "Print" button to open print dialog
- Format is optimized for printing on standard ID card paper
- Can print directly or save as PDF

### 5. **PDF Download** (Coming Soon)
- Download ID card as PDF file
- Placeholder for future implementation

## File Structure

```
backend/
├── routes/
│   └── barangay-id.routes.js       # API routes for ID data
├── migrations/
│   └── barangay-id-issuance.sql    # Optional tracking table

frontend/
└── components/
    └── BarangayID.jsx              # Main component
```

## API Endpoints

### GET `/barangay-id`
Fetch all residents for selection
**Authentication:** Required
**Response:**
```json
[
  {
    "resident_id": 1,
    "full_name": "Moneque Sazon",
    "address": "12 Kanto St",
    "provincial_address": "Metro Manila",
    "dob": "2000-01-31",
    "age": 25,
    "civil_status": "Single",
    "contact_no": "098726416782",
    "created_at": "2025-10-11T07:01:56.000Z"
  }
]
```

### GET `/barangay-id/:residentId`
Fetch specific resident data
**Authentication:** Required
**Parameters:**
- `residentId`: Integer - The resident ID

**Response:**
```json
{
  "resident_id": 1,
  "full_name": "Moneque Sazon",
  "address": "12 Kanto St",
  "provincial_address": "Metro Manila",
  "dob": "2000-01-31",
  "age": 25,
  "civil_status": "Single",
  "contact_no": "098726416782",
  "created_at": "2025-10-11T07:01:56.000Z"
}
```

## Database Schema

### Existing Table: `residents`
No modifications needed. Uses existing resident data.

### Optional: `barangay_id_issuance` (Migration)
For tracking ID issuance and print history:

```sql
CREATE TABLE barangay_id_issuance (
  id_issuance_id INT PRIMARY KEY AUTO_INCREMENT,
  resident_id INT NOT NULL,
  issued_date DATE,
  printed_date TIMESTAMP,
  printed_by_user_id INT,
  id_status ENUM('active', 'replaced', 'expired'),
  expiration_date DATE,
  notes TEXT,
  date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**To apply migration:**
```bash
mysql -u root -p brgy145 < backend/migrations/barangay-id-issuance.sql
```

## Integration Points

### 1. In `App.jsx`
- Import component: `import BarangayID from './components/BarangayID';`
- Added route: `/barangay-id`
- Added to sidebar navigation
- Uses permission: `access_residents`

### 2. In `server.js`
- Imported routes: `import barangayIDRoutes from './routes/barangay-id.routes.js';`
- Registered route: `app.use('/barangay-id', barangayIDRoutes);`

## Component Props & State

### Key State Variables
```javascript
const [selectedResidentId, setSelectedResidentId] = useState(null);
const [residentData, setResidentData] = useState(null);
const [residents, setResidents] = useState([]);
const [loading, setLoading] = useState(false);
const [autoRefresh, setAutoRefresh] = useState(true);
const [error, setError] = useState('');
const [openDialog, setOpenDialog] = useState(false);
```

### Key Functions
- `loadAllResidents()` - Fetch all residents on component mount
- `fetchResidentData(residentId)` - Fetch specific resident data
- `handleSelectResident(residentId)` - Handle resident selection
- `handleRefresh()` - Manual refresh of resident data
- `handlePrint()` - Trigger print dialog
- `formatDate(dateString)` - Format dates for display
- `calculateAge(dob)` - Calculate age from date of birth

## Styling & Theming

### Colors Used
- Primary Green: `#0D4715` (Barangay official color)
- Secondary Green: `#1a5f2e`
- Dark Green: `#0D2818`
- Orange Accent: `#E9762B`
- Light Background: `#F1F0E9`

### Responsive Design
- Mobile: `xs` and `sm` breakpoints
- Tablet: `md` breakpoint
- Desktop: `lg` breakpoint

## Usage Instructions

### For End Users
1. Navigate to "Barangay ID" in the sidebar
2. Click on a resident name to view their ID card
3. (Optional) Enable/disable auto-refresh
4. Click "Print" to print the ID card
5. Click "Download PDF" for future PDF functionality
6. Click "Close" or "Refresh" to update information

### For Developers
1. Component uses Material-UI (MUI) components
2. Requires `useAuth` context hook from `AuthContext.jsx`
3. API calls use Bearer token authentication
4. Print functionality uses native browser print dialog

## Security Considerations

1. **Authentication**: All API endpoints require valid JWT token
2. **Authorization**: Requires `access_residents` permission
3. **Data Privacy**: Only authenticated users can access ID information
4. **Print History**: Optional tracking via `barangay_id_issuance` table

## Performance Notes

- Auto-refresh interval: 3 seconds (configurable)
- Only refreshes when dialog is open and auto-refresh is enabled
- Data is memoized to prevent unnecessary re-renders
- Pagination not implemented (suitable for barangay size ~1000 residents)

## Future Enhancements

1. **PDF Export**
   - Implement using libraries like `pdfkit` or `html2pdf`
   - Add download functionality

2. **Digital Signature**
   - Integrate with signature module
   - Add captain/chairman signature to ID

3. **Photo Upload**
   - Allow photo attachment to resident profile
   - Display actual photo instead of placeholder

4. **QR Code**
   - Generate QR code linking to resident verification
   - Include in ID card

5. **ID Batch Printing**
   - Print multiple ID cards at once
   - Export to PDF or image format

6. **ID Expiration Management**
   - Track ID expiration dates
   - Remind when renewal needed
   - Track issuance history

7. **Multi-language Support**
   - Add Tagalog/Filipino translation
   - Language toggle

## Troubleshooting

### Common Issues

**Issue: "No residents found"**
- Check database connection
- Verify residents table has data
- Check user permissions

**Issue: Print dialog not opening**
- Check browser security settings
- Ensure pop-ups are allowed
- Try different browser

**Issue: Auto-refresh not working**
- Check if dialog is open
- Verify token hasn't expired
- Check browser console for errors

**Issue: Styling looks off**
- Clear browser cache
- Verify MUI is properly installed
- Check CSS conflicts

## Dependencies

### Frontend
- React 18+
- Material-UI (MUI) v5+
- React Router v6+
- Axios (via context API)

### Backend
- Express.js
- Node.js
- MySQL/MariaDB
- JWT authentication

## Support

For issues or feature requests, refer to the main project documentation or contact the development team.

---

**Last Updated:** January 17, 2026
**Version:** 1.0.0
**Status:** Production Ready
