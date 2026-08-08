'use server';

import { cancelOrder, getOrders, shipOrder, type Order, type ShipOrderInput } from '@/lib/api';

export async function getOrdersAction(): Promise<Order[]> {
  return getOrders();
}

export async function shipOrderAction(id: string, data: ShipOrderInput): Promise<Order> {
  return shipOrder(id, data);
}

export async function cancelOrderAction(id: string): Promise<Order> {
  return cancelOrder(id);
}
