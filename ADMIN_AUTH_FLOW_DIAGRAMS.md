# Admin Auth Flow - Visual Guide

## Overview

This document provides a visual representation of the authentication and authorization flow for the admin blog editor.

## User Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER VISITS /admin/blog                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │  Check if logged   │
                  │  in (Supabase)     │
                  └────────┬───────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
         NOT LOGGED IN              LOGGED IN
              │                         │
              ▼                         ▼
     ┌────────────────┐        ┌────────────────────┐
     │  Show Login    │        │  setIsCheckingAuth │
     │  Form          │        │     = true         │
     └────────────────┘        └────────┬───────────┘
                                        │
                                        ▼
                               ┌────────────────────┐
                               │  Show Loading      │
                               │  Spinner           │
                               └────────┬───────────┘
                                        │
                                        ▼
                           ┌────────────────────────────┐
                           │ Call getCurrentUserProfile()│
                           └────────┬───────────────────┘
                                    │
                       ┌────────────┴────────────┐
                       │                         │
                  PROFILE FOUND            NO PROFILE FOUND
                       │                         │
                       ▼                         ▼
              ┌────────────────┐        ┌────────────────┐
              │ Check role:    │        │ Show Error:    │
              │ editor/admin?  │        │ "No profile    │
              └────────┬───────┘        │  found"        │
                       │                └────────────────┘
          ┌────────────┴────────────┐
          │                         │
    role = 'admin'          role = 'user'
    or 'editor'                    │
          │                         │
          ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ GRANT ACCESS    │       │ DENY ACCESS     │
│ Show Editor UI  │       │ Show Error +    │
│                 │       │ Troubleshooting │
└─────────────────┘       └─────────────────┘
```

## New User Signup Flow

```
┌──────────────────────────────────────────────────────┐
│         USER SIGNS UP (Supabase Auth)                │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
                ┌────────────────────┐
                │  INSERT INTO       │
                │  auth.users        │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │  TRIGGER FIRES:    │
                │  on_auth_user_     │
                │  created           │
                └────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────────┐
              │ FUNCTION EXECUTES:       │
              │ handle_new_user()        │
              │ (SECURITY DEFINER)       │
              └────────┬─────────────────┘
                       │
                       ▼
              ┌─────────────────────────┐
              │ INSERT INTO profiles    │
              │ (id, email, role)       │
              │ VALUES                  │
              │ (user.id, user.email,   │
              │  'user')                │
              └────────┬────────────────┘
                       │
                       ▼
              ┌─────────────────────────┐
              │ Profile Created         │
              │ role = 'user'           │
              │                         │
              │ User can now login but  │
              │ cannot access admin     │
              └─────────────────────────┘
```

## Admin Promotion Flow

```
┌──────────────────────────────────────────────────────┐
│         ADMIN RUNS SQL COMMAND                       │
│  UPDATE profiles SET role = 'admin'                  │
│  WHERE email = 'user@example.com'                    │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
                ┌────────────────────┐
                │  Check RLS Policy: │
                │  "Admins can       │
                │   update profiles" │
                └────────┬───────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
      CALLER IS ADMIN           CALLER NOT ADMIN
            │                         │
            ▼                         ▼
   ┌────────────────┐        ┌────────────────┐
   │ UPDATE allowed │        │ UPDATE denied  │
   │ Set role to    │        │ Permission err │
   │ 'admin'        │        └────────────────┘
   └────────┬───────┘
            │
            ▼
   ┌─────────────────┐
   │ User promoted   │
   │ Next login:     │
   │ Can access      │
   │ /admin/blog     │
   └─────────────────┘
```

## Permission Check Flow (RLS)

```
┌──────────────────────────────────────────────────────┐
│    USER TRIES TO SELECT FROM posts TABLE             │
└────────────────────────┬─────────────────────────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ RLS CHECK:         │
                │ Which policies     │
                │ apply?             │
                └────────┬───────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌────────────────┐ ┌──────────────┐ ┌──────────────┐
