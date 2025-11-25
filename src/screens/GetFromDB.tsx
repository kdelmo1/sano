import { supabase } from "../lib/supabase";

export default async function getFromDB(
  fromScreen: "feed" | "inbox" | "profile",
  emailHandle: string,
  selectedLocation: string,
  selectedTime: string,
  setPosts: React.Dispatch<React.SetStateAction<PostProps[]>>
) {
  const email = emailHandle + "@ucsc.edu";

  const now = new Date().toISOString();
  
  let query = supabase
    .from("Posts")
    .select()
    .order("startTime", { ascending: true })
    .gt("endTime", now);

  if (fromScreen === "feed") {
    query = query.neq("studentEmail", email);

    if (selectedLocation !== "all") {
      query = query.eq("location", selectedLocation);
    }

    if (selectedTime !== "all") {
      const now = new Date();
      let since = new Date();
      if (selectedTime === "24h") since.setDate(now.getDate() - 1);
      if (selectedTime === "7d") since.setDate(now.getDate() - 7);
      if (selectedTime === "30d") since.setDate(now.getDate() - 30);
      query = query.gte("startTime", since.toISOString());
    }
  } else if (fromScreen === "inbox") {
    query = query.contains("reservation", [emailHandle]);
  } else if (fromScreen === "profile") {
    query = query.eq("studentEmail", email);
  }

  const { data, error } = await query;

  if (error) {
    console.log("err", error);
    setPosts([]);
  } else if (data) {
    // Filter out posts created by the current user so they don't appear in the main feed

    setPosts(
      data.map((val) => {
        let photoUrls: string[] = [];
        if (val["photo_url"]) {
          try {
            photoUrls = JSON.parse(val["photo_url"]);
            if (!Array.isArray(photoUrls)) {
              photoUrls = [];
            }
          } catch (e) {
            photoUrls = [];
          }
        }
        return {
          id: val["postID"],
          location: val["location"],
          startTime: val["startTime"],
          endTime: val["endTime"] || val["startTime"],
          name: val["name"],
          slots: val["slots"] || 1,
          isPoster: fromScreen === "profile",
          fromScreen: fromScreen,
          isFoodGiveaway: val["is_food_giveaway"] || false,
          photoUrls: photoUrls,
        };
      })
    );
  }
}
