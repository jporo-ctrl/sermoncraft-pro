import { supabase } from "./supabase";

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