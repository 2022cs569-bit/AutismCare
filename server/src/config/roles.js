const ROLES = {
  parent: [
    'VIEW_CHILD',
    'REQUEST_APPOINTMENT',
    'VIEW_REPORTS'
  ],

  doctor: [
    'VIEW_ASSIGNED_PATIENTS',
    'ADD_DIAGNOSIS',
    'VIEW_REPORTS'
  ],

  therapist: [
    'VIEW_ASSIGNED_SESSIONS',
    'ADD_THERAPY_NOTES'
  ],

  laboratory: [
    'VIEW_TEST_ORDERS',
    'UPLOAD_REPORTS'
  ],

  admin: [
    'MANAGE_USERS',
    'APPROVE_ACCOUNTS',
    'ASSIGN_ROLES',
    'FULL_ACCESS'
  ]
};

module.exports = ROLES;
