import { supabase } from "../lib/supabase";

export default async function getFromDB(
  fromScreen: "feed" | "inbox" | "profile",
  emailHandle: string,
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
    // Filter out posts created by the current user so they don't appear in the main feed
    query = query.neq("studentEmail", email);
  } else if (fromScreen === "inbox") {
    query = query.contains("reservation", [emailHandle]);
  } else if (fromScreen === "profile") {
    query = query.eq("studentEmail", email);
  }

  const { data, error } = await query;

  if (error) {
    setPosts([]);
  } else if (data) {
    // Filter out posts that are full for users who haven't reserved (only in feed)
    const filteredData = data.filter((val) => {
      if (fromScreen !== "feed") return true;
      const reservationArray: string[] = Array.isArray(val["reservation"])
        ? val["reservation"]
        : [];
      const slots: number = val["slots"] || 1;
      // Keep the post if there is space or if the current user is already reserved
      if (
        reservationArray.length >= slots &&
        !reservationArray.includes(emailHandle)
      ) {
        return false; // hide from feed for users not reserved
      }
      return true;
    });

    const posterEmailSet = new Set(
      filteredData.map((val) => {
        return val["studentEmail"];
      })
    );
    const { data: posterRatings, error: ratingError } = await supabase
      .from("student")
      .select("email, rating, number_of_raters")
      .in("email", [...posterEmailSet]);
    const posterRatingRecord = posterRatings?.reduce((rating, student) => {
      if (student["number_of_raters"] >= 1)
        rating[student["email"]] =
          (student["rating"] / student["number_of_raters"]) * 10;
      else rating[student["email"]] = "X";
      return rating;
    }, {} as Record<string, number | "X">);

    if (ratingError) {}
    else {
      setPosts(
        filteredData.map((val) => {
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
            posterRating: posterRatingRecord?.[val["studentEmail"]],
            reservePostInit: val["reservation"].includes(emailHandle),
            refreshHome: () => {},
          };
        })
      );
    }
  }
}
