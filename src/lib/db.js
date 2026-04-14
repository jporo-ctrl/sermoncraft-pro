import { supabase } from "./supabase";

// ─── SERMONS ─────────────────────────────────────────────────────────────────

export async function fetchSermons(userId) {
  const { data, error } = await supabase
    .from("sermons")
    .select("*")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
  if (error) throw error;
  return data.map(function(s) {
    return {
      id: s.id,
      title: s.title,
      scripture: s.scripture,
      content: s.content,
      tags: s.tags || [],
      sourceTool: s.source_tool,
      sourceTopic: s.source_topic,
      seriesId: s.series_id,
      seriesTitle: s.series_title,
      seriesWeek: s.series_week,
      savedAt: new Date(s.saved_at).toLocaleDateString(),
    };
  });
}

export async function fetchChurchSermons(churchId) {
  const { data: members, error: membersError } = await supabase
    .from("users")
    .select("id")
    .eq("church_id", churchId);
  if (membersError) throw membersError;

  const memberIds = members.map(function(m) { return m.id; });
  if (memberIds.length === 0) return [];

  const { data, error } = await supabase
    .from("sermons")
    .select("*, users(full_name, title)")
    .in("user_id", memberIds)
    .order("saved_at", { ascending: false });
  if (error) throw error;

  return data.map(function(s) {
    return {
      id: s.id,
      title: s.title,
      scripture: s.scripture,
      content: s.content,
      tags: s.tags || [],
      sourceTool: s.source_tool,
      sourceTopic: s.source_topic,
      seriesId: s.series_id,
      seriesTitle: s.series_title,
      seriesWeek: s.series_week,
      savedAt: new Date(s.saved_at).toLocaleDateString(),
      pastorName: s.users ? (s.users.title ? s.users.title + " " + s.users.full_name : s.users.full_name) : "Unknown",
    };
  });
}