│ Public policy  │ │Editor policy │ │Admin policy  │
│ status=pub     │ │ (uses func)  │ │(uses func)   │
└────────┬───────┘ └──────┬───────┘ └──────┬───────┘
         │                │                │
         │                ▼                │
         │       ┌────────────────┐        │
         │       │ CALL FUNCTION: │        │
         │       │ is_editor_or_  │        │
         │       │ admin()        │        │
         │       └────────┬───────┘        │
         │                │                │
         │                ▼                │
         │       ┌────────────────────┐    │
         │       │ Check profiles     │    │
         │       │ table for role     │    │
         │       │ (SECURITY DEFINER  │    │
         │       │  bypasses RLS)     │    │
         │       └────────┬───────────┘    │
         │                │                │
         │      ┌─────────┴─────────┐      │
         │      │                   │      │
         │   role IN              role NOT IN
         │   ('editor','admin')   ('editor','admin')
         │      │                   │      │
         └──────┴───────┬───────────┴──────┘
                        │
           ┌────────────┴────────────┐
           │                         │
      ANY POLICY                NO POLICY
      RETURNS TRUE              RETURNS TRUE
           │                         │
           ▼                         ▼
   ┌───────────────┐         ┌──────────────┐
   │ GRANT ACCESS  │         │ DENY ACCESS  │
   │ Return rows   │         │ Return empty │
   └───────────────┘         └──────────────┘
```

## Frontend State Machine

```
┌─────────────────────────────────────────────────────┐
│                  INITIAL STATE                      │
│  sessionEmail = null                                │
│  isEditor = false                                   │
│  isCheckingAuth = true                              │
│  authError = null                                   │
└─────────────────────┬───────────────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │  useEffect()  │
              │  runs         │
              └───────┬───────┘
                      │
                      ▼
         ┌────────────────────────┐
         │  getSession()          │
         └────────┬───────────────┘
                  │
     ┌────────────┴────────────┐
     │                         │
 NO SESSION              HAS SESSION
     │                         │
     ▼                         ▼
┌─────────────┐       ┌───────────────────┐
│sessionEmail │       │sessionEmail = ... │
│    = null   │       │isCheckingAuth=true│
│isChecking   │       └────────┬──────────┘
│Auth=false   │                │
└─────────────┘                ▼
                    ┌──────────────────────┐
                    │getCurrentUserProfile()│
                    └────────┬─────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
           PROFILE FOUND             NO PROFILE
                │                         │
                ▼                         ▼
    ┌───────────────────┐      ┌────────────────┐
    │Check role         │      │authError =     │
    │editor or admin?   │      │"No profile..." │
    └────────┬──────────┘      │isEditor=false  │
             │                 │isChecking=false│
   ┌─────────┴─────────┐       └────────────────┘
   │                   │
role='editor'      role='user'
or 'admin'
   │                   │
   ▼                   ▼
┌──────────┐    ┌─────────────┐
│isEditor  │    │isEditor=false│
│  =true   │    │authError=... │
│isChecking│    │isChecking=   │
│  =false  │    │  false       │
└────┬─────┘    └─────┬────────┘
     │                │
     ▼                ▼
┌──────────┐    ┌──────────────┐
│ RENDER   │    │ RENDER       │
│ EDITOR   │    │ ACCESS DENIED│
│   UI     │    │   MESSAGE    │
└──────────┘    └──────────────┘
```

## Error Handling Flow

```
┌────────────────────────────────────────────┐
│         ANY ERROR OCCURS                   │
└──────────────────┬─────────────────────────┘
                   │
                   ▼
          ┌────────────────┐
          │  try/catch     │
          │  block catches │
          └────────┬───────┘
                   │
                   ▼
          ┌────────────────────┐
          │  console.error()   │
          │  with context      │
          └────────┬───────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  setAuthError()    │
          │  with message      │
          └────────┬───────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  setIsCheckingAuth │
          │  (false)           │
          └────────┬───────────┘
                   │
                   ▼
          ┌────────────────────┐
          │  Render error UI   │
          │  with:             │
          │  - Error message   │
          │  - Troubleshooting │
          │  - Sign out button │
          └────────────────────┘
