# Flutter App Implementation Tracker

This file tracks the Flutter app implementation screen by screen. Update the status column as each task moves from pending to in progress to done.

Status keys:

- `[ ]` Pending
- `[~]` In progress
- `[x]` Done

## Implementation Goal

Build the native Flutter user panel using the existing MoneySplit backend APIs. Remove the standalone Expenses bottom-tab screen because expenses will be managed from group Activity and recent activity surfaces.

## Screen And API Plan

| Status | Area | API / Route | Implementation Notes |
| --- | --- | --- | --- |
| `[x]` | App navigation | Local Flutter routing | Remove `/expenses` from bottom navigation and keep `Home`, `Groups`, `Alerts`, `Profile`. |
| `[x]` | Shared expense components | `/api/expenses`, `/api/expenses/:expenseId` | Move reusable expense tile, details sheet, add/edit sheet, category labels, and category icons out of the standalone expenses screen. |
| `[x]` | Auth splash | `/api/auth/check` | Restore saved token, validate current user, redirect to login or home. |
| `[x]` | Login | `/api/auth/login`, `/api/auth/google-login`, `/api/auth/resend-verification`, `/api/auth/verify-email` | Email/password login, Google login, OTP verification-required panel, resend OTP. |
| `[x]` | Signup | `/api/auth/signup`, `/api/auth/google-login`, `/api/auth/resend-verification`, `/api/auth/verify-email` | Create account, handle OTP verification screen, Google signup/login. |
| `[ ]` | Home | `/api/groups`, `/api/expenses` | Show greeting, balance cards, overall balance, top groups, recent expenses. Change any `/expenses` navigation to group/activity navigation. |
| `[ ]` | Groups list | `/api/groups`, `/api/expenses` | Search groups and members, admin/member filters, group balance, group image, open group detail. |
| `[ ]` | Create group | `POST /api/groups`, `POST /api/uploads/image` | Create group with name, description, type, privacy, optional image. |
| `[ ]` | Group detail shell | `/api/groups/:groupId`, `/api/expenses?groupId=`, `/api/activity?groupId=` | Load group, expenses, and optional audit activity. Use tabs: `Activity`, `Members`, `Summary`. |
| `[ ]` | Group Activity | `/api/expenses?groupId=`, `/api/expenses/:expenseId` | Replace separate Expenses tab with a date-wise expense timeline. Open expense detail on tap. Edit/delete allowed only for payer. |
| `[ ]` | Add group expense | `POST /api/expenses` | Add expense from group detail FAB or Activity empty state. Fixed group when opened from group detail. |
| `[ ]` | Edit group expense | `PUT /api/expenses/:expenseId` | Edit description, amount, category, date, and split members where supported. |
| `[ ]` | Delete group expense | `DELETE /api/expenses/:expenseId` | Confirm destructive action, delete expense, refresh group totals and activity timeline. |
| `[ ]` | Group Summary | `/api/groups/:groupId`, `/api/expenses?groupId=` | Show description, total expenses, members count, group type, currency, invite link for admins, and balance summary. |
| `[ ]` | Group Members | `/api/groups/:groupId/members`, `/api/groups/:groupId`, `/api/users/search` | Add registered user by search, add custom member, remove member, enforce admin-only controls. |
| `[ ]` | Group settings | `PUT /api/groups/:groupId`, `POST /api/groups/:groupId/invite/regenerate`, `POST /api/uploads/image` | Edit group fields, upload image, regenerate invite link, delete group. |
| `[ ]` | Notifications | `/api/notifications` | Load notifications, filter all/read/unread, mark one read, mark all read, delete selected. |
| `[ ]` | Profile overview | `/api/users/profile` | Show avatar, name, username, email, group count, expense count. |
| `[ ]` | Edit profile | `PUT /api/users/profile`, `POST /api/uploads/image` | Update full name, username, contact, bio, avatar, and refresh auth user state. |
| `[ ]` | Change password | `PUT /api/users/change-password` | Validate current and new password inputs, submit, show errors. |
| `[ ]` | Delete account | `DELETE /api/users/account` | Require confirmation, optional password for local accounts, logout after deletion. |
| `[ ]` | Logout | `/api/auth/logout` | Call backend logout, clear secure token, sign out Google account, return to login. |

## Backend Fixes Required

| Status | API | Fix |
| --- | --- | --- |
| `[ ]` | `POST /api/expenses` | Add `createActivity()` for `expense_added` so new expenses appear consistently in activity/audit history. |
| `[ ]` | `GET /api/activity?groupId=` | Confirm whether Flutter needs audit rows in addition to the expense timeline. Keep expense timeline primary. |

## Suggested Implementation Process

1. `[x]` Remove standalone Expenses route and bottom navigation destination.
2. `[x]` Extract expense UI and logic into a shared reusable Flutter module.
3. `[ ]` Update Home so no UI navigates to `/expenses`.
4. `[ ]` Rework Group Detail tabs to `Activity`, `Members`, and `Summary`.
5. `[ ]` Build Activity timeline from group expenses, sorted date-wise.
6. `[ ]` Connect Activity expense detail, edit, delete, and refresh flows.
7. `[ ]` Add expense creation activity record in the backend.
8. `[ ]` Verify Groups list, Create group, Group settings, and Members flows.
9. `[ ]` Verify Notifications and Profile flows.
10. `[ ]` Run Flutter formatting, analyzer, and tests.

## Verification Checklist

| Status | Check |
| --- | --- |
| `[ ]` | `flutter pub get` succeeds inside `mobile`. |
| `[ ]` | `dart format lib test` succeeds inside `mobile`. |
| `[ ]` | `flutter analyze` succeeds inside `mobile`. |
| `[ ]` | `flutter test` succeeds inside `mobile`. |
| `[ ]` | Login and token restore work on a real API base URL. |
| `[ ]` | Bottom navigation has no Expenses tab. |
| `[ ]` | Home still shows recent expenses and balances. |
| `[ ]` | Group Activity shows expenses and supports add/edit/delete. |
| `[ ]` | Notifications read/delete actions update UI after API success. |
| `[ ]` | Profile edit, password change, logout, and delete account flows work. |

## Current Notes

- The current Flutter app already has core auth, home, groups, expenses, notifications, and profile screens.
- The standalone `ExpensesScreen` should be removed as a route, but its reusable components should remain available.
- The web panel already treats group Activity as the main expense timeline, so Flutter should follow the same product behavior.
- Keep implementation scoped to the native Flutter app and only touch backend routes where API behavior is missing.
