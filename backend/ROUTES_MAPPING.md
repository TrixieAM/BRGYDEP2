# Complete Routes Mapping - All 15 Forms

## ✅ All Forms Now Have Separate Route Files!

Each form now has its own dedicated route file with full CRUD operations.

## Forms to Routes Mapping

| # | Frontend Form | API Endpoint | Route File | Status |
|---|--------------|--------------|------------|--------|
| 1 | **Indigency.jsx** | `/indigency` | `routes/indigency.routes.js` | ✅ |
| 2 | **BarangayClearance.jsx** | `/barangay-clearance` | `routes/barangay-clearance.routes.js` | ✅ |
| 3 | **BarangayClearanceCRUD.jsx** | `/barangay-clearance` | `routes/barangay-clearance.routes.js` | ✅ (same as #2) |
| 4 | **BusinessClearance.jsx** | `/business-clearance` | `routes/business-clearance.routes.js` | ✅ |
| 5 | **CertificateOfResidency.jsx** | `/certificate-of-residency` | `routes/certificate-of-residency.routes.js` | ✅ |
| 6 | **PermitToTravel.jsx** | `/permit-to-travel` | `routes/permit-to-travel.routes.js` | ✅ |
| 7 | **CashAssistance.jsx** | `/cash-assistance` | `routes/cash-assistance.routes.js` | ✅ |
| 8 | **FinancialAssistance.jsx** | `/financial-assistance` | `routes/financial-assistance.routes.js` | ✅ |
| 9 | **BhertCertPositive.jsx** | `/bhert-certificate-positive` | `routes/bhert-certificate-positive.routes.js` | ✅ |
| 10 | **BhertCertNormal.jsx** | `/bhert-certificate-normal` | `routes/bhert-certificate-normal.routes.js` | ✅ |
| 11 | **CertificationAction.jsx** | `/certificate-of-action` | `routes/certificate-of-action.routes.js` | ✅ |
| 12 | **Cohabitation.jsx** | `/certificate-of-cohabitation` | `routes/certificate-of-cohabitation.routes.js` | ✅ |
| 13 | **OathJobSeeker.jsx** | `/oath-job` | `routes/oath-job.routes.js` | ✅ |
| 14 | **SoloParentForm.jsx** | `/solo-parent-records` | `routes/solo-parent.routes.js` | ✅ |
| 15 | **VerifyCohabitation.jsx** | `/verify/:id` (public) | `routes/verification.routes.js` | ✅ (verification only) |

## Route Files Structure

### Certificate Route Files (10 files):
1. `routes/indigency.routes.js` - Indigency certificates
2. `routes/barangay-clearance.routes.js` - Barangay clearance
3. `routes/business-clearance.routes.js` - Business clearance
4. `routes/certificate-of-residency.routes.js` - Certificate of residency
5. `routes/permit-to-travel.routes.js` - Permit to travel
6. `routes/cash-assistance.routes.js` - Cash assistance
7. `routes/financial-assistance.routes.js` - Financial assistance
8. `routes/bhert-certificate-positive.routes.js` - BHERT certificate positive
9. `routes/bhert-certificate-normal.routes.js` - BHERT certificate normal
10. `routes/certificate-of-action.routes.js` - Certificate of action
11. `routes/certificate-of-cohabitation.routes.js` - Certificate of cohabitation

### Other Route Files:
- `routes/auth.routes.js` - Authentication
- `routes/users.routes.js` - User management
- `routes/residents.routes.js` - Residents
- `routes/certificates.routes.js` - General certificates
- `routes/request-records.routes.js` - Request records
- `routes/oath-job.routes.js` - Oath job seeker
- `routes/solo-parent.routes.js` - Solo parent records
- `routes/verification.routes.js` - Public verification routes

## CRUD Operations

Each certificate route file includes:

### ✅ GET Operations
- `GET /{endpoint}` - Get all active records
- `GET /{endpoint}/:id` - Get single record by ID
- `GET /bhert-certificate-normal/transaction/:transactionNumber` - Get by transaction number (BHERT Normal only)
- `GET /indigency/transaction/:transactionNumber` - Get by transaction number (Indigency only)

### ✅ POST Operations
- `POST /{endpoint}` - Create new record
- All routes validate required fields
- Auto-generate transaction numbers if not provided
- Check for duplicate transaction numbers

### ✅ PUT Operations
- `PUT /{endpoint}/:id` - Update existing record
- Validates transaction number uniqueness on update
- Updates `date_updated` timestamp automatically

### ✅ DELETE Operations
- `DELETE /{endpoint}/:id` - Soft delete (sets `is_active = FALSE`)
- Updates `date_updated` timestamp automatically

## All API Endpoints Available

### Public Routes (No Auth Required):
- `GET /verify/:id` - Certificate verification (HTML)
- `GET /verify/indigency/:id` - Verify indigency (JSON)
- `GET /verify/business-clearance/:id` - Verify business clearance (JSON)
- `GET /verify/api/indigency/:id/hash` - Get verification hash
- `GET /verify/api/business-clearance/:id/hash` - Get business clearance hash

### Protected Routes (Require JWT Token):

#### Certificate Routes (All have GET, POST, PUT, DELETE):
- `/indigency`
- `/barangay-clearance`
- `/business-clearance`
- `/certificate-of-residency`
- `/permit-to-travel`
- `/cash-assistance`
- `/financial-assistance`
- `/bhert-certificate-positive`
- `/bhert-certificate-normal`
- `/certificate-of-action`
- `/certificate-of-cohabitation`

#### Other Routes:
- `/oath-job`
- `/solo-parent-records`
- `/solo-parent-records/:id/children`
- `/residents`
- `/users` (admin only)
- `/certificates`
- `/request-records`

## Summary

✅ **All 15 forms have separate route files!**
✅ **Each route file has complete CRUD operations**
✅ **All routes are properly organized and maintainable**
✅ **JWT authentication is implemented on all protected routes**

## File Organization

```
backend/routes/
├── auth.routes.js
├── users.routes.js
├── residents.routes.js
├── indigency.routes.js
├── barangay-clearance.routes.js
├── business-clearance.routes.js
├── certificate-of-residency.routes.js
├── permit-to-travel.routes.js
├── cash-assistance.routes.js
├── financial-assistance.routes.js
├── bhert-certificate-positive.routes.js
├── bhert-certificate-normal.routes.js
├── certificate-of-action.routes.js
├── certificate-of-cohabitation.routes.js
├── certificates.routes.js
├── request-records.routes.js
├── oath-job.routes.js
├── solo-parent.routes.js
└── verification.routes.js
```
