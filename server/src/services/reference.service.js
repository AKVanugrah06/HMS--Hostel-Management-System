function generateReferenceNo(studentId, rollNo) {
  const year = new Date().getFullYear();
  const cleanRoll = rollNo ? rollNo.replace(/[^A-Za-z0-9]/g, '').toUpperCase() : '';
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const suffix = cleanRoll ? `${cleanRoll.slice(-4)}-${randomSuffix}` : (studentId ? studentId.slice(0, 4).toUpperCase() + '-' + randomSuffix : randomSuffix);
  return `HMS${year}-${suffix}`;
}

module.exports = { generateReferenceNo };
