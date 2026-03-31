-- ============================================================
-- Moomarket: Fix/recreate the on_auth_user_created trigger
-- and backfill any existing auth users missing a public.users row.
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste → Run
-- ============================================================

-- STEP 1: Recreate the trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    role,
    is_phone_verified,
    is_email_verified,
    is_id_verified,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      -- only allow known roles; default to 'buyer'
      CASE WHEN NEW.raw_user_meta_data->>'role' IN ('buyer', 'seller', 'admin')
           THEN NEW.raw_user_meta_data->>'role'
           ELSE 'buyer'
      END
    )::user_role,
    false,
    (NEW.email_confirmed_at IS NOT NULL),
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING; -- safe re-entrant

  RETURN NEW;
END;
$$;

-- STEP 2: Drop any old version and re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 3: Backfill existing auth users who have no public.users row
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  is_phone_verified,
  is_email_verified,
  is_id_verified,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ) AS full_name,
  COALESCE(
    CASE WHEN au.raw_user_meta_data->>'role' IN ('buyer', 'seller', 'admin')
         THEN au.raw_user_meta_data->>'role'
         ELSE 'buyer'
    END
  )::user_role AS role,
  false  AS is_phone_verified,
  (au.email_confirmed_at IS NOT NULL) AS is_email_verified,
  false  AS is_id_verified,
  COALESCE(au.created_at, NOW()) AS created_at,
  NOW()  AS updated_at
FROM auth.users au
LEFT JOIN public.users pu ON pu.id = au.id
WHERE pu.id IS NULL; -- only insert missing rows

-- Output a summary for confirmation
SELECT
  (SELECT count(*) FROM auth.users)        AS auth_users_total,
  (SELECT count(*) FROM public.users)      AS profile_rows_total;
