import type { SafeUser } from "@workspace/db/schema";

const BUSINESS_CUSTOMER_ROLES = [
  "Chief Admin",
  "Super Admin",
  "Sales",
  "Sales Admin",
];

const TECHNICAL_ROLES = [
  "Technical Officer",
  "Lead Technical Officer",
  "Engineer",
];

type CustomerAccessUser = Pick<SafeUser, "roles" | "vbdoId">;
type CustomerOwnedRecord = { sourceBdoId: string | null };
type CustomerIdentifier = { cidRef: string };
type CustomerNamedRecord = CustomerOwnedRecord & { customerId: string | null; customerName: string | null };

export function hasBusinessCustomerAccess(user: CustomerAccessUser) {
  return user.roles.some(role => BUSINESS_CUSTOMER_ROLES.includes(role));
}

export function isBdoScopedCustomerUser(user: CustomerAccessUser) {
  return user.roles.includes("BDO") && !hasBusinessCustomerAccess(user);
}

export function canViewCustomerContacts(user: CustomerAccessUser, customer: CustomerOwnedRecord) {
  return hasBusinessCustomerAccess(user)
    || (user.roles.includes("BDO") && Boolean(user.vbdoId) && customer.sourceBdoId === user.vbdoId);
}

export function customerNameForViewer(user: CustomerAccessUser, record: CustomerNamedRecord) {
  return canViewCustomerContacts(user, record) ? record.customerName : record.customerId;
}

export function isTechnicalCustomerViewer(user: CustomerAccessUser) {
  return user.roles.some(role => TECHNICAL_ROLES.includes(role))
    && !hasBusinessCustomerAccess(user)
    && !user.roles.includes("BDO");
}

export function customerIdOnly(customer: CustomerIdentifier) {
  return { cidRef: customer.cidRef, restricted: true as const };
}