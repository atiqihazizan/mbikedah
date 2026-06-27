import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'

const prisma = new PrismaClient()
const data = JSON.parse(readFileSync('/Users/atiqi/works/mbiclicks/mbiclicks-v2/sub_belanja_2026.json'))

const budgetYear = await prisma.budgetYear.findFirst({ where: { status: 'ACTIVE' } })
const adminUser = await prisma.user.findFirst({ select: { id: true } })
console.log('Budget year:', budgetYear.year, 'id:', budgetYear.id)
console.log('Admin user:', adminUser.id)

let lineCount = 0, lineError = 0
for (const e of data.entries) {
  const b = e.bajet
  const total = Object.values(b).reduce((s, v) => s + v, 0)
  try {
    await prisma.$executeRaw`
      INSERT INTO budget_lines (budget_year_id, acc_no, version, jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, \`dec\`, total, created_by)
      VALUES (${budgetYear.id}, ${e.accNo}, 'ORIGINAL',
        ${b.jan}, ${b.feb}, ${b.mar}, ${b.apr}, ${b.may}, ${b.jun},
        ${b.jul}, ${b.aug}, ${b.sep}, ${b.oct}, ${b.nov}, ${b.dec},
        ${total}, ${adminUser.id})
      ON DUPLICATE KEY UPDATE
        jan=${b.jan}, feb=${b.feb}, mar=${b.mar}, apr=${b.apr}, may=${b.may}, jun=${b.jun},
        jul=${b.jul}, aug=${b.aug}, sep=${b.sep}, oct=${b.oct}, nov=${b.nov}, \`dec\`=${b.dec},
        total=${total}
    `
    lineCount++
  } catch(err) {
    console.error('Line error', e.accNo, err.message.substring(0, 100))
    lineError++
  }
}
console.log('Budget lines upserted:', lineCount, 'errors:', lineError)

const MONTH_KEYS = ['jan','feb','mar','apr','may']
let actualCount = 0
for (const e of data.entries) {
  for (let i = 0; i < MONTH_KEYS.length; i++) {
    const month = i + 1
    const amt = e.actual[MONTH_KEYS[i]]
    if (amt !== 0) {
      await prisma.$executeRaw`
        INSERT INTO actual_data (acc_no, year, month, amount)
        VALUES (${e.accNo}, ${budgetYear.year}, ${month}, ${amt})
        ON DUPLICATE KEY UPDATE amount=${amt}
      `
      actualCount++
    }
  }
}
console.log('Actual records upserted:', actualCount)
await prisma.$disconnect()
console.log('DONE')
