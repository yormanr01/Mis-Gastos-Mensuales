# mis_gastos_supabase

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Flutter learning resources](https://docs.flutter.dev/reference/learning-resources)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Supabase Functions

This project includes Supabase edge functions used for administrative tasks:

- `admin-delete-user`
- `admin-change-password`

These functions run with the Supabase service role key and must be configured as follows in the Supabase dashboard:

1. Set `SERVICE_ROLE_KEY` in the function environment variables.
2. Disable `Verify JWT with legacy secret` for both functions.
3. Keep the client request body payload as:

```dart
await supabase.functions.invoke(
  'admin-delete-user',
  body: {'userId': userId},
);
```

```dart
await supabase.functions.invoke(
  'admin-change-password',
  body: {'userId': userId, 'newPassword': newPassword},
);
```

These functions use the service role key internally and do not need a legacy JWT from the browser client.
