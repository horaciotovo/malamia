# Role-Based Access Control Setup Guide

## Overview
The Malamia application implements a two-role access control system:
- **CUSTOMER**: Regular users who can browse products, place orders, and earn loyalty points
- **ADMIN**: Privileged users who can manage products, categories, send notifications, and manage other admin users

## Architecture

### Database
- Users have a `role` field in the `User` model (enum: CUSTOMER, ADMIN)
- Both roles are created during the standard signup flow as CUSTOMER
- Admins are promoted through the Admin Management interface

### Backend Middleware
- `requireAuth`: Validates JWT token and attaches user to request
- `requireAdmin`: Validates JWT token AND checks that user role is ADMIN
- All `/api/admin/*` routes are protected with `requireAdmin`

### JWT Token
Access tokens include the user's role:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "CUSTOMER" | "ADMIN"
}
```

## Initial Setup

### 1. Create Initial Admin User
Since both users signup as CUSTOMER, you need to manually promote the first admin in the database:

```sql
-- Connect to your PostgreSQL database
UPDATE "users" SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com' LIMIT 1;
```

Or using Prisma CLI:
```bash
cd backend
npx prisma shell
# Then in the shell:
db.users.updateOne({ email: "your-admin-email@example.com" }, { $set: { role: "ADMIN" } })
```

### 2. Login to Backoffice
- Navigate to `http://localhost:5173/login` (backoffice)
- Use the email and password of your newly promoted admin user
- The `/api/auth/admin/login` endpoint checks that role === 'ADMIN'

## Admin Features

### ✅ Available Admin Capabilities

#### Dashboard
- View KPIs: Total products, published products, customers, orders, revenue
- See recent orders
- Quick access to management tools

#### Products Management
- ✨ Create new products with images (up to 8 per product)
- ✏️ Edit existing products
- 🏷️ Set/update prices (triggers PRICE_CHANGE notification)
- 🎁 Mark products as featured
- 📤 Publish/unpublish products (triggers NEW_PRODUCT notification)
- 🗑️ Delete products
- Organize by categories

#### Category Management
- ➕ Create new categories with slug
- 🗑️ Delete categories
- Organize product categories

#### Notifications (4 Types)
- **✨ NEW_PRODUCT**: When a new product is published
- **🏷️ PRICE_CHANGE**: When product price changes
- **🎁 PROMOTION**: Manual promotional messages
- **📦 ORDER_UPDATE**: Order status updates

Admins can send notifications to:
- All customers
- Specific selected users

#### User Management
- 👥 View all users (customers + admins)
- 🔐 Promote customers to admin
- 👤 Demote admins back to customer
- 🔴 Disable/enable user accounts
- 🔍 Search users by name or email

#### Loyalty Leaderboard
- 🏆 View customer loyalty standings
- 📊 Track loyalty points

### ❌ Customer Restrictions
Customers CANNOT:
- Access `/api/admin/*` endpoints (returns 403 Forbidden)
- View admin panel at all
- Create/edit products
- Send notifications
- Manage categories
- Manage users

## API Endpoints

### Public Endpoints (No Auth Required)
```
GET  /api/products              — List published products
GET  /api/products/:id          — Get product details
GET  /api/products/categories   — List categories
```

### Customer Endpoints (Requires Auth + CUSTOMER role)
```
POST   /api/auth/register       — Sign up (creates as CUSTOMER)
POST   /api/auth/login          — Login
POST   /api/auth/refresh        — Refresh token
GET    /api/auth/me             — Get current user
GET    /api/cart                — Get cart
POST   /api/cart/items          — Add to cart
GET    /api/notifications/my    — Get notifications
POST   /api/notifications/push-token  — Register push token
GET    /api/loyalty/leaderboard — View loyalty standings
POST   /api/orders              — Create order
GET    /api/orders/:id          — Get order details
```

