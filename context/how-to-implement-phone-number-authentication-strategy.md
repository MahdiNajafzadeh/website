Certainly. Here’s a clear, step‑by‑step guide to implementing phone‑based authentication in Payload CMS, using your specified schema and the `payload-phone-number-plugin`.

---

## 1. Install the plugin

```bash
pnpm add payload-phone-number-plugin
# or npm/yarn
```

## 2. Configure the plugin globally

In your `payload.config.ts`, register the plugin and restrict phone numbers to Iran:

```ts
import { buildConfig } from 'payload/config';
import { phoneNumberPlugin } from 'payload-phone-number-plugin';

export default buildConfig({
  // ...
  plugins: [
    phoneNumberPlugin({
      allowedCountries: ['IR'],   // only Iranian numbers
      defaultCountry: 'IR',
    }),
  ],
});
```

---

## 3. Define the Users collection

Create `collections/Users.ts` with your schema.  
**Important:** Disable the default email‑based login and use `phoneNumber` as the login identifier.

```ts
import { CollectionConfig } from 'payload/types';
import { phoneNumberField } from 'payload-phone-number-plugin';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    disableLocalStrategy: true,   // no default email/password login
  },
  fields: [
    phoneNumberField({
      name: 'phoneNumber',
      label: 'Phone Number',
      required: true,
      unique: true,                // acts as primary key
      allowedCountries: ['IR'],    // field‑level restriction
      defaultValue: 'IR',
      admin: {
        cellDisplayFormat: 'international', // shows +98 912 345 6789
      },
    }),
    {
      name: 'password',
      type: 'password',
      required: true,
      admin: { hidden: true },
    },
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'address',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Customer', value: 'customer' },
      ],
    },
    {
      name: 'customerType',
      type: 'select',
      options: [
        { label: 'Partner', value: 'partner' },
        { label: 'Regular', value: 'regular' },
      ],
      admin: {
        condition: (data, siblingData) => siblingData?.role === 'customer',
      },
    },
  ],
};
```

> The plugin automatically stores the phone number in **E.164 format** (`+989123456789`), which is recommended.

---

## 4. Implement the login logic

Because we disabled the default local strategy, we must provide our own login endpoint.

### Option A: Custom API endpoint (simpler)

Add an endpoint to your `Users` collection:

```ts
// collections/Users.ts
import { loginWithPhone } from '../endpoints/login'; // we'll create this

export const Users: CollectionConfig = {
  // ...
  endpoints: [loginWithPhone],
};
```

Then create `endpoints/login.ts`:

```ts
import { Endpoint } from 'payload/config';

export const loginWithPhone: Endpoint = {
  path: '/login-with-phone',
  method: 'post',
  handler: async (req, res) => {
    const { phoneNumber, password } = req.body;

    // 1. Find user by phoneNumber
    const result = await req.payload.find({
      collection: 'users',
      where: { phoneNumber: { equals: phoneNumber } },
    });

    if (result.totalDocs === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.docs[0];

    // 2. Verify password (Payload hashes it with bcrypt)
    const isValid = await req.payload
      .collections['users']
      .config.auth?.verifyPassword?.(user, password);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // 3. Generate JWT
    const token = await req.payload.collections['users'].auth?.generateJWT?.({
      user,
      collection: req.payload.collections['users'].config,
    });

    // 4. Set cookie and return user + token
    res.cookie('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({ user, token });
  },
};
```

Now you can send a `POST` request to `/api/users/login-with-phone` with `{ phoneNumber, password }`.

### Option B: Use Passport.js (more standard)

If you prefer a full Passport integration, you can implement a custom local strategy that uses `phoneNumber` as the username field. This is more involved but gives you access to Payload’s built‑in session handling.

---

## 5. Generate TypeScript types

Run the type generator to get proper autocompletion:

```bash
bun run payload generate:types
```

---

## Summary

| Step | Action |
|------|--------|
| 1    | Install `payload-phone-number-plugin` |
| 2    | Register the plugin with `allowedCountries: ['IR']` |
| 3    | Define your `Users` collection with `auth.disableLocalStrategy = true`, use `phoneNumberField` and a `password` field |
| 4    | Provide a custom login endpoint (or Passport strategy) that verifies the phone number and password, then issues a JWT |
| 5    | Generate types |

Your users can now log in using their Iranian phone number + password, and the number is validated and stored in a consistent international format.

Let me know if you need further details on any part.
