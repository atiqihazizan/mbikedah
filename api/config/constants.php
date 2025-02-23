<?php

return [
  'roles' => [
    'admin' => 1,
    'user' => 2,
    'hod' => 3,
    'finance' => 4,
    'hr' => 5,
    'ceo' => 6,
  ],

  'payment_methods' => [
    'cheque',
    'online',
    'cash'
  ],

  'ABILITIES' => [
    1 => 'Create',
    2 => 'View',
    3 => 'Edit',
    4 => 'Delete',
    5 => 'Review',
    6 => 'Verify',
    7 => 'Approve',
    8 => 'Paid',
    9 => 'Reject',
    10 => 'Cancel',
  ],
];

// Status transition rules
// {
//     1: [2],           // Draft -> Approval HOD
//     2: [3, 8],        // Approval HOD -> Checking Finance, Rejected
//     3: [4],           // Checking Finance -> Approval Finance
//     4: [5, 8],        // Verify Finance -> Verified, Rejected
//     5: [6, 8],        // Approval Finance[6, 8],        // Approval Finance -> Approved, Rejected] -> Approved, Rejected
//     6: [7],           // Approved -> Paid[6, 8],        // Approval Finance -> Approved, Rejected]
//     7: [],            // Paid -> (no further transitions)[6, 8],        // Approval Finance -> Approved, Rejected]
//     8: []             // Rejected -> (no further transitions)
//   };
