import { supabase } from './supabase'
import { CowListing } from '../types/types'

// ============================================
// LISTINGS
// ============================================

/**
 * Fetch all approved listings with optional filters
 */
export async function getListings(filters?: {
    breed?: string
    county?: string
    minPrice?: number
    maxPrice?: number
    isPregnant?: boolean
    status?: string
}) {
    try {
        let query = supabase
            .from('cow_listings')
            .select(`
        *,
        seller:users!seller_id(
            full_name,
            is_phone_verified,
            is_id_verified,
            seller_profile:seller_profiles!user_id(farm_name, rating, verification_status)
        ),
        media:listing_media(media_url, media_type, display_order),
        vet:vet_verifications(is_verified, clinic_name)
      `)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })

        // Apply filters
        if (filters?.breed) {
            query = query.eq('breed', filters.breed)
        }
        if (filters?.county) {
            query = query.eq('county', filters.county)
        }
        if (filters?.minPrice) {
            query = query.gte('price', filters.minPrice)
        }
        if (filters?.maxPrice) {
            query = query.lte('price', filters.maxPrice)
        }
        if (filters?.isPregnant !== undefined) {
            query = query.eq('is_pregnant', filters.isPregnant)
        }

        const { data, error } = await query

        if (error) {
            console.error('Supabase getListings error:', error.message, error.details, error.hint)
            throw error
        }
        return { data, error: null }
    } catch (error: any) {
        console.error('Error fetching listings:', error.message || error)
        return { data: null, error: error as Error }
    }
}

/**
 * Fetch single listing by ID
 */
