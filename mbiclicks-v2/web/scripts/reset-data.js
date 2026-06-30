/**
 * reset-data.js
 *
 * Padam semua rekod permohonan, pekeliling dan acara.
 * Budget akan dipulihkan secara automatik kerana ia dikira semula
 * dari billing records yang tinggal.
 * ActualData (sync AutoCount) TIDAK disentuh.
 *
 * Guna: npm run db:reset-data
 */

import { PrismaClient } from '@prisma/client'
import readline from 'readline'

const prisma = new PrismaClient()

function confirm(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close()
      resolve(ans.trim().toLowerCase())
    })
  })
}

async function main() {
  console.log('\n⚠️  AMARAN: Operasi ini akan MEMADAM data berikut:')
  console.log('   • Semua Permohonan Pembayaran (+ item, kelulusan, bayaran, lampiran)')
  console.log('   • Semua Pekeliling')
  console.log('   • Semua Acara Kalendar')
  console.log('   • Semua Notifikasi')
  console.log('\n   Bajet akan dipulihkan secara automatik.')
  console.log('   Data ActualData (AutoCount) TIDAK dipadam.\n')

  const ans = await confirm('Taip "YES" untuk teruskan: ')
  if (ans !== 'yes') {
    console.log('❌ Dibatalkan.')
    process.exit(0)
  }

  console.log('\n🔄 Memadam data...\n')

  // 1. Notifikasi
  const notif = await prisma.notification.deleteMany()
  console.log(`   ✓ Notifikasi         : ${notif.count} rekod dipadam`)

  // 2. Permohonan — cascade: BillingItem, BillingApproval, BillingPayment, BillingAttachment
  const billing = await prisma.billing.deleteMany()
  console.log(`   ✓ Permohonan         : ${billing.count} rekod dipadam (+ item, kelulusan, bayaran, lampiran)`)

  // 3. Pekeliling — cascade: CircularRead
  const circular = await prisma.circular.deleteMany()
  console.log(`   ✓ Pekeliling         : ${circular.count} rekod dipadam`)

  // 4. Acara Kalendar — cascade: EventInvitee
  const event = await prisma.event.deleteMany()
  console.log(`   ✓ Acara Kalendar     : ${event.count} rekod dipadam`)

  console.log('\n✅ Selesai. Bajet telah dipulihkan secara automatik.\n')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
