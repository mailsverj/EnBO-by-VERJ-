---
name: Customer visibility policy
description: Role-based rules for customer identity and contact data across the platform.
---

Customer contact details and names are visible to the owning BDO, Sales/Sales Admin, and Chief/Super Admin. Technical roles receive customer IDs only; other unlisted roles receive an ID-only projection or are denied where a safe projection is impossible (such as commission records without a customer ID).

**Why:** Customer contact data is a business relationship asset; engineering teams need a stable project identifier without personal or commercial customer details.

**How to apply:** Enforce this on every API response and mutation authorization, not only in the frontend. Preserve BDO ownership scoping; project customer names to their linked customer ID for unapproved viewers; do not return customer notes or contact fields; and deny customer-document downloads without contact-detail access.