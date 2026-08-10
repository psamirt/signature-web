'use server';

import { cancelOrder, getOrders, shipOrder, type Order, type ShipOrderInput } from '@/lib/api';
import { run, type ActionResult } from '@/lib/action-result';

export async function getOrdersAction(): Promise<Order[]> {
  return getOrders();
}

export async function shipOrderAction(
  id: string,
  data: ShipOrderInput,
): Promise<ActionResult> {
  return run(() => shipOrder(id, data));
}

export async function cancelOrderAction(id: string): Promise<ActionResult> {
  return run(() => cancelOrder(id));
}
