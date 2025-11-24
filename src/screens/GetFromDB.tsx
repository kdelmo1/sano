import { supabase } from "../lib/supabase";

export default async function getFromDB(
  fromScreen: "feed" | "inbox" | "profile",
  emailHandle: string,
  setPosts: React.Dispatch<React.SetStateAction<PostProps[]>>,
  selectedLocation: string = "",
  selectedDate: Date | null = null,
  selectedStartTime: Date | null = null,
  selectedEndTime: Date | null = null,
  selectedTag: string | null = null
) {
  const email = emailHandle + "@ucsc.edu";

  const now = new Date().toISOString();

  let query = supabase
    .from("Posts")
    .select()
    .order("startTime", { ascending: true })
    .gt("endTime", now);

  if (fromScreen === "feed") {
    query = query.neq("studentEmail", email).gt("slots", 0);

    if (
      selectedLocation &&
      selectedLocation !== "select location" &&
      selectedLocation !== "All"
    ) {
      query = query.eq("location", selectedLocation);
    }

    // Filter by specific date
    if (selectedDate) {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte("startTime", startOfDay.toISOString())
        .lte("startTime", endOfDay.toISOString());
    }

    // Filter with times
    if (selectedStartTime || selectedEndTime) {
      let S: string | null = null;
      let E: string | null = null;

      if (selectedDate && selectedStartTime) {
        const d = new Date(selectedDate);
        d.setHours(
          selectedStartTime.getHours(),
          selectedStartTime.getMinutes(),
          0,
          0
        );
        S = d.toISOString();
      }

      if (selectedDate && selectedEndTime) {
        const d = new Date(selectedDate);
        d.setHours(
          selectedEndTime.getHours(),
          selectedEndTime.getMinutes(),
          0,
          0
        );
        E = d.toISOString();
      }

      if (S) query = query.gte("endTime", S);
      if (E) query = query.lte("startTime", E);
    }

    console.log(selectedTag);
    if (selectedTag && selectedTag !== "All Tags") {
      query = query.lte("is_food_giveaway", selectedTag === "Food Giveaway");
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
    const posterEmailSet = new Set(
      data.map((val) => {
        return val["studentEmail"];
      })
    );
    const { data: posterRatings, error: ratingError } = await supabase
      .from("student")
      .select("email, rating, number_of_raters")
      .in("email", [...posterEmailSet]);
    const posterRatingRecord = posterRatings?.reduce((rating, student) => {
      if (student["number_of_raters"] >= 5)
        rating[student["email"]] =
          (student["rating"] / student["number_of_raters"]) * 10;
      else rating[student["email"]] = "X";
      return rating;
    }, {} as Record<string, number | "X">);

    // Filter out posts created by the current user so they don't appear in the main feed
    if (ratingError) console.error(ratingError);
    else {
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
            isPoster: fromScreen === "profile",
            fromScreen: fromScreen,
            isFoodGiveaway: val["is_food_giveaway"] || false,
            photoUrls: photoUrls,
            posterRating: posterRatingRecord?.[val["studentEmail"]] || "X",
            reservePostInit: val["reservation"].includes(emailHandle),
            refreshHome: () => {},
          };
        })
      );
    }
  }
}
