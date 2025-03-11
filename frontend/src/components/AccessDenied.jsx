import React from 'react';
import { ShieldX } from 'lucide-react';

export default function AccessDenied({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <ShieldX size={64} className="text-red-500 mb-4" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        Akses Tidak Dibenarkan
      </h2>
      <p className="text-gray-600">
        {message || 'Maaf, anda tidak mempunyai kebenaran untuk mengakses halaman ini.'}
      </p>
    </div>
  );
}
