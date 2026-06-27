import { z } from 'zod'
import prisma from '../lib/prisma.js'

// GET /api/report-layouts
export async function listLayouts(req, res, next) {
  try {
    const layouts = await prisma.reportLayout.findMany({
      where: { isActive: true },
      include: {
        creator: { select: { id: true, name: true } },
        _count:  { select: { sections: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(layouts)
  } catch (err) { next(err) }
}

// GET /api/report-layouts/:id
export async function getLayout(req, res, next) {
  try {
    const id = Number(req.params.id)
    const layout = await prisma.reportLayout.findUniqueOrThrow({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    })
    res.json(layout)
  } catch (err) { next(err) }
}

const layoutSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(255).optional().nullable(),
})

// POST /api/report-layouts
export async function createLayout(req, res, next) {
  try {
    const data = layoutSchema.parse(req.body)
    const layout = await prisma.reportLayout.create({
      data: { ...data, createdBy: req.user.id },
      include: { creator: { select: { id: true, name: true } } },
    })
    res.status(201).json(layout)
  } catch (err) { next(err) }
}

// PUT /api/report-layouts/:id
export async function updateLayout(req, res, next) {
  try {
    const id   = Number(req.params.id)
    const data = layoutSchema.parse(req.body)
    const layout = await prisma.reportLayout.update({
      where: { id },
      data,
      include: { creator: { select: { id: true, name: true } } },
    })
    res.json(layout)
  } catch (err) { next(err) }
}

// DELETE /api/report-layouts/:id  (soft delete)
export async function deleteLayout(req, res, next) {
  try {
    const id = Number(req.params.id)
    await prisma.reportLayout.update({ where: { id }, data: { isActive: false } })
    res.json({ message: 'Layout dipadam' })
  } catch (err) { next(err) }
}

// ─── Sections ─────────────────────────────────────────────────────────────────

const sectionSchema = z.object({
  title:       z.string().min(1).max(100),
  sectionType: z.enum(['HASIL', 'BELANJA', 'CUSTOM', 'SEPARATOR']).default('CUSTOM'),
  showTotal:   z.boolean().default(true),
  totalLabel:  z.string().max(100).optional().nullable(),
})

// POST /api/report-layouts/:id/sections
export async function addSection(req, res, next) {
  try {
    const layoutId = Number(req.params.id)
    const data     = sectionSchema.parse(req.body)

    const last = await prisma.reportSection.findFirst({
      where: { layoutId }, orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = (last?.sortOrder ?? -1) + 1

    const section = await prisma.reportSection.create({
      data: { ...data, layoutId, sortOrder },
      include: { items: true },
    })
    res.status(201).json(section)
  } catch (err) { next(err) }
}

// PUT /api/report-layouts/:id/sections/:sid
export async function updateSection(req, res, next) {
  try {
    const sid  = Number(req.params.sid)
    const data = sectionSchema.parse(req.body)
    const section = await prisma.reportSection.update({
      where: { id: sid },
      data,
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    })
    res.json(section)
  } catch (err) { next(err) }
}

// DELETE /api/report-layouts/:id/sections/:sid
export async function deleteSection(req, res, next) {
  try {
    const sid = Number(req.params.sid)
    await prisma.reportSection.delete({ where: { id: sid } })
    res.json({ message: 'Section dipadam' })
  } catch (err) { next(err) }
}

// PUT /api/report-layouts/:id/sections/reorder  — save sections sortOrder
export async function reorderSections(req, res, next) {
  try {
    const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body)
    await prisma.$transaction(
      ids.map((sid, i) => prisma.reportSection.update({ where: { id: sid }, data: { sortOrder: i } }))
    )
    res.json({ message: 'Susunan bahagian dikemaskini' })
  } catch (err) { next(err) }
}

// ─── Section Items ────────────────────────────────────────────────────────────

const itemSchema = z.object({
  accNo:         z.string().min(1).max(20),
  label:         z.string().max(200).optional().nullable(),
  isGroupHeader: z.boolean().default(false),
})

// POST /api/report-layouts/:id/sections/:sid/items
export async function addItem(req, res, next) {
  try {
    const sectionId = Number(req.params.sid)
    const data      = itemSchema.parse(req.body)
    const last = await prisma.reportSectionItem.findFirst({
      where: { sectionId }, orderBy: { sortOrder: 'desc' },
    })
    const sortOrder = (last?.sortOrder ?? -1) + 1
    const item = await prisma.reportSectionItem.create({ data: { ...data, sectionId, sortOrder } })
    res.status(201).json(item)
  } catch (err) { next(err) }
}

// PUT /api/report-layouts/:id/sections/:sid/items/:iid
export async function updateItem(req, res, next) {
  try {
    const iid  = Number(req.params.iid)
    const data = itemSchema.parse(req.body)
    const item = await prisma.reportSectionItem.update({ where: { id: iid }, data })
    res.json(item)
  } catch (err) { next(err) }
}

// DELETE /api/report-layouts/:id/sections/:sid/items/:iid
export async function deleteItem(req, res, next) {
  try {
    const iid = Number(req.params.iid)
    await prisma.reportSectionItem.delete({ where: { id: iid } })
    res.json({ message: 'Item dipadam' })
  } catch (err) { next(err) }
}

// PUT /api/report-layouts/:id/sections/:sid/items/reorder
export async function reorderItems(req, res, next) {
  try {
    const { ids } = z.object({ ids: z.array(z.number()) }).parse(req.body)
    await prisma.$transaction(
      ids.map((iid, i) => prisma.reportSectionItem.update({ where: { id: iid }, data: { sortOrder: i } }))
    )
    res.json({ message: 'Susunan item dikemaskini' })
  } catch (err) { next(err) }
}

// PUT /api/report-layouts/:id/sections/:sid/items/bulk  — replace all items for a section
export async function bulkSaveItems(req, res, next) {
  try {
    const sectionId = Number(req.params.sid)
    const { items } = z.object({
      items: z.array(itemSchema.extend({ sortOrder: z.number().optional() })),
    }).parse(req.body)

    await prisma.$transaction([
      prisma.reportSectionItem.deleteMany({ where: { sectionId } }),
      ...items.map((item, i) =>
        prisma.reportSectionItem.create({ data: { ...item, sectionId, sortOrder: i } })
      ),
    ])

    const saved = await prisma.reportSectionItem.findMany({
      where: { sectionId }, orderBy: { sortOrder: 'asc' },
    })
    res.json(saved)
  } catch (err) { next(err) }
}