export async function getListingById(id: string) {
    try {
        const { data, error } = await supabase
            .from('cow_listings')
            .select(`
        *,
        seller:users!seller_id(
            full_name, 
            phone_number,
            is_phone_verified,
            is_id_verified,
            seller_profile:seller_profiles!user_id(farm_name, rating, verification_status)
        ),
        media:listing_media(media_url, media_type, display_order, storage_path),
        vet:vet_verifications(*)
      `)
            .eq('id', id)
            .single()

        if (error) throw error

        // Increment view count
        await supabase.rpc('increment_listing_views', { listing_uuid: id })

        return { data, error: null }
    } catch (error) {
        console.error('Error fetching listing:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Create new listing
 */
export async function createListing(listing: Partial<CowListing>) {
    try {
        const { data, error } = await supabase
            .from('cow_listings')
            .insert([listing])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating listing:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Update existing listing
 */
export async function updateListing(id: string, updates: Partial<CowListing>) {
    try {
        const { data, error } = await supabase
            .from('cow_listings')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating listing:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Delete listing (only drafts)
 */
export async function deleteListing(id: string) {
    try {
        const { error } = await supabase
            .from('cow_listings')
            .delete()
            .eq('id', id)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error deleting listing:', error)
        return { error: error as Error }
    }
}

/**
 * Get seller's listings
 */
export async function getSellerListings(sellerId: string) {
    try {
        const { data, error } = await supabase
            .from('cow_listings')
            .select(`
        *,
        media:listing_media(media_url, media_type, display_order)
      `)
            .eq('seller_id', sellerId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching seller listings:', error)
        return { data: null, error: error as Error }
    }
}

// ============================================
// SAVED LISTINGS
// ============================================

/**
 * Save a listing for a user
 */
export async function saveListing(userId: string, listingId: string) {
    try {
        const { data, error } = await supabase
            .from('saved_listings')
            .insert([{ user_id: userId, listing_id: listingId }])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error saving listing:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Unsave a listing
 */
export async function unsaveListing(userId: string, listingId: string) {
    try {
        const { error } = await supabase
            .from('saved_listings')
            .delete()
            .eq('user_id', userId)
            .eq('listing_id', listingId)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error unsaving listing:', error)
        return { error: error as Error }
    }
}

/**
 * Get user's saved listings
 */
export async function getSavedListings(userId: string) {
    try {
        const { data, error } = await supabase
            .from('saved_listings')
            .select(`
        *,
        listing:cow_listings(
          *,
          media:listing_media(media_url, media_type, display_order)
        )
      `)
            .eq('user_id', userId)
            .order('saved_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching saved listings:', error)
        return { data: null, error: error as Error }
    }
}

// ============================================
// MESSAGES
// ============================================

/**
 * Send a message
 */
export async function sendMessage(
    listingId: string,
    senderId: string,
    receiverId: string,
    content: string
) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .insert([
                {
                    listing_id: listingId,
                    sender_id: senderId,
                    receiver_id: receiverId,
                    content: content,
                },
            ])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error sending message:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Get messages for a user
 */
export async function getMessages(userId: string) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select(`
        *,
        sender:users!sender_id(full_name),
        receiver:users!receiver_id(full_name),
        listing:cow_listings(breed, price)
      `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('sent_at', { ascending: false })

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching messages:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Mark message as read
 */
export async function markMessageAsRead(messageId: string) {
    try {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .eq('id', messageId)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error marking message as read:', error)
        return { error: error as Error }
    }
}

// ============================================
// SELLER PROFILES
// ============================================

/**
 * Get seller profile by user ID
 */
export async function getSellerProfile(userId: string) {
    try {
        const { data, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error fetching seller profile:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Create or update seller profile
 */
export async function createOrUpdateSellerProfile(userId: string, profile: any) {
    try {
        const { data, error } = await supabase
            .from('seller_profiles')
            .upsert({
                user_id: userId,
                ...profile,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating/updating seller profile:', error)
        return { data: null, error: error as Error }
    }
}

// ============================================
// FILE UPLOADS
// ============================================

/**
 * Upload image to Supabase Storage
 */
export async function uploadImage(
    file: File,
    bucket: 'cow-photos' | 'vet-reports' | 'id-documents',
    path: string
) {
    try {
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(path)

        return { data: { path: data.path, url: urlData.publicUrl }, error: null }
    } catch (error) {
        console.error('Error uploading image:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Upload video to Supabase Storage
 */
export async function uploadVideo(file: File, listingId: string, type: 'walking' | 'milking') {
    try {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const fileName = `${timestamp}_${randomStr}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const path = `${listingId}/${type}/${fileName}`

        const { data, error } = await supabase.storage
            .from('cow-videos')
            .upload(path, file, {
                cacheControl: '3600',
                upsert: false,
            })

        if (error) throw error

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('cow-videos')
            .getPublicUrl(path)

        return { data: { path: data.path, url: urlData.publicUrl }, error: null }
    } catch (error) {
        console.error('Error uploading video:', error)
        return { data: null, error: error as Error }
    }
}

/**
 * Add media to listing
 */
export async function addListingMedia(
    listingId: string,
    mediaUrl: string,
    storagePath: string,
    mediaType: 'photo' | 'video_walking' | 'video_milking',
    displayOrder: number
) {
    try {
        const { data, error } = await supabase
            .from('listing_media')
            .insert([
                {
                    listing_id: listingId,
                    media_url: mediaUrl,
                    storage_path: storagePath,
                    media_type: mediaType,
                    display_order: displayOrder,
                },
            ])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error adding listing media:', error)
        return { data: null, error: error as Error }
    }
}

// ============================================
// ADMIN MODERATION
// ============================================

/**
 * Fetch all listings for admin moderation
 */
export async function getAllListingsForAdmin() {
    try {
        const { data, error } = await supabase
            .from('cow_listings')
            .select(`
                *,
                seller:users!seller_id(full_name, email, phone_number),
                media:listing_media(media_url, media_type, display_order, storage_path),
                vet:vet_verifications(*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching admin listings:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Update listing status (Approve/Reject)
 */
export async function updateListingStatus(listingId: string, status: 'approved' | 'rejected' | 'sold', notes?: string) {
    try {
        const { data, error } = await supabase
            .from('cow_listings')
            .update({
                status,
                admin_notes: notes,
                approved_at: status === 'approved' ? new Date().toISOString() : null
            })
            .eq('id', listingId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating listing status:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Get platform metrics for Admin Dashboard
 */
export async function getAdminMetrics() {
    try {
        // Fetch base counts
        const { count: totalListings } = await supabase.from('cow_listings').select('*', { count: 'exact', head: true });
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

        // Fetch top breeds by view count
        const { data: topBreeds } = await supabase
            .from('cow_listings')
            .select('breed, view_count')
            .order('view_count', { ascending: false });

        // Fetch top locations by view count
        const { data: topLocations } = await supabase
            .from('cow_listings')
            .select('county, view_count')
            .order('view_count', { ascending: false });

        // Aggregate locally (PostgREST grouping is limited without RPC)
        const breedStats = (topBreeds || []).reduce((acc: any, curr: any) => {
            acc[curr.breed] = (acc[curr.breed] || 0) + (curr.view_count || 0);
            return acc;
        }, {});

        const locationStats = (topLocations || []).reduce((acc: any, curr: any) => {
            acc[curr.county] = (acc[curr.county] || 0) + (curr.view_count || 0);
            return acc;
        }, {});

        // Format for charts/display
        const formattedBreeds = Object.entries(breedStats)
            .map(([label, value]) => ({ label, value }))
            .sort((a: any, b: any) => b.value - a.value)
            .slice(0, 5);

        const formattedLocations = Object.entries(locationStats)
            .map(([label, value]) => ({ label, value }))
            .sort((a: any, b: any) => b.value - a.value)
            .slice(0, 5);

        const { data: mostViewedListings } = await supabase
            .from('cow_listings')
            .select('id, breed, view_count, price')
            .order('view_count', { ascending: false })
            .limit(5);

        return {
            data: {
                totalListings: totalListings || 0,
                totalUsers: totalUsers || 0,
                topBreeds: formattedBreeds,
                topLocations: formattedLocations,
                mostViewedListings: mostViewedListings || []
            },
            error: null
        };
    } catch (error) {
        console.error('Error fetching admin metrics:', error);
        return { data: null, error: error as Error };
    }
}

/**
 * Delete all media for a listing
 */
export async function deleteListingMedia(listingId: string) {
    try {
        const { error } = await supabase
            .from('listing_media')
            .delete()
            .eq('listing_id', listingId)

        if (error) throw error
        return { error: null }
    } catch (error) {
        console.error('Error deleting listing media:', error)
        return { error: error as Error }
    }
}