### Admin Endpoints (Requires Auth + ADMIN role)
```
GET    /api/admin/dashboard              — Dashboard stats
GET    /api/admin/products               — List all products (admin view)
POST   /api/admin/products               — Create product
PUT    /api/admin/products/:id           — Update product
DELETE /api/admin/products/:id           — Delete product
PATCH  /api/admin/products/:id/publish   — Toggle publish status

GET    /api/admin/categories             — List categories
POST   /api/admin/categories             — Create category
DELETE /api/admin/categories/:id         — Delete category

GET    /api/admin/users                  — List customers only
GET    /api/admin/all-users              — List all users (customers + admins)
PATCH  /api/admin/users/:id/role         — Change user role
PATCH  /api/admin/users/:id/toggle       — Toggle user active status

GET    /api/admin/notifications          — List sent notifications
POST   /api/admin/notifications/send     — Send push notification
```

### Authentication Endpoints
```
POST /api/auth/admin/login — Admin-specific login (checks role === ADMIN)
```

## Backoffice UI Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/login` | Login | Admin authentication |
| `/dashboard` | Dashboard | Overview & KPIs |
| `/products` | ProductList | Product management |
| `/products/new` | ProductForm | Create new product |
| `/products/:id/edit` | ProductForm | Edit product |
| `/customers` | CustomerList | View customers |
| `/admin/users` | AdminManagement | Manage admins & users |
| `/notifications` | NotificationCenter | Send notifications |
| `/loyalty` | Leaderboard | View loyalty standings |

## Mobile App Protection (Optional)

To prevent customers from seeing admin features in the mobile app, check the user's role:

```typescript
import { useAuthStore } from '../store/authStore';

export default function SettingsScreen() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  return (
    <View>
      {/* Always visible */}
      <Text>Profile Settings</Text>
      
      {/* Only for admins */}
      {isAdmin && (
        <>
          <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
            <Text>👑 Admin Panel</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
```

## Workflow Example

### Promoting a Customer to Admin
1. New customer signs up via mobile app (created as CUSTOMER)
2. Admin logs into backoffice at `/login`
3. Go to "Admin Users" page
4. Search for the customer
5. Click "Make Admin" button
6. Customer role changes to ADMIN in database
7. Customer can now login at `/api/auth/admin/login` and access backoffice

### Publishing a Product
1. Admin logs into backoffice
2. Click "Products" in sidebar
3. Click "Add Product"
4. Fill in details: name, description, price, images, category, etc.
5. Check "Publish" checkbox
6. Click "Create"
7. Automatic push notification sent: "✨ New Arrival! [Product Name] is now available."
8. All customers receive the notification

### Sending a Custom Notification
1. Admin clicks "Notifications" in sidebar
2. Click "Send Notification" button
3. Select type: PROMOTION (for custom messages)
4. Add title and body
5. Choose target: "All Customers" or select specific users
6. Click "Send"
7. Push notification delivered to devices with registered push tokens

## Security Considerations

✅ **Implemented:**
- JWT tokens include role (cannot be spoofed without private key)
- All admin routes check `requireAdmin` middleware
- Passwords hashed with bcrypt
- Admin login requires role === ADMIN
- Push tokens tied to user accounts

🔒 **Best Practices:**
- Never store admin tokens in insecure storage
- Rotate JWT secret regularly
- Audit logs (optional: log admin actions)
- Use HTTPS only in production
- Keep database credentials in `.env`

## Troubleshooting

### "Admin access required" on admin routes
- Check that user role in database is 'ADMIN'
- Verify JWT token contains `"role": "ADMIN"`
- Check Authorization header format: `Bearer <token>`
- Try logging out and back in

### Cannot login to backoffice
- Verify user role is 'ADMIN' in database
- Check password matches (bcrypt comparison)
- Ensure backend is running on port 3001
- Check browser console for error details

### Push notifications not received
- Verify user has registered push token
- Check push token is valid in user.pushToken field
- Verify Expo Push Service is accessible
- Check notification type is valid: NEW_PRODUCT, PRICE_CHANGE, PROMOTION, ORDER_UPDATE

## Next Steps

1. ✅ Create your first admin user in database
2. ✅ Login to backoffice
3. ✅ Add product categories
4. ✅ Add products with images
5. ✅ Test notifications
6. ✅ Promote team members to admin as needed
7. ✅ Monitor customer orders and loyalty

---

**Questions?** Check the type definitions in `backend/prisma/schema.prisma` and `backoffice/src/types/index.ts`
