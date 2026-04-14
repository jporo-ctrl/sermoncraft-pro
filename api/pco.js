// /api/pco.js — Consolidated Planning Center integration
// Handles: auth redirect, oauth callback, service plans, congregation data, songs

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = req.query.action || (req.body && req.body.action);
  const clientId = process.env.PCO_CLIENT_ID;
  const clientSecret = process.env.PCO_CLIENT_SECRET;
  const redirectUri = "https://app.sermoncraftpro.com/api/pco";

  // ── DEBUG ──────────────────────────────────────────────────────────────────
  if (action === "debug") {
    return res.status(200).json({
      hasPcoClientId: !!process.env.PCO_CLIENT_ID,
      hasPcoClientSecret: !!process.env.PCO_CLIENT_SECRET,
      clientIdLength: (process.env.PCO_CLIENT_ID || "").length,
    });
  }

  // ── TOKEN DEBUG — test what a token can access ─────────────────────────────
  if (action === "token-debug") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "No access token" });
    const headers = { "Authorization": "Bearer " + accessToken };
    const [meResp, servicesResp] = await Promise.all([
      fetch("https://api.planningcenteronline.com/people/v2/me", { headers }),
      fetch("https://api.planningcenteronline.com/services/v2/service_types?per_page=1", { headers }),
    ]);
    const meData = await meResp.json();
    const servicesData = await servicesResp.json();
    return res.status(200).json({
      me: { status: meResp.status, data: meData },
      services: { status: servicesResp.status, data: servicesData },
    });
  }

  // ── AUTH REDIRECT ──────────────────────────────────────────────────────────
  if (action === "auth") {
    if (!clientId) return res.status(500).json({ error: "PCO not configured" });
    const userId = req.query.userId || "unknown";
    const crypto = await import("crypto");

    const codeVerifier = crypto.randomBytes(32).toString("base64url");
    const codeChallenge = crypto.createHash("sha256").update(codeVerifier).digest("base64url");

    const state = encodeURIComponent(userId) + "|" + codeVerifier;

    const url =
      "https://api.planningcenteronline.com/oauth/authorize" +
      "?client_id=" + clientId +
      "&redirect_uri=" + encodeURIComponent(redirectUri) +
      "&response_type=code" +
      "&scope=" + encodeURIComponent("services people") +
      "&code_challenge=" + codeChallenge +
      "&code_challenge_method=S256" +
      "&state=" + encodeURIComponent(state);
    return res.redirect(url);
  }

  // ── OAUTH CALLBACK ─────────────────────────────────────────────────────────
  if (action === "callback" || req.query.code) {
    const code = req.query.code;
    const rawState = req.query.state || "";
    const error = req.query.error;

    if (error || !code) {
      return res.redirect("https://app.sermoncraftpro.com?pco=denied");
    }

    const decodedState = decodeURIComponent(rawState);
    const pipIdx = decodedState.indexOf("|");
    const userId = pipIdx >= 0 ? decodedState.slice(0, pipIdx) : decodedState;
    const codeVerifier = pipIdx >= 0 ? decodedState.slice(pipIdx + 1) : "";

    try {
      const tokenBody = new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        client_id: clientId,
        redirect_uri: redirectUri,
        ...(codeVerifier ? { code_verifier: codeVerifier } : {}),
      });

      const tokenResponse = await fetch("https://api.planningcenteronline.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: tokenBody.toString(),
      });

      const tokenData = await tokenResponse.json();

      if (!tokenResponse.ok || !tokenData.access_token) {
        console.error("PCO token error:", tokenData);
        return res.redirect("https://app.sermoncraftpro.com?pco=error");
      }

      const encoded = encodeURIComponent(tokenData.access_token);
      return res.redirect(
        "https://app.sermoncraftpro.com?pco=connected&pco_token=" + encoded + "&pco_user=" + encodeURIComponent(userId)
      );

    } catch (err) {
      console.error("PCO callback error:", err);
      return res.redirect("https://app.sermoncraftpro.com?pco=error");
    }
  }

  // ── SONGS — fetch song details for a specific plan ─────────────────────────
  if (action === "songs") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    const { accessToken, serviceTypeId, planId } = req.body;
    if (!accessToken || !serviceTypeId || !planId) {
      return res.status(400).json({ error: "accessToken, serviceTypeId, and planId are required" });
    }

    try {
      const headers = { "Authorization": "Bearer " + accessToken };

      // Fetch all items for this plan with song relationships included
      const itemsResp = await fetch(
        "https://api.planningcenteronline.com/services/v2/service_types/" + serviceTypeId +
        "/plans/" + planId + "/items?per_page=50&include=song,arrangement",
        { headers }
      );
      const itemsData = await itemsResp.json();

      if (!itemsResp.ok) {
        return res.status(itemsResp.status).json({ error: "Failed to fetch plan items", details: itemsData });
      }

      // Build a map of included songs and arrangements
      var includedSongs = {};
      var includedArrangements = {};
      (itemsData.included || []).forEach(function(inc) {
        if (inc.type === "Song") {
          includedSongs[inc.id] = inc.attributes;
        }
        if (inc.type === "Arrangement") {
          includedArrangements[inc.id] = inc.attributes;
        }
      });

      // Filter for song items only and map fields
      var songs = [];
      (itemsData.data || []).forEach(function(item) {
        if (item.attributes.item_type !== "song") return;

        var songRel = item.relationships && item.relationships.song && item.relationships.song.data;
        var arrRel = item.relationships && item.relationships.arrangement && item.relationships.arrangement.data;

        var songAttrs = songRel ? includedSongs[songRel.id] : null;
        var arrAttrs = arrRel ? includedArrangements[arrRel.id] : null;

        songs.push({
          id: item.id,
          title: item.attributes.title || (songAttrs && songAttrs.title) || "",
          artist: (songAttrs && songAttrs.author) || "",
          key: (arrAttrs && arrAttrs.key_name) || "",
          bpm: (arrAttrs && arrAttrs.bpm) ? String(Math.round(arrAttrs.bpm)) : "",
          ccli: (songAttrs && songAttrs.ccli_number) ? String(songAttrs.ccli_number) : "",
          sequence: item.attributes.sequence || 0,
          notes: item.attributes.description || "",
        });
      });

      // Sort by sequence order
      songs.sort(function(a, b) { return a.sequence - b.sequence; });

      return res.status(200).json({ songs });

    } catch (err) {
      console.error("PCO songs error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── SERVICES (service plans) ───────────────────────────────────────────────
  if (action === "services") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "No access token" });

    try {
      const headers = { "Authorization": "Bearer " + accessToken };

      const typesResp = await fetch(
        "https://api.planningcenteronline.com/services/v2/service_types?per_page=25",
        { headers }
      );
      const typesData = await typesResp.json();

      if (!typesResp.ok) {
        console.error("PCO service types error:", typesResp.status, JSON.stringify(typesData));
        return res.status(typesResp.status).json({ error: "Failed to fetch service types: " + typesResp.status + " — " + JSON.stringify(typesData).slice(0, 200), details: typesData });
      }

      const serviceTypes = (typesData.data || []).map(function(t) {
        return { id: t.id, name: t.attributes.name };
      });

      var allPlans = [];
      for (var i = 0; i < Math.min(serviceTypes.length, 3); i++) {
        var typeId = serviceTypes[i].id;
        var typeName = serviceTypes[i].name;
        var plansResp = await fetch(
          "https://api.planningcenteronline.com/services/v2/service_types/" + typeId + "/plans?filter=future&per_page=10&order=sort_date",
          { headers }
        );
        var plansData = await plansResp.json();
        if (!plansResp.ok) continue;
        (plansData.data || []).forEach(function(plan) {
          allPlans.push({
            id: plan.id,
            serviceType: typeName,
            serviceTypeId: typeId,
            title: plan.attributes.title || "",
            dates: plan.attributes.dates || "",
            sortDate: plan.attributes.sort_date || "",
            seriesTitle: plan.attributes.series_title || "",
          });
        });
      }

      // Enrich with items
      var enriched = await Promise.all(allPlans.slice(0, 15).map(async function(plan) {
        try {
          var itemsResp = await fetch(
            "https://api.planningcenteronline.com/services/v2/service_types/" + plan.serviceTypeId + "/plans/" + plan.id + "/items?per_page=25",
            { headers }
          );
          var itemsData = await itemsResp.json();
          var items = (itemsData.data || []).map(function(item) {
            return {
              title: item.attributes.title || "",
              type: item.attributes.item_type || "",
              description: item.attributes.description || "",
              sequence: item.attributes.sequence || 0,
            };
          });
          var scripture = "";
          for (var item of items) {
            if (item.description && item.description.match(/\d:\d/)) { scripture = item.description.split("\n")[0].trim(); break; }
            if (item.title && item.title.match(/[A-Z][a-z]+ \d+:\d+/)) { scripture = item.title; break; }
          }
          return Object.assign({}, plan, { items: items, scripture: scripture });
        } catch (e) {
          return Object.assign({}, plan, { items: [], scripture: "" });
        }
      }));

      enriched.sort(function(a, b) { return (a.sortDate || "") > (b.sortDate || "") ? 1 : -1; });
      return res.status(200).json({ serviceTypes, plans: enriched });

    } catch (err) {
      console.error("PCO services error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // ── PEOPLE (congregation data) ─────────────────────────────────────────────
  if (action === "people") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    const { accessToken } = req.body;
    if (!accessToken) return res.status(400).json({ error: "No access token" });

    try {
      const headers = { "Authorization": "Bearer " + accessToken };

      const [peopleResp, groupsResp, orgResp, householdsResp] = await Promise.all([
        fetch("https://api.planningcenteronline.com/people/v2/people?per_page=1", { headers }),
        fetch("https://api.planningcenteronline.com/groups/v2/groups?per_page=25", { headers }).catch(function() { return { ok: false }; }),
        fetch("https://api.planningcenteronline.com/people/v2", { headers }),
        fetch("https://api.planningcenteronline.com/people/v2/households?per_page=1", { headers }),
      ]);

      const peopleData = await peopleResp.json();
      const groupsData = groupsResp.ok ? await groupsResp.json().catch(function() { return { data: [] }; }) : { data: [] };
      const orgData = orgResp.ok ? await orgResp.json() : {};
      const householdsData = householdsResp.ok ? await householdsResp.json() : {};

      return res.status(200).json({
        organizationName: orgData.data?.attributes?.name || "",
        totalMembers: peopleData.meta?.total_count || 0,
        totalHouseholds: householdsData.meta?.total_count || 0,
        groups: (groupsData.data || []).map(function(g) {
          return { name: g.attributes?.name || "", membersCount: g.attributes?.memberships_count || 0 };
        }),
        groupCount: (groupsData.data || []).length,
      });

    } catch (err) {
      console.error("PCO people error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Unknown action: " + action });
}