```

## RLS Policy Evaluation Order

```
1. Service Role Policy
   ├─ Checks: current_setting('request.jwt.claim.role') = 'service_role'
   └─ Used by: Triggers and background processes

2. Users Can Read Own Profile
   ├─ Checks: auth.uid() = id
   └─ Used by: Authenticated users querying their own profile

3. Admins Can Read All Profiles
   ├─ Checks: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
   └─ Used by: Admins viewing other users' profiles
   └─ Note: Relies on policy #2 to read admin's own profile first

4. Admins Can Update Profiles
   ├─ Checks: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
   └─ Used by: Admins promoting/demoting users

5. Admins Can Insert Profiles
   ├─ Checks: EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
   └─ Used by: Admins manually creating profiles
```

## Security Definer Function Flow

```
┌─────────────────────────────────────────────────┐
│  Post policy needs to check if user is editor   │
└──────────────────────┬──────────────────────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  Call function:    │
              │  is_editor_or_     │
              │  admin()           │
              └────────┬───────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  Function executes │
              │  with SECURITY     │
              │  DEFINER           │
              └────────┬───────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  RLS is BYPASSED   │
              │  for this query    │
              │  (function owner's │
              │   privileges)      │
              └────────┬───────────┘
                       │
                       ▼
              ┌────────────────────┐
              │  SELECT from       │
              │  profiles WHERE    │
              │  id = auth.uid()   │
              │  AND role IN (...)  │
              └────────┬───────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
      MATCH FOUND             NO MATCH
           │                       │
           ▼                       ▼
    ┌──────────┐           ┌──────────┐
    │ Return   │           │ Return   │
    │ TRUE     │           │ FALSE    │
    └──────────┘           └──────────┘
```

## Key Concepts Illustrated

### 1. No Infinite Recursion
The security definer functions bypass RLS, so:
- Post policy calls `is_editor_or_admin()`
- Function queries profiles table WITHOUT triggering profiles RLS
- No recursion possible

### 2. Layered Security
- **Layer 1**: Authentication (Supabase Auth)
- **Layer 2**: Profile existence (automatic trigger)
- **Layer 3**: Role check (RLS policies)
- **Layer 4**: Frontend validation (UI)

### 3. Fail Safe Defaults
- No profile? → Denied
- Error fetching profile? → Denied
- Unknown role? → Denied
- RLS policy failure? → Denied

### 4. Clear User Feedback
Each state has distinct UI:
- Not logged in → Login form
- Checking → Loading spinner
- Access denied → Error with troubleshooting
- Access granted → Editor interface

## Timeline: User Journey

```
Time 0s    │ User visits /admin/blog
           │
Time 0.1s  │ Component mounts
           │ useEffect() runs
           │ Shows loading spinner
           │
Time 0.3s  │ getSession() returns
           │ User is authenticated
           │
Time 0.4s  │ getCurrentUserProfile() called
           │ Query hits profiles table
           │ RLS policy checks user can read own profile
           │
Time 0.5s  │ Profile found
           │ role = 'admin' extracted
           │
Time 0.6s  │ isCurrentUserEditor() returns true
           │ isEditor state set to true
           │ isCheckingAuth set to false
           │
Time 0.7s  │ Re-render triggered
           │ Loading spinner removed
           │ Editor UI displayed
           │
Total: ~700ms from page load to editor display
```

## Summary

This visual guide demonstrates:
- ✅ Clear authentication flow
- ✅ Automatic profile creation
- ✅ Non-recursive permission checks
- ✅ Layered security
- ✅ Graceful error handling
- ✅ User-friendly feedback
- ✅ Fast performance (<1s)

The system is designed to be:
- **Secure**: Multiple layers, fail-safe defaults
- **Reliable**: No recursion, comprehensive error handling
- **User-Friendly**: Clear states, helpful messages
- **Debuggable**: Extensive logging at each step
