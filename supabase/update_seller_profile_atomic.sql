-- ============================================================
-- Moomarket: Atomic Seller Profile Update RPC
--
-- HOW TO RUN:
--   Supabase Dashboard → SQL Editor → paste entire file → Run
--
-- PURPOSE:
--   Updates public.users AND public.seller_profiles in a
--   single transaction. If either fails, the whole operation
--   is rolled back, preventing inconsistent "half-seller" state.
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_seller_profile_atomic(
    p_user_id         UUID,
    p_full_name       TEXT        DEFAULT NULL,
    p_phone_number    TEXT        DEFAULT NULL,
    p_county          TEXT        DEFAULT NULL,
    p_specific_location TEXT      DEFAULT NULL,
    p_role            TEXT        DEFAULT NULL,
    p_is_id_verified  BOOLEAN     DEFAULT NULL,
    p_farm_name       TEXT        DEFAULT NULL,
    p_farm_location   TEXT        DEFAULT NULL,
    p_verification_status TEXT    DEFAULT NULL,
    p_id_front_url    TEXT        DEFAULT NULL,
    p_id_back_url     TEXT        DEFAULT NULL,
    p_id_front_path   TEXT        DEFAULT NULL,
    p_id_back_path    TEXT        DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_updates  JSONB := '{}'::JSONB;
    v_result        JSONB;
BEGIN
    -- --------------------------------------------------------
    -- 1. Update public.users (only non-null fields)
    -- --------------------------------------------------------
    UPDATE public.users
    SET
        full_name         = COALESCE(p_full_name,         full_name),
        phone_number      = COALESCE(p_phone_number,      phone_number),
        county            = COALESCE(p_county,            county),
        specific_location = COALESCE(p_specific_location, specific_location),
        role              = COALESCE(p_role::user_role,   role),
        is_id_verified    = COALESCE(p_is_id_verified,    is_id_verified),
        updated_at        = NOW()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User with id % not found in public.users', p_user_id;
    END IF;

    -- --------------------------------------------------------
    -- 2. Upsert public.seller_profiles (only when farm data provided)
    -- --------------------------------------------------------
    IF p_farm_name IS NOT NULL OR p_farm_location IS NOT NULL
        OR p_verification_status IS NOT NULL
        OR p_id_front_url IS NOT NULL
    THEN
        INSERT INTO public.seller_profiles (
            user_id,
            county,
            farm_name,
            farm_location,
            verification_status,
            id_front_url,
            id_back_url,
            id_front_path,
            id_back_path,
            updated_at
        )
        VALUES (
            p_user_id,
            COALESCE(p_county,               ''),
            COALESCE(p_farm_name,            ''),
            COALESCE(p_farm_location,        ''),
            COALESCE(p_verification_status,  'pending'),
            p_id_front_url,
            p_id_back_url,
            p_id_front_path,
            p_id_back_path,
            NOW()
        )
        ON CONFLICT (user_id) DO UPDATE SET
            county              = COALESCE(p_county,              seller_profiles.county),
            farm_name           = COALESCE(p_farm_name,          seller_profiles.farm_name),
            farm_location       = COALESCE(p_farm_location,      seller_profiles.farm_location),
            verification_status = COALESCE(p_verification_status,seller_profiles.verification_status),
            id_front_url        = COALESCE(p_id_front_url,       seller_profiles.id_front_url),
            id_back_url         = COALESCE(p_id_back_url,        seller_profiles.id_back_url),
            id_front_path       = COALESCE(p_id_front_path,      seller_profiles.id_front_path),
            id_back_path        = COALESCE(p_id_back_path,       seller_profiles.id_back_path),
            updated_at          = NOW();
    END IF;

    -- --------------------------------------------------------
    -- 3. Return success payload
    -- --------------------------------------------------------
    v_result := jsonb_build_object(
        'success', true,
        'user_id', p_user_id
    );

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    -- Any error causes the whole transaction to roll back automatically
    RAISE;
END;
$$;

-- Grant execution to authenticated users only
GRANT EXECUTE ON FUNCTION public.update_seller_profile_atomic TO authenticated;

-- Verify the function was created
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name   = 'update_seller_profile_atomic';
