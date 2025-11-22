import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's orders to generate payment records
    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        template: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate payment records from orders
    const payments = []

    for (const order of orders) {
      // Initial payment for the order
      if (order.status !== 'PENDING' && order.total > 0) {
        payments.push({
          id: `PAY-${order.id}-1`,
          orderId: order.id,
          userId: session.user.id,
          amount: order.total,
          currency: 'EUR',
          status: order.status === 'CANCELLED' ? 'cancelled' : 'completed',
          method: 'card',
          stripePaymentId: order.stripeSessionId,
          description: `Desarrollo web completo - ${order.template?.name || 'Plan personalizado'}`,
          paidAt: order.status !== 'CANCELLED' ? order.createdAt : null,
          invoice: order.status !== 'CANCELLED' ? {
            id: `INV-${order.id}-1`,
            number: `FAC-2024-${order.id.slice(-3)}`,
            paymentId: `PAY-${order.id}-1`,
            amount: order.total,
            tax: order.total * 0.21,
            subtotal: order.total * 0.79,
            currency: 'EUR',
            status: 'paid',
            issuedAt: order.createdAt,
            dueAt: new Date(order.createdAt.getTime() + 15 * 24 * 60 * 60 * 1000),
            paidAt: order.createdAt,
            items: [
              {
                id: '1',
                description: 'Desarrollo web personalizado',
                quantity: 1,
                unitPrice: order.total * 0.79,
                total: order.total * 0.79,
                category: 'development'
              }
            ],
            downloadUrl: `/api/invoices/${order.id}-1.pdf`
          } : null
        })
      }

      // Monthly hosting payments for completed orders
      if (order.status === 'COMPLETED' && order.setupCompleted) {
        const monthsSinceCompletion = Math.floor(
          (Date.now() - order.completedAt!.getTime()) / (30 * 24 * 60 * 60 * 1000)
        )

        for (let i = 0; i < Math.min(monthsSinceCompletion, 3); i++) {
          const paymentDate = new Date(order.completedAt!)
          paymentDate.setMonth(paymentDate.getMonth() + i + 1)

          payments.push({
            id: `PAY-${order.id}-hosting-${i + 1}`,
            orderId: order.id,
            userId: session.user.id,
            amount: 49,
            currency: 'EUR',
            status: 'completed',
            method: 'card',
            description: 'Hosting y mantenimiento mensual',
            paidAt: paymentDate,
            invoice: {
              id: `INV-${order.id}-hosting-${i + 1}`,
              number: `FAC-2024-H${order.id.slice(-3)}-${i + 1}`,
              paymentId: `PAY-${order.id}-hosting-${i + 1}`,
              amount: 49,
              tax: 8.17,
              subtotal: 40.83,
              currency: 'EUR',
              status: 'paid',
              issuedAt: paymentDate,
              dueAt: new Date(paymentDate.getTime() + 5 * 24 * 60 * 60 * 1000),
              paidAt: paymentDate,
              items: [
                {
                  id: '1',
                  description: 'Hosting Premium + SSL',
                  quantity: 1,
                  unitPrice: 25,
                  total: 25,
                  category: 'hosting'
                },
                {
                  id: '2',
                  description: 'Mantenimiento técnico',
                  quantity: 1,
                  unitPrice: 15.83,
                  total: 15.83,
                  category: 'maintenance'
                }
              ],
              downloadUrl: `/api/invoices/${order.id}-hosting-${i + 1}.pdf`
            }
          })
        }

        // Add pending payment for next month
        const nextPaymentDate = new Date()
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
        nextPaymentDate.setDate(1)

        payments.push({
          id: `PAY-${order.id}-next`,
          orderId: order.id,
          userId: session.user.id,
          amount: 49,
          currency: 'EUR',
          status: 'pending',
          method: 'card',
          description: 'Hosting y mantenimiento mensual - Próximo pago',
          paidAt: null,
          invoice: {
            id: `INV-${order.id}-next`,
            number: `FAC-2024-NEXT-${order.id.slice(-3)}`,
            paymentId: `PAY-${order.id}-next`,
            amount: 49,
            tax: 8.17,
            subtotal: 40.83,
            currency: 'EUR',
            status: 'sent',
            issuedAt: new Date(),
            dueAt: nextPaymentDate,
            paidAt: null,
            items: [
              {
                id: '1',
                description: 'Hosting Premium + SSL',
                quantity: 1,
                unitPrice: 25,
                total: 25,
                category: 'hosting'
              },
              {
                id: '2',
                description: 'Mantenimiento técnico',
                quantity: 1,
                unitPrice: 15.83,
                total: 15.83,
                category: 'maintenance'
              }
            ],
            downloadUrl: null
          }
        })
      }
    }

    // Sort payments by date
    payments.sort((a, b) => {
      const dateA = a.paidAt || new Date()
      const dateB = b.paidAt || new Date()
      return dateB.getTime() - dateA.getTime()
    })

    return NextResponse.json(payments)
  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Error fetching payments' },
      { status: 500 }
    )
  }
}