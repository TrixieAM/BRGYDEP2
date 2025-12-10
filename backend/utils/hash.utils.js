// utils/hash.utils.js
const crypto = require('crypto');

// Generate document hash for verification
function generateDocumentHash(certificateData) {
  const dataString = JSON.stringify({
    id: certificateData.indigency_id || certificateData.business_clearance_id,
    name: certificateData.full_name,
    dateIssued: certificateData.date_issued,
    transactionNumber: certificateData.transaction_number,
    type: certificateData.type || 'indigency',
  });

  return crypto
    .createHash('sha256')
    .update(dataString)
    .digest('hex')
    .substring(0, 16);
}

module.exports = {
  generateDocumentHash,
};