export async function insertSermon(userId, sermon) {
  const { data, error } = await supabase
    .from("sermons")
    .insert({
      user_id: userId,
      title: sermon.title || "Untitled Sermon",
      scripture: sermon.scripture || "",
      content: sermon.content || "",
      tags: sermon.tags || [],
      source_tool: sermon.sourceTool || "",
      source_topic: sermon.sourceTopic || "",
      series_id: sermon.seriesId || null,
      series_title: sermon.seriesTitle || null,
      series_week: sermon.seriesWeek || null,
      saved_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateSermon(sermonId, updates) {
  const { error } = await supabase
    .from("sermons")
    .update({
      title: updates.title,
      scripture: updates.scripture,
      content: updates.content,
      status: updates.status,
    })
    .eq("id", sermonId);
  if (error) throw error;
}

export async function deleteSermon(sermonId) {
  const { error } = await supabase
    .from("sermons")
    .delete()
    .eq("id", sermonId);
  if (error) throw error;
}

// ─── SHARED SERMONS ───────────────────────────────────────────────────────────

export async function shareSermon({ title, scripture, content, pastorName, churchName, sermonDate }) {
  var slug = Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
  const { data, error } = await supabase
    .from("shared_sermons")
    .insert({
      slug: slug,
      title: title || "Untitled Sermon",
      scripture: scripture || "",
      content: content || "",
      pastor_name: pastorName || "",
      church_name: churchName || "",
      sermon_date: sermonDate || new Date().toLocaleDateString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data.slug;
}

export async function fetchSharedSermon(slug) {
  const { data, error } = await supabase
    .from("shared_sermons")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

// ─── REFERRALS ────────────────────────────────────────────────────────────────

export function generateReferralCode(userId) {
  var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  var hash = 0;
  for (var i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash) + userId.charCodeAt(i);
    hash |= 0;
  }
  var code = "";
  var n = Math.abs(hash);
  for (var j = 0; j < 6; j++) {
    code += chars[n % chars.length];
    n = Math.floor(n / chars.length) || (n + 7919);
  }
  return code;
}

export async function ensureReferralCode(userId) {
  const { data } = await supabase
    .from("users")
    .select("referral_code")
    .eq("id", userId)
    .single();

  if (data?.referral_code) return data.referral_code;

  var code = generateReferralCode(userId);
  await supabase
    .from("users")
    .update({ referral_code: code })
    .eq("id", userId);

  return code;
}

export async function trackReferral({ referrerCode, referredEmail, referredUserId }) {
  const { data: referrer } = await supabase
    .from("users")
    .select("id")
    .eq("referral_code", referrerCode)
    .single();

  if (!referrer) return null;

  if (referredUserId) {
    await supabase
      .from("users")
      .update({ referred_by: referrerCode })
      .eq("id", referredUserId);
  }

  const { data, error } = await supabase
    .from("referrals")
    .insert({
      referrer_id: referrer.id,
      referred_email: referredEmail || "",
      referred_user_id: referredUserId || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function fetchReferrals(userId) {
  const { data, error } = await supabase
    .from("referrals")
    .select("*")
    .eq("referrer_id", userId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

// ─── CHURCHES ────────────────────────────────────────────────────────────────

export async function fetchChurch(adminId) {
  const { data, error } = await supabase
    .from("churches")
    .select("*")
    .eq("admin_id", adminId)
    .single();
  if (error) return null;
  return data;
}

export async function fetchChurchByMember(churchId) {
  const { data, error } = await supabase
    .from("churches")
    .select("*")
    .eq("id", churchId)
    .single();
  if (error) return null;
  return data;
}

export async function createChurch(adminId, churchData) {
  const { data, error } = await supabase
    .from("churches")
    .insert({
      admin_id: adminId,
      name: churchData.name || "My Church",
      denomination: churchData.denomination || "",
      city: churchData.city || "",
      founded: churchData.founded || null,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase
    .from("users")
    .update({ church_id: data.id, role: "admin" })
    .eq("id", adminId);

  return data;
}

export async function updateChurch(churchId, updates) {
  const { error } = await supabase
    .from("churches")
    .update({
      name: updates.name,
      denomination: updates.denomination,
      city: updates.city,
      founded: updates.founded,
    })
    .eq("id", churchId);
  if (error) throw error;
}

// ─── MEMBERS ─────────────────────────────────────────────────────────────────

export async function fetchChurchMembers(churchId) {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("church_id", churchId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

export async function removeMemberFromChurch(userId) {
  const { error } = await supabase
    .from("users")
    .update({ church_id: null, role: "pastor" })
    .eq("id", userId);
  if (error) throw error;
}

// ─── INVITATIONS ─────────────────────────────────────────────────────────────

export async function fetchInvitations(churchId) {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("church_id", churchId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function sendInvitation(churchId, invitedBy, email, churchName, invitedByName) {
  const { data: existing } = await supabase
    .from("invitations")
    .select("id, status")
    .eq("church_id", churchId)
    .eq("email", email)
    .single();

  if (existing && existing.status === "accepted") {
    throw new Error("This pastor has already joined your church.");
  }

  if (existing && existing.status === "pending") {
    await supabase.from("invitations").delete().eq("id", existing.id);
  }

  const { data, error } = await supabase
    .from("invitations")
    .insert({
      church_id: churchId,
      invited_by: invitedBy,
      email: email,
      role: "pastor",
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;

  const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const base = isLocal ? "https://sermoncraft-pro.vercel.app" : "";

  const emailResponse = await fetch(base + "/api/send-invitation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, churchName: churchName || "your church", invitedByName: invitedByName || "A church admin" }),
  });
  const emailResult = await emailResponse.json();
  console.log("Email API response:", emailResult);
  return data;
}

export async function checkPendingInvitation(email) {
  const { data, error } = await supabase
    .from("invitations")
    .select("*, churches(name, denomination, city)")
    .eq("email", email)
    .eq("status", "pending")
    .single();
  if (error) return null;
  return data;
}

export async function acceptInvitation(invitationId, userId, churchId) {
  await supabase.from("users").update({ church_id: churchId, role: "pastor" }).eq("id", userId);
  await supabase.from("invitations").update({ status: "accepted" }).eq("id", invitationId);
}

export async function declineInvitation(invitationId) {
  await supabase.from("invitations").update({ status: "declined" }).eq("id", invitationId);
}

// ─── SERMON CALENDAR ─────────────────────────────────────────────────────────

export async function fetchCalendarEntries(userId) {
  const { data, error } = await supabase
    .from("sermon_calendar")
    .select("*")
    .eq("user_id", userId)
    .order("service_date", { ascending: true });
  if (error) return [];
  return data;
}

export async function insertCalendarEntry(userId, entry) {
  const { data, error } = await supabase
    .from("sermon_calendar")
    .insert({
      user_id: userId,
      church_id: entry.churchId || null,
      title: entry.title || "",
      scripture: entry.scripture || "",
      series_title: entry.seriesTitle || "",
      service_date: entry.serviceDate,
      status: entry.status || "planned",
      notes: entry.notes || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCalendarEntry(id, updates) {
  const { error } = await supabase
    .from("sermon_calendar")
    .update({
      title: updates.title,
      scripture: updates.scripture,
      series_title: updates.seriesTitle,
      status: updates.status,
      notes: updates.notes,
    })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteCalendarEntry(id) {
  const { error } = await supabase.from("sermon_calendar").delete().eq("id", id);
  if (error) throw error;
}

// ─── PRAYER REQUESTS ─────────────────────────────────────────────────────────

export async function fetchPrayerRequests(churchId) {
  const { data, error } = await supabase
    .from("prayer_requests")
    .select("*")
    .eq("church_id", churchId)
    .order("created_at", { ascending: false });
  if (error) return [];
  return data;
}

export async function insertPrayerRequest(churchId, userId, request) {
  const { data, error } = await supabase
    .from("prayer_requests")
    .insert({
      church_id: churchId,
      submitted_by: userId,
      name: request.name || "Anonymous",
      request: request.request || "",
      is_anonymous: request.isAnonymous || false,
      status: "active",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePrayerStatus(id, status) {
  const { error } = await supabase
    .from("prayer_requests")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────

export async function fetchAttendance(churchId) {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("church_id", churchId)
    .order("service_date", { ascending: false });
  if (error) return [];
  return data;
}

export async function insertAttendance(churchId, entry) {
  const { data, error } = await supabase
    .from("attendance")
    .insert({
      church_id: churchId,
      service_date: entry.serviceDate,
      count: entry.count,
      notes: entry.notes || "",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
