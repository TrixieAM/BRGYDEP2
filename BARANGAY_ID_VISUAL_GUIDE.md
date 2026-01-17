# Barangay ID Module - Visual & Quick Reference Guide

## 📱 User Interface Layout

### Main Screen (Resident Selection)
```
┌────────────────────────────────────────────────────────────┐
│  🎫 Barangay ID Card                    12 Residents       │ ← Header
├────────────────────────────────────────────────────────────┤
│  Select a Resident                                         │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │ [M] Moneque      │  │ [L] Lyra Borling │  │ [H] Hanna│ │
│  │ ID: 1            │  │ ID: 6            │  │ ID: 7    │ │
│  └──────────────────┘  └──────────────────┘  └──────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │ [T] Trixie Ann   │  │ More...          │  │          │ │
│  │ ID: 8            │  │                  │  │          │ │
│  └──────────────────┘  └──────────────────┘  └──────────┘ │
└────────────────────────────────────────────────────────────┘
  Click any resident to view their ID card
```

### ID Card Dialog
```
┌─────────────────────────────────────────────────────────┐
│ Barangay ID Card      [Refresh] [Close]    (Top Bar)   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Republic of the Philippines                    │   │ ← Front
│  │ Barangay 145 Bagong Barrio                     │   │
│  │ CALOOCAN CITY                                  │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ ID No: 00001            Date Issued: Jan 17    │   │
│  │                                                 │   │
│  │             [📷 Photo Space]                   │   │
│  │                                                 │   │
│  │         Moneque Sazon                          │   │
│  │         12 Kanto St                            │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ BARANGAY ID                                     │   │ ← Back
│  │                                                 │   │
│  │ Date of Birth: Jan 31, 2000  Age: 25           │   │
│  │ Civil Status: Single                           │   │
│  │ Tel./CP#: 098726416782                         │   │
│  │                                                 │   │
│  │ ┌─────────────────────────────────────────┐   │   │
│  │ │ In Case of Emergency                    │   │   │
│  │ │ Name: _______________________________  │   │   │
│  │ │ Address: ____________________________  │   │   │
│  │ │ Tel./CP#: __________________________  │   │   │
│  │ └─────────────────────────────────────────┘   │   │
│  │                                                 │   │
│  │ ┌─────────────────────────────────────────┐   │   │
│  │ │   Name & Signature of Owner             │   │   │
│  │ └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Print]  [Download PDF]                   (Buttons)   │
│                                                         │
│  Auto-refresh: ON    [Disable Auto-refresh 3s] ┌─────┐ │
│                                                │ 3s  │ │
│                                                └─────┘ │
└─────────────────────────────────────────────────────────┘
```

### Sidebar Menu
```
Home
Residents
👉 Barangay ID  ← NEW
Certificates
  • Certification Action
  • Indigency
Settings
```

---

## 🔄 Auto-Refresh Indicator

```
Status Bar (Bottom of Dialog):

┌──────────────────────────────────────────────┐
│ Auto-refresh: ON                             │
│ Updates every 3 seconds when dialog is open  │
│                                              │
│ [Disable Auto-refresh]  [Manual Refresh]     │
└──────────────────────────────────────────────┘

OR

┌──────────────────────────────────────────────┐
│ Auto-refresh: OFF                            │
│ Not updating. Click to enable.               │
│                                              │
│ [Enable Auto-refresh]   [Manual Refresh]     │
└──────────────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │
       │ GET /barangay-id
       │ (get all residents)
       ├──────────────────────────────┐
       │                              │
       ▼                              ▼
┌─────────────────┐        ┌──────────────────┐
│ Resident Grid   │        │ Backend Server   │
│ Selection       │        │ (Express.js)     │
└────────┬────────┘        └────────┬─────────┘
         │                          │
         │ User clicks             │ Query
         │ resident               │
         ▼                          ▼
┌─────────────────┐        ┌──────────────────┐
│ Show Loading    │        │ MySQL Database   │
│                 │        │                  │
└────────┬────────┘        │ residents table  │
         │                 └──────────────────┘
         │ GET /barangay-id/:id
         │ (fetch specific resident)
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌─────────────────┐        ┌──────────────────┐
│ Display ID Card │        │ Fetch resident   │
│ Dialog          │◄───────│ data by ID       │
└────────┬────────┘        └──────────────────┘
         │
         │ Every 3 seconds
         │ (if auto-refresh ON)
         ▼
    [Repeat fetch]
```

