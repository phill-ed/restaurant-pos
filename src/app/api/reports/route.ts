import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'daily';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let start: Date;
    let end: Date = new Date();

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      if (period === 'daily') {
        start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      } else if (period === 'weekly') {
        start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else {
        start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
    }

    const startDateStr = start.toISOString();
    const endDateStr = end.toISOString();

    // Get paid orders in date range
    const orders = db.prepare(`
      SELECT * FROM orders 
      WHERE status = 'paid' 
      AND paid_at >= ? 
      AND paid_at <= ?
    `).all(startDateStr, endDateStr);

    // Calculate metrics
    const totalSales = orders.reduce((sum: number, order: any) => sum + order.total, 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const totalTax = orders.reduce((sum: number, order: any) => sum + order.tax, 0);
    const totalTips = orders.reduce((sum: number, order: any) => sum + order.tip, 0);

    // Payment method breakdown
    const paymentMethods: Record<string, number> = {};
    orders.forEach((order: any) => {
      const method = order.payment_method || 'unknown';
      paymentMethods[method] = (paymentMethods[method] || 0) + order.total;
    });

    const paymentMethodData = Object.entries(paymentMethods).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: Math.round(value * 100) / 100
    }));

    // Get daily/period sales data
    const dailySales: Record<string, { sales: number; orders: number }> = {};
    orders.forEach((order: any) => {
      const date = new Date(order.paid_at);
      let key: string;

      if (period === 'hourly') {
        key = date.toLocaleTimeString('en-US', { hour: '2-digit' });
      } else if (period === 'weekly') {
        key = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!dailySales[key]) {
        dailySales[key] = { sales: 0, orders: 0 };
      }
      dailySales[key].sales += order.total;
      dailySales[key].orders += 1;
    });

    const salesData = Object.entries(dailySales).map(([name, data]) => ({
      name,
      sales: Math.round(data.sales * 100) / 100,
      orders: data.orders
    }));

    // Top selling items
    const itemSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    orders.forEach((order: any) => {
      const orderItems = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
      orderItems.forEach((item: any) => {
        const menuItem = db.prepare('SELECT name FROM menu_items WHERE id = ?').get(item.menu_item_id) as any;
        const itemName = menuItem?.name || 'Unknown Item';
        
        if (!itemSales[itemName]) {
          itemSales[itemName] = { name: itemName, quantity: 0, revenue: 0 };
        }
        itemSales[itemName].quantity += item.quantity;
        itemSales[itemName].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.values(itemSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(item => ({
        ...item,
        revenue: Math.round(item.revenue * 100) / 100
      }));

    // Hourly distribution
    const hourlyData: Record<number, number> = {};
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = 0;
    }
    orders.forEach((order: any) => {
      const hour = new Date(order.paid_at).getHours();
      hourlyData[hour] = (hourlyData[hour] || 0) + order.total;
    });

    const hourlyDistribution = Object.entries(hourlyData).map(([hour, sales]) => ({
      hour: `${hour}:00`,
      sales: Math.round((sales as number) * 100) / 100
    }));

    return NextResponse.json({
      period: { start: startDateStr, end: endDateStr },
      summary: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalOrders,
        avgOrderValue: Math.round(avgOrderValue * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalTips: Math.round(totalTips * 100) / 100
      },
      salesData,
      topItems,
      paymentMethods: paymentMethodData,
      hourlyDistribution
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}