---

## 🖨️ Print Workflow

```
┌─────────────────────────────────────────┐
│ User clicks [Print] button              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Browser Print  │
         │ Dialog Opens   │
         └────┬───────────┘
              │
         ┌────┴─────────┬─────────────────┐
         │              │                 │
         ▼              ▼                 ▼
    Print     Save as PDF   Print to
    Directly  (Future)      PDF Printer
         │              │                 │
         └────┬─────────┴─────────────────┘
              │
              ▼
      ID Card Printed!
```

---

## 🔐 Security & Permissions

```
User Login
    │
    ▼
Check Permission: "access_residents"
    │
    ├─ YES ─→ Show Barangay ID menu
    │
    └─ NO  ─→ Hide Barangay ID menu

API Calls
    │
    ├─ Check JWT Token Valid
    │   ├─ YES ─→ Return data
    │   └─ NO  ─→ Return 401 Unauthorized
    │
    └─ Check Permission
        ├─ YES ─→ Return resident data
        └─ NO  ─→ Return 403 Forbidden
```

---

## 📱 Responsive Design

### Mobile (xs)
```
┌──────────────────────────────┐
│ 🎫 Barangay ID   [12 Items]  │
├──────────────────────────────┤
│ Select a Resident            │
│ ┌─────────────┐              │
│ │ [M] Moneque │ ← Stacked   │
│ │ ID: 1       │   single    │
│ └─────────────┘   column    │
│ ┌─────────────┐              │
│ │ [L] Lyra    │              │
│ │ ID: 6       │              │
│ └─────────────┘              │
└──────────────────────────────┘
```

### Tablet (md)
```
┌────────────────────────────────────────────┐
│ 🎫 Barangay ID   [12 Residents]            │
├────────────────────────────────────────────┤
│ Select a Resident                          │
│ ┌──────────────┐  ┌──────────────┐         │
│ │ [M] Moneque  │  │ [L] Lyra     │ ← 2   │
│ │ ID: 1        │  │ ID: 6        │   col  │
│ └──────────────┘  └──────────────┘   layout│
│ ┌──────────────┐  ┌──────────────┐         │
│ │ [H] Hanna    │  │ [T] Trixie   │         │
│ │ ID: 7        │  │ ID: 8        │         │
│ └──────────────┘  └──────────────┘         │
└────────────────────────────────────────────┘
```

### Desktop (lg)
```
┌─────────────────────────────────────────────────────────────┐
│ 🎫 Barangay ID   [12 Residents]                             │
├─────────────────────────────────────────────────────────────┤
│ Select a Resident                                           │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│ │ [M]Moneque │  │ [L] Lyra   │  │ [H] Hanna  │  │ [T]Tri │ │
│ │ ID: 1      │  │ ID: 6      │  │ ID: 7      │  │ ID: 8  │ │
│ └────────────┘  └────────────┘  └────────────┘  └────────┘ │
│ ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────┐ │
│ │ More...    │  │            │  │            │  │        │ │
│ │            │  │            │  │            │  │        │ │
│ └────────────┘  └────────────┘  └────────────┘  └────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

```
Primary Green (#0D4715)
████████████
Used for: Headers, buttons, main text

Secondary Green (#1a5f2e)
████████████
Used for: Gradients, hover effects

Dark Green (#0D2818)
████████████
Used for: Borders, dark backgrounds

Orange Accent (#E9762B)
████████████
Used for: Emergency info, highlights

Light Cream (#F1F0E9)
████████████
Used for: Card backgrounds, main text
```

---

## ⏱️ Auto-Refresh Timing

```
┌─ 3 seconds ─┬─ 3 seconds ─┬─ 3 seconds ─┬─ ...
│             │             │             │
Fetch 1    Fetch 2      Fetch 3      Fetch 4
│             │             │             │
┴─────────────┴─────────────┴─────────────┴─

When Dialog is OPEN and Auto-refresh is ON:
• Fetches new data every 3 seconds
• Shows loading indicator during fetch
• Updates display if data changed

When Dialog is CLOSED or Auto-refresh is OFF:
• No automatic fetches
• Use Manual Refresh button
```

---

## 📋 ID Card Fields

### Required Fields
```
✓ Resident ID (auto-generated)
✓ Full Name
✓ Address
✓ Date of Birth
✓ Age (auto-calculated)
```

### Optional Fields
```
○ Provincial Address
○ Civil Status
○ Contact Number
○ Photo
○ Emergency Contact Info
```

### Auto-Calculated Fields
```
→ Age (from Date of Birth)
→ Date Issued (current date)
→ ID Number Format (5 digits)
```

---

## 🔧 Troubleshooting Quick Guide

| Problem | Solution | Status |
|---------|----------|--------|
| Menu item not visible | Check permission "access_residents" | ✓ |
| Print dialog won't open | Allow pop-ups, try different browser | ✓ |
| Auto-refresh not working | Ensure dialog is open, check toggle | ✓ |
| Residents list empty | Verify data in residents table | ✓ |
| API returns 401 | JWT token expired, login again | ✓ |
| API returns 403 | Missing permission, contact admin | ✓ |
| Component won't load | Check browser console (F12) | ✓ |
| Styling looks wrong | Clear cache, restart browser | ✓ |

---

## 📞 API Response Times

```
Operation          Expected Time   Acceptable Range
─────────────────  ──────────────  ─────────────────
Get all residents     50-100ms        <500ms
Get single resident   30-50ms         <100ms
Print dialog open     10-20ms         <50ms
Auto-refresh fetch    50-100ms        <300ms
Database query        5-10ms          <50ms
```

---

## 🎯 Component Hierarchy

```
App.jsx
├── AppBar (Header)
├── Sidebar (Navigation)
├── BarangayID.jsx ← Main Component
│   ├── Header (Paper)
│   ├── Selection Grid (Paper)
│   │   ├── GridItem (Resident Card)
│   │   ├── GridItem (Resident Card)
│   │   └── ...
│   ├── Dialog (ID Card)
│   │   ├── DialogTitle
│   │   ├── IDCard (Printable)
│   │   │   ├── Front (Box)
│   │   │   └── Back (Box)
│   │   ├── ActionButtons (Stack)
│   │   └── AutoRefreshToggle (Box)
│   └── Footer
└── ...Other components
```

---

## 📞 Quick Reference

| Item | Value | Link |
|------|-------|------|
| Module Name | Barangay ID Card | `/barangay-id` |
| Permission | access_residents | role_permissions |
| API Base | http://localhost:5000 | server.js |
| Component | BarangayID.jsx | /components/ |
| Routes | barangay-id.routes.js | /backend/routes/ |
| Database | residents table | brgy145 |
| Tracking | barangay_id_issuance | migrations/ |
| Documentation | BARANGAY_ID_README.md | root |

---

## ✅ Verification Checklist

- [ ] BarangayID.jsx component exists
- [ ] barangay-id.routes.js exists
- [ ] Route added to App.jsx
- [ ] Route registered in server.js
- [ ] Menu item appears in sidebar
- [ ] Can click menu item
- [ ] Resident grid loads
- [ ] Click resident shows ID card
- [ ] Print button works
- [ ] Auto-refresh toggles work
- [ ] Refresh button works
- [ ] Close button closes dialog

---

## 🚀 Next Steps

1. ✅ **Verify Installation**
   - Restart backend
   - Check sidebar for "Barangay ID"

2. ✅ **Test Functionality**
   - Click menu item
   - Select resident
   - Try print

3. ✅ **Optional: Apply Tracking**
   - Run migration SQL
   - Track print history

4. ✅ **Customize (Optional)**
   - Change colors
   - Add photo field
   - Add QR code
   - Implement PDF export

---

**Ready to use! 🎉**

For detailed info, see: **BARANGAY_ID_README.md**
